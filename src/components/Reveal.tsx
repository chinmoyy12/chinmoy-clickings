"use client";

import { useReveal } from "@/hooks/useReveal";

type TextTag = "h1" | "h2" | "h3" | "p";

/** Each letter flips up in 3D, staggered within its line. Lines are authored, so nothing reflows mid-animation. */
export function TextReveal({ lines, as: Tag = "h2", className, delay, accent = 0 }: { lines: string[]; as?: TextTag; className?: string; delay?: number; accent?: number }) {
  const ref = useReveal<HTMLHeadingElement>();
  return (
    <Tag ref={ref} data-reveal="text" className={className} style={{ "--delay": `${delay ?? 0}ms` } as React.CSSProperties}>
      <span className="sr-only">{lines.join(" ")}</span>
      {lines.map((line, i) => (
        <span key={line} className="ml" aria-hidden>
          <span className={i >= lines.length - accent ? "line red" : "line"} style={{ "--i": i } as React.CSSProperties}>
            {line.split(" ").map((word, w) => (
              <span key={w} className="inline-block whitespace-nowrap">
                {[...word].map((char, c) => (
                  <span key={c} className="ch" style={{ "--c": w * 6 + c } as React.CSSProperties}>
                    {char}
                  </span>
                ))}
                {"\u00a0"}
              </span>
            ))}
          </span>
        </span>
      ))}
    </Tag>
  );
}

export function SectionReveal({ children, className, delay, as: Tag = "div" }: { children: React.ReactNode; className?: string; delay?: number; as?: "div" | "p" | "ul" | "header" }) {
  const ref = useReveal<HTMLDivElement & HTMLParagraphElement & HTMLUListElement>();
  return (
    <Tag ref={ref} data-reveal="fade" className={className} style={{ "--delay": `${delay ?? 0}ms` } as React.CSSProperties}>
      {children}
    </Tag>
  );
}

export function ImageReveal({ children, className, dir = "left", delay }: { children: React.ReactNode; className?: string; dir?: "left" | "up"; delay?: number }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} data-reveal="image" data-dir={dir} className={className} style={{ "--delay": `${delay ?? 0}ms` } as React.CSSProperties}>
      <div className="reveal-clip h-full w-full">
        <div className="reveal-scale h-full w-full">{children}</div>
      </div>
    </div>
  );
}
