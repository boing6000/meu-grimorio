import type { MessageDesignTokens } from '@primeuix/themes/types/message';

 export default {
    icon: {
        lg: {
            size: "1.25rem"
        },
        sm: {
            size: "1rem"
        },
        size: "1.125rem"
    },
    root: {
        borderWidth: "1px",
        borderRadius: "{content.border.radius}",
        transitionDuration: "{transition.duration}"
    },
    text: {
        lg: {
            fontSize: "1.125rem"
        },
        sm: {
            fontSize: "0.875rem"
        },
        fontSize: "1rem",
        fontWeight: "500"
    },
    simple: {
        content: {
            padding: "0"
        }
    },
    content: {
        lg: {
            padding: "0.625rem 0.875rem"
        },
        sm: {
            padding: "0.375rem 0.625rem"
        },
        gap: "0.5rem",
        padding: "0.5rem 0.75rem"
    },
    outlined: {
        root: {
            borderWidth: "1px"
        }
    },
    closeIcon: {
        lg: {
            size: "1.125rem"
        },
        sm: {
            size: "0.875rem"
        },
        size: "1rem"
    },
    closeButton: {
        width: "1.75rem",
        height: "1.75rem",
        focusRing: {
            style: "{focus.ring.style}",
            width: "{focus.ring.width}",
            offset: "{focus.ring.offset}"
        },
        borderRadius: "50%"
    },
    colorScheme: {
        dark: {
            info: {
                color: "{blue.500}",
                shadow: "0 4px 8px 0 rgba(2, 5, 10, 0.04)",
                simple: {
                    color: "{blue.500}"
                },
                outlined: {
                    color: "{blue.500}",
                    borderColor: "{blue.500}"
                },
                background: "color-mix(in srgb, {blue.500}, transparent 84%)",
                borderColor: "color-mix(in srgb, {blue.700}, transparent 64%)",
                closeButton: {
                    focusRing: {
                        color: "{blue.500}",
                        shadow: "none"
                    },
                    hoverBackground: "rgba(255, 255, 255, 0.05)"
                }
            },
            warn: {
                color: "{yellow.500}",
                shadow: "0 4px 8px 0 rgba(9, 7, 0, 0.04)",
                simple: {
                    color: "{yellow.500}"
                },
                outlined: {
                    color: "{yellow.500}",
                    borderColor: "{yellow.500}"
                },
                background: "color-mix(in srgb, {yellow.500}, transparent 84%)",
                borderColor: "color-mix(in srgb, {yellow.700}, transparent 64%)",
                closeButton: {
                    focusRing: {
                        color: "{yellow.500}",
                        shadow: "none"
                    },
                    hoverBackground: "rgba(255, 255, 255, 0.05)"
                }
            },
            error: {
                color: "{red.500}",
                shadow: "0 4px 8px 0 rgba(10, 3, 3, 0.04)",
                simple: {
                    color: "{red.500}"
                },
                outlined: {
                    color: "{red.500}",
                    borderColor: "{red.500}"
                },
                background: "color-mix(in srgb, {red.500}, transparent 84%)",
                borderColor: "color-mix(in srgb, {red.700}, transparent 64%)",
                closeButton: {
                    focusRing: {
                        color: "{red.500}",
                        shadow: "none"
                    },
                    hoverBackground: "rgba(255, 255, 255, 0.05)"
                }
            },
            success: {
                color: "{green.500}",
                shadow: "0 4px 8px 0 rgba(1, 8, 4, 0.04)",
                simple: {
                    color: "{green.500}"
                },
                outlined: {
                    color: "{green.500}",
                    borderColor: "{green.500}"
                },
                background: "color-mix(in srgb, {green.500}, transparent 84%)",
                borderColor: "color-mix(in srgb, {green.700}, transparent 64%)",
                closeButton: {
                    focusRing: {
                        color: "{green.500}",
                        shadow: "none"
                    },
                    hoverBackground: "rgba(255, 255, 255, 0.05)"
                }
            },
            contrast: {
                color: "{surface.950}",
                shadow: "0 4px 8px 0 rgba(0, 0, 1, 0.04)",
                simple: {
                    color: "{surface.0}"
                },
                outlined: {
                    color: "{surface.0}",
                    borderColor: "{surface.0}"
                },
                background: "{surface.0}",
                borderColor: "{surface.100}",
                closeButton: {
                    focusRing: {
                        color: "{surface.950}",
                        shadow: "none"
                    },
                    hoverBackground: "{surface.100}"
                }
            },
            secondary: {
                color: "{surface.300}",
                shadow: "0 4px 8px 0 rgba(4, 5, 6, 0.04)",
                simple: {
                    color: "{surface.400}"
                },
                outlined: {
                    color: "{surface.400}",
                    borderColor: "{surface.400}"
                },
                background: "{surface.800}",
                borderColor: "{surface.700}",
                closeButton: {
                    focusRing: {
                        color: "{surface.300}",
                        shadow: "none"
                    },
                    hoverBackground: "{surface.700}"
                }
            }
        },
        light: {
            info: {
                color: "{blue.600}",
                shadow: "0 4px 8px 0 rgba(2, 5, 10, 0.04)",
                simple: {
                    color: "{blue.600}"
                },
                outlined: {
                    color: "{blue.600}",
                    borderColor: "{blue.600}"
                },
                background: "color-mix(in srgb, {blue.50}, transparent 5%)",
                borderColor: "{blue.200}",
                closeButton: {
                    focusRing: {
                        color: "{blue.600}",
                        shadow: "0 0 0 0 #00000000"
                    },
                    hoverBackground: "{blue.100}"
                }
            },
            warn: {
                color: "{yellow.600}",
                shadow: "0 4px 8px 0 rgba(9, 7, 0, 0.04)",
                simple: {
                    color: "{yellow.600}"
                },
                outlined: {
                    color: "{yellow.600}",
                    borderColor: "{yellow.600}"
                },
                background: "color-mix(in srgb, {yellow.50}, transparent 5%)",
                borderColor: "{yellow.200}",
                closeButton: {
                    focusRing: {
                        color: "{yellow.600}",
                        shadow: "0 0 0 0 #00000000"
                    },
                    hoverBackground: "{yellow.100}"
                }
            },
            error: {
                color: "{red.600}",
                shadow: "0 4px 8px 0 rgba(10, 3, 3, 0.04)",
                simple: {
                    color: "{red.600}"
                },
                outlined: {
                    color: "{red.600}",
                    borderColor: "{red.600}"
                },
                background: "color-mix(in srgb, {red.50}, transparent 5%)",
                borderColor: "{red.200}",
                closeButton: {
                    focusRing: {
                        color: "{red.600}",
                        shadow: "0 0 0 0 #00000000"
                    },
                    hoverBackground: "{red.100}"
                }
            },
            success: {
                color: "{green.600}",
                shadow: "0 4px 8px 0 rgba(1, 8, 4, 0.04)",
                simple: {
                    color: "{green.600}"
                },
                outlined: {
                    color: "{green.600}",
                    borderColor: "{green.600}"
                },
                background: "color-mix(in srgb, {green.50}, transparent 5%)",
                borderColor: "{green.200}",
                closeButton: {
                    focusRing: {
                        color: "{green.600}",
                        shadow: "0 0 0 0 #00000000"
                    },
                    hoverBackground: "{green.100}"
                }
            },
            contrast: {
                color: "{surface.50}",
                shadow: "0 4px 8px 0 rgba(0, 0, 1, 0.04)",
                simple: {
                    color: "{surface.950}"
                },
                outlined: {
                    color: "{surface.950}",
                    borderColor: "{surface.950}"
                },
                background: "{surface.900}",
                borderColor: "{surface.950}",
                closeButton: {
                    focusRing: {
                        color: "{surface.50}",
                        shadow: "0 0 0 0 #00000000"
                    },
                    hoverBackground: "{surface.800}"
                }
            },
            secondary: {
                color: "{surface.600}",
                shadow: "0 4px 8px 0 rgba(4, 5, 6, 0.04)",
                simple: {
                    color: "{surface.500}"
                },
                outlined: {
                    color: "{surface.500}",
                    borderColor: "{surface.500}"
                },
                background: "{surface.100}",
                borderColor: "{surface.200}",
                closeButton: {
                    focusRing: {
                        color: "{surface.600}",
                        shadow: "0 0 0 0 #00000000"
                    },
                    hoverBackground: "{surface.200}"
                }
            }
        }
    }
} satisfies MessageDesignTokens;