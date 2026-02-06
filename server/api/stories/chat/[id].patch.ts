// server/api/stories/chat/[id].patch.ts
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id') as string;
    const { index, content } = await readBody(event);

    const chatDir = join(process.cwd(), 'server/data/chats', id);
    const indexFile = join(chatDir, 'index.json');

    try {
        const chatIndex = JSON.parse(await readFile(indexFile, 'utf-8'));
        const currentChunkPath = join(chatDir, `chunk_${chatIndex.current_chunk}.json`);
        const messages = JSON.parse(await readFile(currentChunkPath, 'utf-8'));

        if (messages[index]) {
            messages[index].content = content;
            messages[index].updated_at = new Date().toISOString();
        }

        await writeFile(currentChunkPath, JSON.stringify(messages, null, 2));
        return { success: true };
    } catch (error: any) {
        throw createError({ statusCode: 500, statusMessage: error.message });
    }
});