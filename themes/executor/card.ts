import type { CardDesignTokens } from '@primeuix/themes/types/card';

 export default {
    body: {
        gap: "0.5rem",
        padding: "1.25rem"
    },
    root: {
        color: "{content.color}",
        shadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1),0 1px 2px -1px rgba(0, 0, 0, 0.1)",
        background: "{content.background}",
        borderRadius: "{border.radius.xl}"
    },
    title: {
        fontSize: "1.25rem",
        fontWeight: "500"
    },
    caption: {
        gap: "0.5rem"
    },
    subtitle: {
        color: "{text.muted.color}"
    }
} satisfies CardDesignTokens;