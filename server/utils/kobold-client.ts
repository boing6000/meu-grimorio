import { getBasePromptPlain } from './base-prompt';

const getKoboldBaseUrl = () => process.env.KOBOLDCPP_URL || 'http://localhost:5001';

const getKoboldChatUrl = () => process.env.KOBOLDCPP_CHAT_URL || `${getKoboldBaseUrl()}/v1/chat/completions`;

export const shouldUseChatCompletions = () =>
  process.env.KOBOLDCPP_MODE === 'chat' || Boolean(process.env.KOBOLDCPP_CHAT_URL);

export const koboldGenerate = async (payload: Record<string, any>) => {
  const url = `${getKoboldBaseUrl()}/api/v1/generate`;
  return await $fetch(url, { method: 'POST', body: payload });
};

export const koboldChat = async (payload: Record<string, any>) => {
  const url = getKoboldChatUrl();
  return await $fetch(url, { method: 'POST', body: payload });
};

export const buildChatMessages = (story: any, messages: any[], summary: string | undefined, npcName?: string) => {
  const systemParts = [getBasePromptPlain(story)];

  if (summary) {
    systemParts.push(`## Summary of Previous Events\n${summary}`);
  }

  const chatMessages = messages.map((msg) => {
    const isPersona = msg.name === story.persona.name;
    const role = isPersona ? 'user' : 'assistant';
    const entry: Record<string, any> = {
      role,
      content: msg.content
    };
    if (msg.name) entry.name = msg.name;
    return entry;
  });

  if (npcName && npcName !== 'Narrative' && npcName !== story.persona.name) {
    chatMessages.push({
      role: 'system',
      content: `Respond as ${npcName} and stay in character. Format the reply as "${npcName}: <dialog or narration>" without extra labels.`
    });
  }

  return [{ role: 'system', content: systemParts.join('\n\n') }, ...chatMessages];
};
