// server/api/stories/index.get.ts
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export default defineEventHandler(async (event) => {
    const listFile = join(process.cwd(), 'server/data/lista.json');

    try {
        const content = await readFile(listFile, 'utf-8');
        const stories = JSON.parse(content);

        // Ordenar pelas mais recentes primeiro
        return stories.sort((a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    } catch (error) {
        // Se o arquivo não existir (primeira execução), retornamos uma lista vazia
        return [];
    }
});