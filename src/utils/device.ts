export const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const hasFinePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;
export const isDesktop = () => window.matchMedia("(min-width: 64rem)").matches;
