import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import {
    buildChatMessages,
    koboldChat,
    koboldGenerate,
    shouldUseChatCompletions,
    getBasePrompt,
    postProcessPrompt,
    PROMPT_PROCESSING_TYPE
} from '~~/server/utils';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id') as string;
    const body = await readBody(event);
    const { is_retry } = body;

    const dataDir = join(process.cwd(), 'server/data');
    const storyFile = join(dataDir, 'stories', `${id}.json`);
    const chatDir = join(dataDir, 'chats', id);
    const indexFile = join(chatDir, 'index.json');

    try {
        const story = JSON.parse(await readFile(storyFile, 'utf-8'));
        const chatIndex = JSON.parse(await readFile(indexFile, 'utf-8'));
        const currentChunkPath = join(chatDir, `chunk_${chatIndex.current_chunk}.json`);
        let messages = JSON.parse(await readFile(currentChunkPath, 'utf-8'));

        // --- 1. REGISTRO DA AÇÃO ---
        if (!is_retry) {
            const newUserMsg = {
                role: body.npc_name === 'Narrative' ? 'system' : 'user',
                name: body.npc_name,
                content: body.content,
                created_at: new Date().toISOString()
            };
            messages.push(newUserMsg);
        }

        const useChatCompletions = shouldUseChatCompletions();
        const promptProcessingType = body.custom_prompt_post_processing ?? PROMPT_PROCESSING_TYPE.NONE;
        const processedMessages = postProcessPrompt(messages, promptProcessingType);
        // --- 2. CONSTRUÇÃO DO PROMPT (ESTILO LUCID NATIVE) ---
        let prompt = getBasePrompt(story);

        if (chatIndex.summary) {
            prompt += `\n\n## Summary of Previous Events\n${chatIndex.summary}\n\n`;
        }

        // Mapeamos as mensagens usando os headers nativos da Lucid
        processedMessages.forEach((msg: any) => {
            const isNarrative = msg.name === 'Narrative';
            const header = isNarrative
                ? '<|start_header_id|>writer narrative<|end_header_id|>'
                : `<|start_header_id|>writer character ${msg.name}<|end_header_id|>`;

            prompt += `\n${header}\n\n${msg.content}<|eot_id|>`;
        });

        // --- 3. GATILHO DE RESPOSTA (FORÇANDO O PAPEL) ---
        // Se o usuário selecionou um NPC específico, forçamos a IA a entrar na pele dele
        if (body.npc_name === story.persona.name) {
			// Se quem falou por último foi o JOGADOR, queremos que a IA decida quem responde.
			// Não fechamos o header aqui, apenas damos o espaço para ela gerar o próximo.
			//prompt += `\n`; 
			// Opcionalmente, podemos sugerir que ela escolha um NPC:
			prompt += `<|start_header_id|>writer<|end_header_id|>\n\n`;
		} else if (body.npc_name !== 'Narrative') {
			// Se você selecionou um NPC específico para falar (ex: Lisa), forçamos ela.
			prompt += `\n<|start_header_id|>writer character ${body.npc_name}<|end_header_id|>\n\n`;
		} else {
			// Se você selecionou Narrative, ela continua narrando.
			prompt += `\n<|start_header_id|>writer narrative<|end_header_id|>\n\n`;
		}

        // --- 4. MONITORAMENTO DE TOKENS E SUMARIZAÇÃO ---
        const limit = 8192;
        const trigger = limit - 600;
        const lastTokens = chatIndex.stats?.prompt_tokens || 0;

        if (lastTokens >= trigger) {
            // RITUAL DE RESUMO USANDO O FORMATO LUCID
            let summaryBase = processedMessages.map((m: any) => `${m.name}: ${m.content}`).join('\n');
            const summaryPrompt = `${prompt}\n<|start_header_id|>user<|end_header_id|>\n\nSummarize the story so far into a single dense paragraph. Preserve current character locations and goals.<|eot_id|>\n<|start_header_id|>assistant<|end_header_id|>\n\n`;

            let newSummary = '';
            if (useChatCompletions) {
                const summaryMessages = buildChatMessages(story, processedMessages, chatIndex.summary);
                summaryMessages.push({
                    role: 'user',
                    content: 'Summarize the story so far into a single dense paragraph. Preserve current character locations and goals.'
                });
                const summaryRaw: any = await koboldChat({
                    model: process.env.KOBOLDCPP_MODEL || 'lucid-v1-nemo',
                    messages: summaryMessages,
                    max_tokens: 500,
                    temperature: 0.3
                });
                newSummary = summaryRaw.choices?.[0]?.message?.content?.trim() || '';
            } else {
                const summaryRaw: any = await koboldGenerate({
                    prompt: summaryPrompt,
                    max_length: 500,
                    temperature: 0.3
                });
                newSummary = summaryRaw.results?.[0]?.text?.trim() || '';
            }
            chatIndex.summary = (chatIndex.summary ? chatIndex.summary + "\n" : "") + newSummary;
            chatIndex.current_chunk += 1;

            await writeFile(currentChunkPath, JSON.stringify(messages, null, 2));
            messages = [];
            const nextChunkPath = join(chatDir, `chunk_${chatIndex.current_chunk}.json`);
            await writeFile(nextChunkPath, JSON.stringify([], null, 2));

            // Reinicia o prompt com o novo resumo
            prompt = getBasePrompt(story) + `\n\n## Story Summary\n${chatIndex.summary}\n\n<|start_header_id|>writer narrative<|end_header_id|>\n\nThe chronicle continues...<|eot_id|>`;
        }

        const characterStops = story.characters.map((char: any) => `<|start_header_id|>writer character ${char.name}<|end_header_id|>`);

        // --- 5. CHAMADA AO KOBOLDCPP (COM MIN_P E PARÂMETROS LUCID) ---
        const stopSequences = [
            `${story.persona.name}:`,
            `\\n${story.persona.name}:`,
            '<|eot_id|>',
            `<|start_header_id|>writer character ${story.persona.name}<|end_header_id|>`,
            ...characterStops,
            '<|start_header_id|>user<|end_header_id|>'
        ];

        let aiRawResponse: any;
        if (useChatCompletions) {
            const chatMessages = buildChatMessages(story, processedMessages, chatIndex.summary, body.npc_name);
            aiRawResponse = await koboldChat({
                model: process.env.KOBOLDCPP_MODEL || 'lucid-v1-nemo',
                messages: chatMessages,
                max_tokens: 300,
                temperature: 0.8,
                top_p: 1,
                stop: stopSequences
            });
        } else {
            aiRawResponse = await koboldGenerate({
                prompt: prompt,
                max_context_length: limit,
                max_length: 300, // Equivale ao n_predict do Silly

                // --- SAMPLING DE ELITE (Estilo SillyTavern) ---
                temperature: 0.8,
                top_p: 1,
                min_p: 0.05,       // Essencial para Lucid-Nemo
                top_k: 0,          // Desativado para dar prioridade ao Min-P
                typical: 1,
                tfs: 1,

                // --- PREVENÇÃO DE REPETIÇÃO ---
                rep_pen: 1.05,     // Leve, para não deixar a IA burra
                rep_pen_range: 1024,

                // --- O SEGREDO: DRY SAMPLER ---
                dry_multiplier: 0.8,
                dry_base: 1.75,
                dry_allowed_length: 2,
                dry_sequence_breakers: ["\n", ":", "\"", "*"], // Impede repetição de falas e ações

                // --- ORDEM DOS FILTROS ---
                sampler_order: [6, 0, 1, 3, 4, 2, 5],

                // --- SEQUÊNCIAS DE PARADA ---
                stop_sequence: stopSequences,
                trim_stop: true,   // Remove a sequência de parada do texto final

                // --- OUTROS ---
                stream: false,     // Por enquanto, mantemos falso para processar o JSON
                bypass_eos: false
            });
        }

        // Atualização de Stats real (Usage do Kobold)
        const result = useChatCompletions ? aiRawResponse.choices?.[0] : aiRawResponse.results?.[0];
        chatIndex.stats = {
            ...chatIndex.stats,
            prompt_tokens: result?.prompt_tokens || 0,
            completion_tokens: result?.completion_tokens || 0,
            last_total_tokens: result?.prompt_tokens - result?.completion_tokens || 0
        };
        let aiContent = '';
        if (useChatCompletions) {
            aiContent = result?.message?.content?.trim() || '';
        } else {
            aiContent = result?.text?.trim() || '';
        }

        // --- 6. FRAGMENTAÇÃO E SALVAMENTO (COM EXPURGO DE STOPS) ---
        const newMessages: any[] = [];

// 1. Limpeza Inicial de Tags Globais
        let cleanContent = aiContent
            .replace(/<\|start_header_id\|>writer (?:character|narrative)\s*/g, '')
            .replace(/<\|end_header_id\|>/g, '')
            .replace(/<\|eot_id\|>/g, '')
            .trim();

// 2. O Ritual de Expurgo: Removemos qualquer resquício das stopSequences que sobrou no fim
// Criamos uma lista de strings para limpar, incluindo as que você definiu
        const stringsToTrim = [
            ...stopSequences,
            // Adicionamos variações comuns que a IA às vezes deixa escapar
            '<|start_header_id|>',
            'writer character',
            'writer narrative'
        ];

        stringsToTrim.forEach(stopStr => {
            // Removemos a sequência se ela aparecer no final da string (case insensitive por segurança)
            if (cleanContent.toLowerCase().endsWith(stopStr.toLowerCase())) {
                cleanContent = cleanContent.substring(0, cleanContent.length - stopStr.length).trim();
            }
        });

        const isNpcTarget = body.npc_name !== 'Narrative' && body.npc_name !== story.persona.name;

        if (isNpcTarget) {
            newMessages.push({
                role: 'writer',
                name: body.npc_name,
                content: cleanContent,
                created_at: new Date().toISOString()
            });
        } else {
            // 3. Fragmentação por "Nomes no Topo" ou "Nomes com Dois Pontos"
            const segments = cleanContent.split(/(?:\n|^)([A-Z][\w\s]+)(?::|\n+)(?=[^a-z\n])/gm);

            if (segments.length > 1) {
                if (segments[0].trim()) {
                    newMessages.push({
                        role: 'writer',
                        name: 'Narrative',
                        content: segments[0].trim(),
                        created_at: new Date().toISOString()
                    });
                }

                for (let i = 1; i < segments.length; i += 2) {
                    let name = segments[i].trim();
                    let content = segments[i + 1] ? segments[i + 1].trim() : '';

                    if (!content) continue;

                    // Proteção contra frases de narração longas sendo confundidas com nomes
                    if (name.split(' ').length > 3) {
                        newMessages.push({
                            role: 'writer',
                            name: 'Narrative',
                            content: `${name}\n${content}`,
                            created_at: new Date().toISOString()
                        });
                        continue;
                    }

                    newMessages.push({
                        role: 'writer',
                        name: /^(Narrator|Narrative|Narrador|system)$/i.test(name) ? 'Narrative' : name,
                        content: content,
                        created_at: new Date().toISOString()
                    });
                }
            } else {
                // FALLBACK
                newMessages.push({
                    role: 'writer',
                    name: 'Narrative',
                    content: cleanContent,
                    created_at: new Date().toISOString()
                });
            }
        }

        messages.push(...newMessages);

        // SALVAMENTO
        const finalChunkPath = join(chatDir, `chunk_${chatIndex.current_chunk}.json`);
        await writeFile(finalChunkPath, JSON.stringify(messages, null, 2));
        await writeFile(indexFile, JSON.stringify(chatIndex, null, 2));

        return {
            messages: newMessages,
            stats: chatIndex.stats
        };

    } catch (error: any) {
        throw createError({statusCode: 500, statusMessage: error.message});
    }
});
