"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/animations/gsap";
import { prefersReducedMotion } from "@/utils/device";

const SEEN = "cc:seen";
const MIN = 0.6;
const MAX = 1.3;

/** Black open with real load progress. Repeat visits in a session skip straight to the picture. */
export function PageLoader() {
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    let lifted = false;
    const finish = () => {
      html.dataset.intro = "done";
      sessionStorage.setItem(SEEN, "1");
    };
    const lift = () => {
      if (lifted) return;
      lifted = true;
      gsap.to(root.current, { autoAlpha: 0, duration: 0.7, ease: "none", onStart: finish });
    };
    if (sessionStorage.getItem(SEEN) || prefersReducedMotion()) {
      gsap.to(root.current, { autoAlpha: 0, duration: 0.3, ease: "none", onStart: finish });
      return;
    }

    const images = [...document.images].filter((image) => image.loading !== "lazy");
    const loadedShare = () => (images.length ? images.filter((image) => image.complete).length / images.length : 1);
    const start = performance.now();
    const progress = { value: 0 };

    const tick = () => {
      const elapsed = (performance.now() - start) / 1000;
      const target = Math.min(1, Math.max(Math.min(elapsed / MIN, 0.85) * (loadedShare() === 1 ? 1.18 : 1), elapsed / MAX));
      progress.value += (target - progress.value) * 0.14;
      if (count.current) count.current.textContent = String(Math.round(progress.value * 100)).padStart(3, "0");
      if (bar.current) bar.current.style.transform = `scaleX(${progress.value})`;
      if (progress.value > 0.995) {
        window.clearTimeout(backstop);
        gsap.ticker.remove(tick);
        lift();
      }
    };
    gsap.ticker.add(tick);
    // Animation frames stop in a background tab; a timer still guarantees the reveal.
    const backstop = window.setTimeout(() => {
      gsap.ticker.remove(tick);
      if (root.current) root.current.style.visibility = "hidden";
      lifted = true;
      finish();
    }, (MAX + 0.6) * 1000);
    return () => {
      window.clearTimeout(backstop);
      gsap.ticker.remove(tick);
    };
  }, []);

  return (
    <div ref={root} id="loader" className="fixed inset-0 z-[110] bg-black" aria-hidden>
      <div className="absolute bottom-[var(--gutter)] left-[var(--gutter)] right-[var(--gutter)] flex items-end justify-between gap-6">
        <span className="label">Chinmoy Clickings</span>
        <span ref={count} className="label tabular-nums">
          000
        </span>
      </div>
      <div ref={bar} className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-paper" />
    </div>
  );
}
