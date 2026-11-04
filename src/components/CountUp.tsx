"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/animations/gsap";
import { prefersReducedMotion } from "@/utils/device";

/** A number that counts up from zero the first time it scrolls into view. */
export function CountUp({ value, suffix = "", className = "" }: { value: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion()) return;
    const state = { n: 0 };
    element.textContent = `0${suffix}`;
    const tween = gsap.to(state, {
      n: value,
      duration: 1.8,
      ease: "power2.out",
      paused: true,
      onUpdate: () => void (element.textContent = `${Math.round(state.n)}${suffix}`),
      scrollTrigger: { trigger: element, start: "top 88%", once: true },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [value, suffix]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {value}
      {suffix}
    </span>
  );
}
