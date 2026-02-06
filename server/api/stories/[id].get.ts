// server/api/stories/[id].get.ts
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export default defineEventHandler(async (event) => {
    // Captura o ID da URL
    const id = getRouterParam(event, 'id');
    const storyFile = join(process.cwd(), 'server/data/stories', `${id}.json`);

    try {
        const content = await readFile(storyFile, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        throw createError({
            statusCode: 404,
            statusMessage: `A crônica com ID ${id} não foi encontrada nos arquivos.`
        });
    }
});