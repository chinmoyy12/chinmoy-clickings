"use client";

import { useRef, useState } from "react";
import { Frame } from "@/components/Frame";
import { SectionReveal, TextReveal } from "@/components/Reveal";
import { site } from "@/data/site";

const clamp = (value: number) => Math.min(100, Math.max(0, value));

export function RawToReal() {
  const [split, setSplit] = useState(50);
  const dragging = useRef(false);
  const panel = useRef<HTMLDivElement>(null);
  const { before, after, caption, beforeLabel, afterLabel } = site.comparison;

  const moveTo = (clientX: number) => {
    const box = panel.current?.getBoundingClientRect();
    if (box) setSplit(clamp(((clientX - box.left) / box.width) * 100));
  };

  const onKey = (event: React.KeyboardEvent) => {
    const step = event.shiftKey ? 10 : 2;
    const next: Record<string, number> = { ArrowLeft: split - step, ArrowDown: split - step, ArrowRight: split + step, ArrowUp: split + step, Home: 0, End: 100 };
    if (!(event.key in next)) return;
    event.preventDefault();
    setSplit(clamp(next[event.key]));
  };

  return (
    <section id="raw" data-nav="solid" aria-labelledby="raw-title" className="gutter grid gap-10 pt-24 sm:pt-40 lg:grid-cols-12 lg:items-center lg:gap-6">
      <div className="lg:col-span-6">
        <SectionReveal>
          <p className="label mb-3 text-ember">06 / The edit</p>
        </SectionReveal>
        <div id="raw-title">
          <TextReveal lines={["From raw.", "To real."]} accent={1} className="display type-section" />
        </div>
        <SectionReveal delay={120}>
          <p className="mt-6 max-w-sm text-ash">{caption}</p>
        </SectionReveal>
      </div>

      <div
        ref={panel}
        onPointerDown={(event) => {
          dragging.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          moveTo(event.clientX);
        }}
        onPointerMove={(event) => dragging.current && moveTo(event.clientX)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
        className="relative mx-auto aspect-[2/3] max-h-[86svh] w-full max-w-[32rem] cursor-ew-resize touch-pan-y select-none overflow-hidden rounded-2xl bg-surface lg:col-span-5 lg:col-start-8"
      >
        <Frame image={after} sizes="(min-width: 1024px) 34vw, 100vw" quality={85} />
        <div className="absolute inset-0" data-before style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}>
          <Frame image={before} sizes="(min-width: 1024px) 34vw, 100vw" decorative />
        </div>
        <span className="label absolute left-3 top-3 bg-black/75 px-2 py-1 text-paper">{beforeLabel}</span>
        <span className="label absolute right-3 top-3 bg-black/75 px-2 py-1 text-paper">{afterLabel}</span>
        <div className="pointer-events-none absolute inset-y-0 w-px bg-ember" style={{ left: `${split}%` }}>
          <div
            role="slider"
            tabIndex={0}
            aria-label={`Compare ${beforeLabel} and ${afterLabel}`}
            aria-orientation="horizontal"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(split)}
            aria-valuetext={`${Math.round(split)}% ${beforeLabel}`}
            onKeyDown={onKey}
            className="pointer-events-auto absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 touch-none items-center justify-center rounded-full bg-ember text-lg text-black"
          >
            <span aria-hidden>↔</span>
          </div>
        </div>
      </div>
    </section>
  );
}
