"use client";

import { useReveal } from "@/hooks/useReveal";

type TextTag = "h1" | "h2" | "h3" | "p";

/** Masked line-by-line text reveal. Lines are authored, so nothing reflows mid-animation. */
export function TextReveal({ lines, as: Tag = "h2", className, delay }: { lines: string[]; as?: TextTag; className?: string; delay?: number }) {
  const ref = useReveal<HTMLHeadingElement>();
  return (
    <Tag ref={ref} data-reveal="text" className={className} style={{ "--delay": `${delay ?? 0}ms` } as React.CSSProperties}>
      {lines.map((line, i) => (
        <span key={line} className="ml">
          <span style={{ "--i": i } as React.CSSProperties}>{line}</span>
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
