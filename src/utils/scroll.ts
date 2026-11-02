import type Lenis from "lenis";

// Shared scroll state: Lenis writes it, animation loops read it without
// subscribing to anything, so velocity never causes a React render.
export const scrollState = { velocity: 0 };

let lenis: Lenis | null = null;

export const setLenis = (instance: Lenis | null) => {
  lenis = instance;
};

export function scrollToTarget(target: string | number | HTMLElement, immediate = false) {
  if (lenis) {
    lenis.scrollTo(target, { immediate, force: true, duration: 1.4, easing: (t) => 1 - (1 - t) ** 4 });
    return;
  }
  const top =
    typeof target === "number"
      ? target
      : ((typeof target === "string" ? document.querySelector<HTMLElement>(target) : target)?.getBoundingClientRect().top ?? 0) + window.scrollY;
  window.scrollTo({ top, behavior: "auto" });
}

export function lockScroll(locked: boolean) {
  if (locked) lenis?.stop();
  else lenis?.start();
  document.documentElement.style.overflow = locked ? "hidden" : "";
}
