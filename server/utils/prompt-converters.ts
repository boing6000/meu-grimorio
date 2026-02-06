export type PromptMessage = {
  role: string;
  content: string;
  name?: string;
};

export const PROMPT_PROCESSING_TYPE = {
  NONE: 'none',
  MERGE: 'merge',
  STRICT: 'strict',
} as const;

export type PromptProcessingType = typeof PROMPT_PROCESSING_TYPE[keyof typeof PROMPT_PROCESSING_TYPE];

type MergeOptions = {
  strict: boolean;
};

const normalizeMessage = (message: PromptMessage): PromptMessage => ({
  role: message.role,
  content: message.content ?? '',
  ...(message.name ? { name: message.name } : {}),
});

const mergeMessages = (messages: PromptMessage[], options: MergeOptions) => {
  const merged: PromptMessage[] = [];

  messages.forEach((message) => {
    const normalized = normalizeMessage(message);
    if (options.strict && merged.length > 0 && normalized.role === 'system') {
      normalized.role = 'user';
    }

    const last = merged[merged.length - 1];
    const canMerge = last && last.role === normalized.role && last.name === normalized.name;

    if (canMerge) {
      last.content = `${last.content}\n\n${normalized.content}`.trim();
      return;
    }

    merged.push(normalized);
  });

  return merged;
};

export const postProcessPrompt = (
  messages: PromptMessage[],
  type: PromptProcessingType = PROMPT_PROCESSING_TYPE.NONE,
) => {
  switch (type) {
    case PROMPT_PROCESSING_TYPE.MERGE:
      return mergeMessages(messages, { strict: false });
    case PROMPT_PROCESSING_TYPE.STRICT:
      return mergeMessages(messages, { strict: true });
    case PROMPT_PROCESSING_TYPE.NONE:
    default:
      return messages.map(normalizeMessage);
  }
};

export const convertTextCompletionPrompt = (messages: PromptMessage[]) => {
  const messageStrings = messages.map((message) => {
    if (message.role === 'system') {
      return message.name ? `${message.name}: ${message.content}` : `System: ${message.content}`;
    }

    return `${message.role}: ${message.content}`;
  });

  return `${messageStrings.join('\n')}\nassistant:`;
};
