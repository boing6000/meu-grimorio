import type { StepperDesignTokens } from '@primeuix/themes/types/stepper';

 export default {
    root: {
        transitionDuration: "{transition.duration}"
    },
    step: {
        gap: "1rem",
        padding: "0.5rem"
    },
    separator: {
        size: "2px",
        margin: "0 0 0 1rem",
        background: "{content.border.color}",
        activeBackground: "{primary.color}"
    },
    stepTitle: {
        color: "{text.muted.color}",
        fontWeight: "500",
        activeColor: "{primary.color}"
    },
    steppanel: {
        color: "{content.color}",
        indent: "1rem",
        padding: "0",
        background: "{content.background}"
    },
    stepHeader: {
        gap: "0.5rem",
        padding: "0",
        focusRing: {
            color: "{focus.ring.color}",
            style: "{focus.ring.style}",
            width: "{focus.ring.width}",
            offset: "{focus.ring.offset}",
            shadow: "{focus.ring.shadow}"
        },
        borderRadius: "{content.border.radius}"
    },
    stepNumber: {
        size: "2rem",
        color: "{text.muted.color}",
        shadow: "0 0.5px 0 0 rgba(0, 0, 0, 0.06),0 1px 1px 0 rgba(0, 0, 0, 0.12)",
        fontSize: "1.143rem",
        background: "{content.background}",
        fontWeight: "500",
        activeColor: "{primary.color}",
        borderColor: "{content.border.color}",
        borderRadius: "50%",
        activeBackground: "{content.background}",
        activeBorderColor: "{content.border.color}"
    },
    steppanels: {
        padding: "0.875rem 0.5rem 1.125rem 0.5rem"
    }
} satisfies StepperDesignTokens;