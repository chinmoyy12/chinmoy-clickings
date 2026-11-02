"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/animations/gsap";
import { prefersReducedMotion } from "@/utils/device";

/** A statement whose words light up one by one as it scrolls through the viewport. */
export function ScrollWords({ text, className }: { text: string; className?: string }) {
  const root = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (prefersReducedMotion() || !root.current) return;
    const tween = gsap.fromTo(root.current.children, { opacity: 0.14 }, { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: root.current, start: "top 82%", end: "bottom 50%", scrub: 0.4 } });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <p ref={root} className={className} aria-label={text}>
      {text.split(" ").map((word, i) => (
        <span key={i} aria-hidden className="inline-block whitespace-pre">
          {word}{" "}
        </span>
      ))}
    </p>
  );
}
