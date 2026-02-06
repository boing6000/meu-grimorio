// server/api/stories/chat/[id].get.ts
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id') as string;
    const dataDir = join(process.cwd(), 'server/data');
    const chatDir = join(dataDir, 'chats', id);
    const indexFile = join(chatDir, 'index.json');

    try {
        // 1. Verificar se a pasta do chat existe
        await mkdir(chatDir, { recursive: true });

        try {
            // 2. Tentar ler o index.json do chat
            const indexContent = await readFile(indexFile, 'utf-8');
            const index = JSON.parse(indexContent);

            // Carregar apenas o chunk mais recente para performance
            const lastChunkPath = join(chatDir, `chunk_${index.current_chunk}.json`);
            const messages = JSON.parse(await readFile(lastChunkPath, 'utf-8'));

            return {
                ...index,
                messages // Retorna as mensagens do chunk atual
            };

        } catch (e) {
            // 3. Se for um chat novo, criar o primeiro chunk com o Opening
            const storyFile = join(dataDir, 'stories', `${id}.json`);
            const story = JSON.parse(await readFile(storyFile, 'utf-8'));

            //opening is an array of messages now
            const initialMessages = story.opening.map((msg: any) => ({
                role: 'assistant',
                name: msg.sender_name,
                content: msg.content,
                created_at: new Date().toISOString()
            }));

            const chatIndex = {
                story_id: id,
                current_chunk: 1,
                total_chunks: 1,
                updated_at: new Date().toISOString(),
                stats: { total_messages: initialMessages.length }
            };

            // Salvar o Index e o Primeiro Chunk
            await writeFile(indexFile, JSON.stringify(chatIndex, null, 2));
            await writeFile(join(chatDir, 'chunk_1.json'), JSON.stringify(initialMessages, null, 2));

            return { ...chatIndex, messages: initialMessages };
        }
    } catch (error: any) {
        throw createError({ statusCode: 500, statusMessage: error.message });
    }
});