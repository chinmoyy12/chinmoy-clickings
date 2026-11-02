"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/animations/gsap";

const LINES = ["Light Motion People Places Moments ", "Frames that keep moving "];

/** Two oversized lines that slide against each other as the page scrolls. */
export function KineticBand() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const rows = [...(root.current?.children ?? [])];
      rows.forEach((row, i) => gsap.fromTo(row, { xPercent: i ? -28 : -4 }, { xPercent: i ? -4 : -28, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.5 } }));
    });
    return () => media.revert();
  }, []);

  return (
    <div ref={root} aria-hidden className="overflow-hidden py-16 sm:py-24">
      {LINES.map((line, i) => (
        <p key={line} className={`kinetic ${i ? "kinetic-serif" : ""}`}>
          {line.repeat(3)}
        </p>
      ))}
    </div>
  );
}
