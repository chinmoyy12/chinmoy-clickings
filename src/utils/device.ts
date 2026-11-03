export const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const hasFinePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;
export const isDesktop = () => window.matchMedia("(min-width: 64rem)").matches;

/** three.js needs WebGL2; without it the 3D scenes stay hidden and their fallbacks show. */
export function canUseWebGL() {
  try {
    return Boolean(document.createElement("canvas").getContext("webgl2"));
  } catch {
    return false;
  }
}

export type Power = "high" | "mid" | "low";

/** One decision for every heavy effect: high gets everything, mid the essentials, low stays static. */
export function devicePower(): Power {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (prefersReducedMotion() || nav.connection?.saveData) return "low";
  if ((nav.deviceMemory ?? 8) < 4 || (nav.hardwareConcurrency ?? 8) < 4) return "low";
  return hasFinePointer() && window.innerWidth >= 1024 ? "high" : "mid";
}
