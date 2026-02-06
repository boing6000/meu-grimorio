// server/api/stories/suggest-opening.post.ts

import { getBasePrompt, parsePrompt, koboldChat, koboldGenerate, buildChatMessages, shouldUseChatCompletions } from "~~/server/utils";

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    const processedCharacters = await Promise.all(body.characters.map(async (char: any) => ({
        ...char,
        content_prompt: parsePrompt(char.content, body),
    })));

    // 3. Montagem do Objeto Final da Estória
    const fullStory = {

        // Prompts parseados para a IA
        plot_prompt: parsePrompt(body.plot, body),
        setting_prompt: parsePrompt(body.setting, body), // Novo Campo!
        style_prompt: parsePrompt(body.style, body),

        // Opening agora pode ser um Array (conforme o novo create.vue)
        opening: body.opening,

        persona: {
            ...body.persona,
            content_prompt: parsePrompt(body.persona.content, body),
        },
        characters: processedCharacters
    };

    try {
        let aiText = '';
        if (shouldUseChatCompletions()) {
            const messages = buildChatMessages(fullStory, [], undefined);
            const response: any = await koboldChat({
                model: process.env.KOBOLDCPP_MODEL || 'lucid-v1-nemo',
                messages,
                max_tokens: 400,
                temperature: 0.8,
                stop: ["[SYSTEM]", "###"]
            });
            aiText = response.choices?.[0]?.message?.content?.trim() || '';
        } else {
            let promptParaIA = getBasePrompt(fullStory);
            promptParaIA += `<|start_header_id|>assistant<|end_header_id|>\n\n`;

            const response: any = await koboldGenerate({
                prompt: promptParaIA,
                max_context_length: 2048,
                max_length: 400,
                temperature: 0.8,
                stop_sequence: ["[SYSTEM]", "###"]
            });
            aiText = response.results?.[0]?.text?.trim() || '';
        }

        // 3. Transformar o texto bruto no array que o front-end espera
        const lines = aiText.split('\n').filter(l => l.includes(':'));
        const openingSegments = lines.map(line => {
            const [name, ...contentParts] = line.split(':');
            return {
                sender_name: name.trim(),
                content: contentParts.join(':').trim()
            };
        });

        return openingSegments.length > 0 ? openingSegments : [{ sender_name: 'Narrative', content: aiText }];

    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: "O Oráculo está em silêncio no momento."
        });
    }
});
