import type { TimelineDesignTokens } from '@primeuix/themes/types/timeline';

 export default {
    event: {
        minHeight: "5rem"
    },
    vertical: {
        eventContent: {
            padding: "0 1rem"
        }
    },
    horizontal: {
        eventContent: {
            padding: "1rem 0"
        }
    },
    eventMarker: {
        size: "1.125rem",
        content: {
            size: "0.375rem",
            background: "{primary.color}",
            insetShadow: "0 0.5px 0 0 rgba(0, 0, 0, 0.06),0 1px 1px 0 rgba(0, 0, 0, 0.12)",
            borderRadius: "50%"
        },
        background: "{content.background}",
        borderColor: "{content.border.color}",
        borderWidth: "2px",
        borderRadius: "50%"
    },
    eventConnector: {
        size: "2px",
        color: "{content.border.color}"
    }
} satisfies TimelineDesignTokens;