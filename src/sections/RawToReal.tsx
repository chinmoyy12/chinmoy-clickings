"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/animations/gsap";
import { Frame } from "@/components/Frame";
import { SectionReveal, TextReveal } from "@/components/Reveal";
import { site } from "@/data/site";

export function RawToReal() {
  const [split, setSplit] = useState(78);
  const touched = useRef(false);
  const panel = useRef<HTMLDivElement>(null);
  const { raw, graded, caption } = site.rawReal;

  useEffect(() => {
    // Scroll opens the grade until the visitor takes over with the handle.
    const state = { value: 78 };
    const tween = gsap.to(state, {
      value: 22,
      ease: "none",
      scrollTrigger: { trigger: panel.current, start: "top 75%", end: "bottom 60%", scrub: true },
      onUpdate: () => {
        if (!touched.current) setSplit(state.value);
      },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <section id="raw" data-nav="solid" aria-labelledby="raw-title" className="gutter grid gap-10 pt-24 sm:pt-40 lg:grid-cols-12 lg:items-center lg:gap-6">
      <div className="lg:col-span-4">
        <SectionReveal>
          <p className="label mb-3 text-ember">03 / The grade</p>
        </SectionReveal>
        <div id="raw-title">
          <TextReveal lines={["From raw.", "To real."]} accent={1} className="display type-section" />
        </div>
        <SectionReveal delay={120}>
          <p className="mt-6 max-w-sm text-ash">{caption}</p>
        </SectionReveal>
      </div>

      <div ref={panel} data-cursor="Drag" className="relative aspect-[4/5] touch-pan-y select-none overflow-hidden bg-surface sm:aspect-video lg:col-span-8">
        <Frame image={graded} sizes="(min-width: 1024px) 66vw, 100vw" quality={85} />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}>
          <Frame image={raw} sizes="(min-width: 1024px) 66vw, 100vw" decorative />
        </div>
        <div className="pointer-events-none absolute inset-y-0 w-px bg-ember" style={{ left: `${split}%` }}>
          <span className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember" aria-hidden />
        </div>
        <span className="label absolute left-3 top-3 text-paper">Raw</span>
        <span className="label absolute right-3 top-3 text-paper">Graded</span>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(split)}
          aria-label="Compare the raw frame with the graded frame"
          onChange={(event) => {
            touched.current = true;
            setSplit(Number(event.target.value));
          }}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
    </section>
  );
}
