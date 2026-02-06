// server/api/stories/chat/[id]/chunk/[num].get.ts
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id') as string;
    const chunkNum = getRouterParam(event, 'num');
    const chunkPath = join(process.cwd(), 'server/data/chats', id, `chunk_${chunkNum}.json`);

    try {
        const content = await readFile(chunkPath, 'utf-8');
        return JSON.parse(content);
    } catch (e) {
        throw createError({ statusCode: 404, statusMessage: "Chunk de memória perdido no tempo." });
    }
});