import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import {parsePrompt, saveImage} from "~~/server/utils";


export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const id = randomUUID();
    const createdAt = new Date().toISOString();

    const dataDir = join(process.cwd(), 'server/data');
    const storiesDir = join(dataDir, 'stories');
    const listFile = join(dataDir, 'lista.json');
    const storyFile = join(storiesDir, `${id}.json`);

    try {

        // 2. Processamento das Imagens (O Ritual da Transmutação)
        const coverUrl = await saveImage(body.cover_base64, 'covers');
        const personaAvatarUrl = await saveImage(body.persona.avatar_base64, 'avatars');

        const processedCharacters = await Promise.all(body.characters.map(async (char: any) => ({
            ...char,
            avatar_url: await saveImage(char.avatar_base64, 'avatars'),
            content_prompt: parsePrompt(char.content, body),
            avatar_base64: undefined // Limpa o Base64 para poupar espaço
        })));

        // 3. Montagem do Objeto Final da Estória
        const fullStory = {
            id,
            name: body.name,
            cover_url: coverUrl || '/default-cover.png',
            created_at: createdAt,

            plot: body.plot,
            setting: body.setting, // Novo Campo!
            style: body.style,

            // Prompts parseados para a IA
            plot_prompt: parsePrompt(body.plot, body),
            setting_prompt: parsePrompt(body.setting, body), // Novo Campo!
            style_prompt: parsePrompt(body.style, body),

            // Opening agora pode ser um Array (conforme o novo create.vue)
            opening: body.opening.map((block: any) => ({
                ...block,
                content: parsePrompt(block.content, body)
            })),

            persona: {
                ...body.persona,
                avatar_url: personaAvatarUrl || '/default-avatar.png',
                content_prompt: parsePrompt(body.persona.content, body),
                avatar_base64: undefined
            },
            characters: processedCharacters
        };

        // 4. Persistência nos Arquivos
        await mkdir(storiesDir, { recursive: true });
        await writeFile(storyFile, JSON.stringify(fullStory, null, 2));

        // 5. Atualizar a Lista Mestre (lista.json)
        let list = [];
        try {
            const listContent = await readFile(listFile, 'utf-8');
            list = JSON.parse(listContent);
        } catch (e) {}

        list.push({
            id,
            name: fullStory.name,
            cover_url: fullStory.cover_url, // Agora a lista sabe a capa!
            created_at: createdAt
        });

        await writeFile(listFile, JSON.stringify(list, null, 2));

        return {
            success: true,
            id,
            message: "A crônica foi forjada e as imagens seladas no tempo!"
        };

    } catch (error: any) {
        throw createError({
            statusCode: 500,
            statusMessage: `Erro na forja: ${error.message}`
        });
    }
});