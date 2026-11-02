"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/animations/gsap";
import { site } from "@/data/site";

/** The closing title card: it holds, then the screen fades to black. */
export function Footer() {
  const root = useRef<HTMLElement>(null);
  const card = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tween = gsap.fromTo(
      card.current,
      { opacity: 1 },
      { opacity: 0, ease: "none", scrollTrigger: { trigger: root.current, start: "top+=45% top", end: "bottom bottom", scrub: true } },
    );
    return () => void tween.scrollTrigger?.kill();
  }, []);

  return (
    <footer ref={root} data-nav="image" className="relative h-[240svh] bg-black">
      <div ref={card} className="sticky top-0 flex h-svh flex-col items-center justify-center gap-2 text-center">
        <p className="text-[0.75rem] tracking-[0.2em]">{site.name}</p>
        <p className="label">Photography / Cinematography</p>
        <p className="label">© {site.year}</p>
        <p className="label text-smoke">{site.location}</p>
      </div>
    </footer>
  );
}
