import { prefersReducedMotion } from "@/utils/device";

export function scrollToTarget(target: string | number, immediate = false) {
  const element = typeof target === "string" ? document.querySelector<HTMLElement>(target) : null;
  const top = typeof target === "number" ? target : (element?.getBoundingClientRect().top ?? 0) + window.scrollY;
  const instant = immediate || prefersReducedMotion();
  window.scrollTo({ top, behavior: instant ? "instant" : "smooth" });
  if (element && !instant) settleOn(element);
}

/** Lazy sections can shift the page mid-journey, so re-aim on landing unless the visitor took over. */
function settleOn(element: HTMLElement, tries = 2) {
  const stop = () => {
    window.removeEventListener("scrollend", land);
    window.removeEventListener("wheel", stop);
    window.removeEventListener("touchstart", stop);
  };
  const land = () => {
    stop();
    const off = element.getBoundingClientRect().top;
    if (Math.abs(off) < 4 || tries === 0) return;
    window.scrollBy({ top: off, behavior: "smooth" });
    settleOn(element, tries - 1);
  };
  window.addEventListener("scrollend", land);
  window.addEventListener("wheel", stop, { passive: true });
  window.addEventListener("touchstart", stop, { passive: true });
}

export function lockScroll(locked: boolean) {
  document.documentElement.style.overflow = locked ? "hidden" : "";
}
