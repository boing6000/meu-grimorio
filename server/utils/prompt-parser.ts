// server/utils/prompt-parser.ts

/**
 * A Arte da Substituição: Transmuta variáveis {{var}} nos nomes reais dos personagens.
 */
export const parsePrompt = (text: string, story: any) => {
    if (!text) return '';

    // 1. Criar o Mapa de Variáveis
    const replacements: Record<string, string> = {
        [`{{${story.persona.variable}}}`]: story.persona.name,
    };

    story.characters.forEach((char: any) => {
        if (char.variable) {
            replacements[`{{${char.variable}}}`] = char.name;
        }
    });

    // 2. Executar a Substituição
    let parsed = text;
    for (const [key, value] of Object.entries(replacements)) {
        // Escapamos as chaves para evitar problemas com caracteres especiais do Regex
        const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        parsed = parsed.replace(new RegExp(escapedKey, 'g'), value);
    }

    return parsed;
};