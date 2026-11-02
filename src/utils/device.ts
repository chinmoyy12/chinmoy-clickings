export type Tier = "full" | "reduced" | "none";

export const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const hasFinePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;
export const isDesktop = () => window.matchMedia("(min-width: 64rem)").matches;

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Decides how much 3D this device should be asked to do. */
export function deviceTier(): Tier {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const lowPower = (nav.deviceMemory ?? 8) < 4 || (nav.hardwareConcurrency ?? 8) < 4 || nav.connection?.saveData === true;
  if (prefersReducedMotion() || lowPower || !hasWebGL() || window.innerWidth < 640) return "none";
  return window.innerWidth < 1024 ? "reduced" : "full";
}
