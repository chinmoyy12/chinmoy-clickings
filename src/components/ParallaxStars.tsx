"use client";

import { useEffect, useMemo, useRef } from "react";

// Seeded, so the server and the browser draw the same sky and hydration stays intact.
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function field(count: number, seed: number) {
  const random = seeded(seed);
  return Array.from({ length: count }, () => {
    const warm = random() < 0.12;
    const alpha = (0.35 + random() * 0.65).toFixed(2);
    return `${Math.floor(random() * 2000)}px ${Math.floor(random() * 2000)}px ${warm ? `rgb(255 150 110 / ${alpha})` : `rgb(255 255 255 / ${alpha})`}`;
  }).join(", ");
}

/** Three layers of pixel stars drifting upward at different speeds over a deep, warm sky. Pure CSS, paused off screen. */
export function ParallaxStars({ speed = 1, className = "" }: { speed?: number; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const layers = useMemo(
    () => [
      { size: 1, shadow: field(450, 11), seconds: 50 },
      { size: 2, shadow: field(200, 23), seconds: 100 },
      { size: 3, shadow: field(100, 37), seconds: 150 },
    ],
    [],
  );

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const io = new IntersectionObserver(([entry]) => element.toggleAttribute("data-paused", !entry.isIntersecting));
    io.observe(element);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={root} data-paused className={`stars pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {layers.map((layer) => (
        <div key={layer.size} className="stars-layer" style={{ width: layer.size, height: layer.size, boxShadow: layer.shadow, animationDuration: `${layer.seconds / speed}s` }} />
      ))}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink to-transparent" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink to-transparent" />
    </div>
  );
}
