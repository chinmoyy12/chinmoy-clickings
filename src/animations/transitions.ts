import { gsap } from "./gsap";

// The transition vocabulary. Every scene change on the site is built from
// these, so a section never invents its own move.

export const CLIP = {
  full: "inset(0% 0% 0% 0%)",
  fromBottom: "inset(100% 0% 0% 0%)",
};

/** Vertical clip reveal paired with a settling scale: one film scene replacing another. */
export function sceneIn(tl: gsap.core.Timeline, frame: Element, image: Element, at: number, duration = 1) {
  tl.fromTo(frame, { clipPath: CLIP.fromBottom }, { clipPath: CLIP.full, duration, ease: "none" }, at);
  tl.fromTo(image, { scale: 1.18 }, { scale: 1, duration, ease: "none" }, at);
}

/** Depth transition: the outgoing scene recedes and loses light. */
export function sceneOut(tl: gsap.core.Timeline, frame: Element, shade: Element, at: number, duration = 1) {
  tl.to(frame, { scale: 0.93, duration, ease: "none" }, at);
  tl.to(shade, { opacity: 0.72, duration, ease: "none" }, at);
  tl.to(frame, { autoAlpha: 0, duration: duration * 0.2, ease: "none" }, at + duration * 0.8);
}

/** Text mask swap on a scrubbed timeline. */
export function textSwap(tl: gsap.core.Timeline, out: Element[], enter: Element[], at: number, duration = 0.5) {
  if (out.length) tl.to(out, { yPercent: -110, duration, ease: "none" }, at);
  if (enter.length) tl.fromTo(enter, { yPercent: 110 }, { yPercent: 0, duration, ease: "none" }, at + duration * 0.8);
}

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
