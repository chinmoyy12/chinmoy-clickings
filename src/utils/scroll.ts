import { prefersReducedMotion } from "@/utils/device";

export function scrollToTarget(target: string | number, immediate = false) {
  const element = typeof target === "string" ? document.querySelector<HTMLElement>(target) : null;
  const top = typeof target === "number" ? target : (element?.getBoundingClientRect().top ?? 0) + window.scrollY;
  window.scrollTo({ top, behavior: immediate || prefersReducedMotion() ? "instant" : "smooth" });
}

export function lockScroll(locked: boolean) {
  document.documentElement.style.overflow = locked ? "hidden" : "";
}
