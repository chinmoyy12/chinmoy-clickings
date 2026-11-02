"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/animations/gsap";
import { prefersReducedMotion } from "@/utils/device";

const SEEN = "cc:seen";
const MIN = 0.6;
const MAX = 1.3;
const COLORS = ["#e8262d", "#ff7b8a", "#35c7c9", "#a9d4ff", "#f5b25a"];

// Fixed layout (golden angle) so server and client render the same shards.
const SHARDS = Array.from({ length: 14 }, (_, i) => ({ angle: i * 137.5, radius: 58 + (i % 5) * 19, color: COLORS[i % COLORS.length], size: 6 + (i % 3) * 2 }));

/** Black open: a CC monogram with orbiting shards, tied to real load progress. Repeat visits skip it. */
export function PageLoader() {
  const root = useRef<HTMLDivElement>(null);
  const mark = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);

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
      gsap.to(mark.current, { scale: 1.6, opacity: 0, duration: 0.55, ease: "power2.in" });
      gsap.to(root.current, { autoAlpha: 0, duration: 0.6, delay: 0.25, ease: "none", onStart: finish });
    };
    if (sessionStorage.getItem(SEEN) || prefersReducedMotion()) {
      gsap.to(root.current, { autoAlpha: 0, duration: 0.25, ease: "none", onStart: finish });
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
    <div ref={root} id="loader" className="fixed inset-0 z-[110] flex items-center justify-center bg-black" aria-hidden>
      <div ref={mark} className="relative flex h-16 w-16 items-center justify-center">
        <div className="loader-orbit absolute inset-0">
          {SHARDS.map((shard) => (
            <span
              key={shard.angle}
              className="absolute left-1/2 top-1/2"
              style={{
                borderLeft: `${shard.size * 0.5}px solid transparent`,
                borderRight: `${shard.size * 0.5}px solid transparent`,
                borderBottom: `${shard.size}px solid ${shard.color}`,
                transform: `rotate(${shard.angle}deg) translateX(${shard.radius}px) rotate(${shard.angle * 2}deg)`,
              }}
            />
          ))}
        </div>
        <span className="display text-4xl leading-none text-paper">CC</span>
      </div>
      <span ref={count} className="label absolute bottom-[var(--gutter)] right-[var(--gutter)] tabular-nums">
        000
      </span>
    </div>
  );
}
