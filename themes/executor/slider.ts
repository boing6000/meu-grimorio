import type { SliderDesignTokens } from '@primeuix/themes/types/slider';

 export default {
    root: {
        transitionDuration: "{transition.duration}"
    },
    range: {
        background: "{primary.color}"
    },
    track: {
        size: "3px",
        background: "{content.border.color}",
        borderRadius: "{content.border.radius}"
    },
    handle: {
        width: "20px",
        height: "20px",
        content: {
            width: "16px",
            height: "16px",
            shadow: "0 0.5px 0 0 rgba(0, 0, 0, 0.08),0 1px 1px 0 rgba(0, 0, 0, 0.14)",
            borderRadius: "50%",
            hoverBackground: "{content.background}"
        },
        focusRing: {
            color: "{focus.ring.color}",
            style: "{focus.ring.style}",
            width: "{focus.ring.width}",
            offset: "{focus.ring.offset}",
            shadow: "{focus.ring.shadow}"
        },
        background: "{content.border.color}",
        borderRadius: "50%",
        hoverBackground: "{content.border.color}"
    },
    colorScheme: {
        dark: {
            handle: {
                content: {
                    background: "{surface.950}"
                }
            }
        },
        light: {
            handle: {
                content: {
                    background: "{surface.0}"
                }
            }
        }
    }
} satisfies SliderDesignTokens;