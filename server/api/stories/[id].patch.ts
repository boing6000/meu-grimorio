import { writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parsePrompt, saveImage } from "~~/server/utils";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);

  const dataDir = join(process.cwd(), 'server/data');
  const storiesDir = join(dataDir, 'stories');
  const listFile = join(dataDir, 'lista.json');
  const storyFile = join(storiesDir, `${id}.json`);

  try {
    // Read existing story
    const existingContent = await readFile(storyFile, 'utf-8');
    const existing = JSON.parse(existingContent);

    // Process images: if a new base64 is provided, save and use it; otherwise keep existing URLs
    const coverUrl = body.cover_base64 ? await saveImage(body.cover_base64, 'covers') : existing.cover_url;
    const personaAvatarUrl = body.persona?.avatar_base64 ? await saveImage(body.persona.avatar_base64, 'avatars') : existing.persona?.avatar_url;

    const processedCharacters = await Promise.all((body.characters || existing.characters).map(async (char: any, idx: number) => {
      const existingChar = existing.characters[idx] || {};
      const avatarUrl = char.avatar_base64 ? await saveImage(char.avatar_base64, 'avatars') : (char.avatar_url || existingChar.avatar_url || '/default-npc.png');

      return {
        ...char,
        avatar_url: avatarUrl,
        content_prompt: parsePrompt(char.content, body),
        avatar_base64: undefined
      };
    }));

    const updated = {
      ...existing,
      name: body.name ?? existing.name,
      cover_url: coverUrl || existing.cover_url || '/default-cover.png',
      // Re-parse prompts
      plot_prompt: parsePrompt(body.plot ?? existing.plot, body),
      setting_prompt: parsePrompt(body.setting ?? existing.setting, body),
      style_prompt: parsePrompt(body.style ?? existing.style, body),
      opening: (body.opening || existing.opening).map((block: any) => ({ ...block, content: parsePrompt(block.content, body) })),
      persona: {
        ...existing.persona,
        ...(body.persona || {}),
        avatar_url: personaAvatarUrl || existing.persona?.avatar_url || '/default-avatar.png',
        content_prompt: parsePrompt((body.persona && body.persona.content) ?? existing.persona.content, body),
        avatar_base64: undefined
      },
      characters: processedCharacters
    };

    // Persist
    await writeFile(storyFile, JSON.stringify(updated, null, 2));

    // Update lista.json entry
    try {
      const listContent = await readFile(listFile, 'utf-8');
      const list = JSON.parse(listContent);
      const idx = list.findIndex((it: any) => it.id === id);
      if (idx !== -1) {
        list[idx].name = updated.name;
        list[idx].cover_url = updated.cover_url;
        await writeFile(listFile, JSON.stringify(list, null, 2));
      }
    } catch (e) {
      // ignore
    }

    return { success: true, id };
  } catch (error: any) {
    throw createError({ statusCode: 500, statusMessage: `Erro ao atualizar a crônica: ${error.message}` });
  }
});
