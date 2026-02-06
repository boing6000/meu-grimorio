import { existsSync } from 'node:fs';
import { writeFile, mkdir } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';

export async function saveImage(base64: string, subfolder: string) {
    if (!base64 || !base64.startsWith('data:image')) return null;

    const publicDir = join(process.cwd(), 'public/uploads', subfolder);
    if (!existsSync(publicDir)) await mkdir(publicDir, { recursive: true });

    const extension = base64.split(';')[0].split('/')[1] || 'png';
    const fileName = `${randomUUID()}.${extension}`;
    const filePath = join(publicDir, fileName);

    const buffer = Buffer.from(base64.split(',')[1], 'base64');
    await writeFile(filePath, buffer);

    return `/uploads/${subfolder}/${fileName}`;
}