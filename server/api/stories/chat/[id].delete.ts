// server/api/stories/chat/[id].delete.ts
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id') as string;
    const { index, remove_below } = await readBody(event);

    const chatDir = join(process.cwd(), 'server/data/chats', id);
    const indexFile = join(chatDir, 'index.json');

    try {
        // 1. Carregar o Índice para saber qual chunk estamos editando
        // Nota: Em um sistema mais complexo, você buscaria em qual chunk o index reside.
        // Para simplificar, assumimos o chunk atual.
        const chatIndex = JSON.parse(await readFile(indexFile, 'utf-8'));
        const currentChunkPath = join(chatDir, `chunk_${chatIndex.current_chunk}.json`);
        let messages = JSON.parse(await readFile(currentChunkPath, 'utf-8'));

        // 2. Executar a Poda (A remoção)
        if (remove_below) {
            // Remove do índice indicado até o fim do array
            messages = messages.slice(0, index);
        } else {
            // Remove apenas a mensagem específica
            messages.splice(index, 1);
        }

        // 3. Atualizar os arquivos
        await writeFile(currentChunkPath, JSON.stringify(messages, null, 2));

        // Atualizar as estatísticas no índice
        chatIndex.stats.total_messages = messages.length;
        chatIndex.updated_at = new Date().toISOString();
        await writeFile(indexFile, JSON.stringify(chatIndex, null, 2));

        return { success: true, remaining: messages.length };

    } catch (error: any) {
        throw createError({
            statusCode: 500,
            statusMessage: `Erro ao queimar os pergaminhos: ${error.message}`
        });
    }
});