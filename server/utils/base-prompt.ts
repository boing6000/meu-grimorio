const buildCharactersPrompt = (story: any) =>
    story.characters.map((char: any) => {
        return `## ${char.name}\n${char.content_prompt}\n`;
    }).join('\n\n');

const getWritingKind = () => 'role-play';

export const getBasePromptPlain = (story: any) => {
    const charactersPrompt = buildCharactersPrompt(story);
    const writing_kind = getWritingKind();
    const genre_suffix = story.genre ? ` (but you specialize in ${story.genre})` : '';

    return `You are a skilled ${writing_kind} writer and writing assistant with expertise across all genres${genre_suffix}.\n\n` +
        `You will perform several tasks, switching roles as needed:\n` +
        `- Role-playing: Use the 'writer' role to write a role-play based on the provided information and user instructions.\n` +
        `- Use the '<|start_header_id|>writer character <character_name><|end_header_id|>' role for dialog or when acting as a specific character.\n` +
        `- Use the '<|start_header_id|>writer narrative<|end_header_id|>' role for narration.\n` +
        `- Every output must start with a single header that clearly identifies who is speaking: either a character header or the narrative header.\n` +
        `- If multiple speakers are needed, split them into separate blocks, each with its own header and content.\n` +
        `- Do not omit headers, and never output dialogue without a header.\n\n` +
        `Example (single speaker):\n` +
        `<|start_header_id|>writer character Lina<|end_header_id|>\n` +
        `Lina: We should move now.\n\n` +
        `Example (narration):\n` +
        `<|start_header_id|>writer narrative<|end_header_id|>\n` +
        `The docks fall silent as the fog rolls in.\n\n` +
        `Example (multiple speakers):\n` +
        `<|start_header_id|>writer character Lina<|end_header_id|>\n` +
        `Lina: We should move now.\n` +
        `<|start_header_id|>writer character Marco<|end_header_id|>\n` +
        `Marco: Agreed.\n\n` +
        `- Other: Use the 'assistant' role for any other tasks the user may request.\n\n` +
        `# Role-Play Information\n\n` +
        `## Plot\n${story.plot_prompt}\n\n` +
        `## Setting\n${story.setting_prompt}\n\n` +
        `## Writing Style\n${story.style_prompt}\n` +
        `- Use the character's name in the header, not as a prefix in the message body.\n\n` +
        `## Characters\n\n` +
        `## ${story.persona.name} (User Persona)\n` +
        `${story.persona.content_prompt}\n\n` +
        `${charactersPrompt}`;
};

export const getBasePrompt = (story: any) => {
    return `<|start_header_id|>system<|end_header_id|>\n\n` +
        `${getBasePromptPlain(story)}\n` +
        `<|eot_id|>`;
};
