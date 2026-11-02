import { gsap } from "./gsap";

// Shared transition vocabulary, so a section never invents its own move.

export const CLIP_FULL = "inset(0% 0% 0% 0%)";

/** Darkness wipe: a curtain crosses in, the swap happens under it, then it leaves. */
export function darknessWipe(curtain: Element, swap: () => void, axis: "x" | "y" = "x") {
  const scale = axis === "x" ? "scaleX" : "scaleY";
  const [start, end] = axis === "x" ? ["left center", "right center"] : ["center bottom", "center top"];
  return gsap
    .timeline()
    .set(curtain, { [scale]: 0, transformOrigin: start, autoAlpha: 1 })
    .to(curtain, { [scale]: 1, duration: 0.55, ease: "inout" })
    .add(swap)
    .set(curtain, { transformOrigin: end })
    .to(curtain, { [scale]: 0, duration: 0.65, ease: "inout" }, "+=0.06");
}
