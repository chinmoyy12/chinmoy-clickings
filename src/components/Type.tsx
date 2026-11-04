"use client";

import { useReveal } from "@/hooks/useReveal";

/** A heading whose letters fade in, slide up and come into focus one after another as it enters view. */
export function BlurHeading({ text, as: Tag = "h3", className = "", delay = 0 }: { text: string; as?: "h2" | "h3" | "p"; className?: string; delay?: number }) {
  const ref = useReveal<HTMLHeadingElement>();
  let index = 0;
  return (
    <Tag ref={ref} data-reveal="blur" className={`blur-heading ${className}`} style={{ "--delay": `${delay}ms` } as React.CSSProperties}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {text.split(" ").map((word, w) => (
          <span key={w} className="inline-block whitespace-nowrap">
            {[...word].map((char, c) => (
              <span key={c} className="bl" style={{ "--i": index++ } as React.CSSProperties}>
                {char}
              </span>
            ))}
            {" "}
          </span>
        ))}
      </span>
    </Tag>
  );
}

/** A word that gets a hand-drawn underline the first time it scrolls into view. */
export function Scribble({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useReveal<HTMLSpanElement>();
  return (
    <span ref={ref} data-reveal="scribble" className={`relative inline-block whitespace-nowrap ${className}`}>
      {children}
      <svg viewBox="0 0 200 22" preserveAspectRatio="none" className="scribble pointer-events-none absolute -bottom-[0.32em] left-[-4%] h-[0.5em] w-[108%] overflow-visible" aria-hidden>
        <path d="M3 14 C 32 7, 58 18, 88 11 S 146 5, 172 12 S 192 15, 197 9" pathLength={1} />
        <path d="M18 19 C 60 14, 112 17, 160 15" pathLength={1} />
      </svg>
    </span>
  );
}
