"use client";

import { AnimatePresence } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { ScrollTrigger } from "@/animations/gsap";
import { darknessWipe } from "@/animations/transitions";
import { Frame } from "@/components/Frame";
import { Lightbox } from "@/components/Lightbox";
import { SectionReveal, TextReveal } from "@/components/Reveal";
import { photoCategories, photos } from "@/data/photos";
import { prefersReducedMotion } from "@/utils/device";
import { pad } from "@/utils/media";

const FILTERS = ["All", ...photoCategories];

export function PhotographyGallery() {
  const [filter, setFilter] = useState("All");
  const [shown, setShown] = useState("All");
  const [open, setOpen] = useState<number | null>(null);
  const curtain = useRef<HTMLDivElement>(null);
  const wiping = useRef(false);

  const list = useMemo(() => (shown === "All" ? photos : photos.filter((photo) => photo.category === shown)), [shown]);

  const choose = (next: string) => {
    if (next === filter || wiping.current) return;
    setFilter(next);
    const swap = () => {
      setShown(next);
      requestAnimationFrame(() => ScrollTrigger.refresh());
    };
    if (prefersReducedMotion() || !curtain.current) {
      swap();
      return;
    }
    wiping.current = true;
    darknessWipe(curtain.current, swap).eventCallback("onComplete", () => {
      wiping.current = false;
    });
  };

  return (
    <section id="photo" data-nav="solid" aria-labelledby="photo-title" className="gutter relative pt-24 sm:pt-40">
      <header className="mb-8 grid gap-6 lg:mb-10 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-6">
          <SectionReveal>
            <p className="label mb-3 text-ember">05 / Photography</p>
          </SectionReveal>
          <div id="photo-title">
            <TextReveal lines={["Stills that", "keep moving."]} accent={1} className="display type-section" />
          </div>
        </div>
        <SectionReveal className="lg:col-span-6">
          <div role="group" aria-label="Filter photographs by category" className="-mx-[var(--gutter)] flex gap-5 overflow-x-auto px-[var(--gutter)] [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:justify-end lg:gap-x-6 lg:gap-y-1 lg:overflow-visible lg:px-0">
            {FILTERS.map((name) => (
              <button key={name} type="button" aria-pressed={filter === name} aria-current={filter === name ? "true" : undefined} onClick={() => choose(name)} className={`sweep label shrink-0 py-3 transition-colors duration-300 lg:py-1 ${filter === name ? "text-ember" : "hover:text-paper"}`}>
                {name}
              </button>
            ))}
          </div>
        </SectionReveal>
      </header>

      <p className="sr-only" role="status">
        Showing {list.length} {list.length === 1 ? "photograph" : "photographs"}
        {shown === "All" ? "" : ` in ${shown}`}
      </p>

      <div className="relative">
        <ul className="grid grid-cols-2 gap-x-3 gap-y-5 lg:grid-cols-3 lg:gap-x-4 lg:gap-y-8">
          {list.map((photo, i) => (
            <li key={photo.id} className="gallery-item">
              <button type="button" onClick={() => setOpen(i)} aria-label={`Open ${photo.title}, ${photo.category}`} className="zoom-host group relative block aspect-[4/5] w-full overflow-hidden bg-surface sm:aspect-[4/3]">
                <div className="zoom-img absolute inset-0">
                  <Frame image={photo} sizes="(min-width: 1024px) 33vw, 50vw" />
                </div>
                <span className="absolute inset-0 border border-transparent transition-colors duration-300 group-hover:border-ember group-focus-visible:border-ember" aria-hidden />
              </button>
              <div className="mt-2 flex items-baseline justify-between gap-3">
                <p className="display truncate text-[clamp(1.125rem,1.8vw,1.625rem)] leading-none">{photo.title}</p>
                <p className="label tabular-nums text-ember">{pad(photos.indexOf(photo) + 1)}</p>
              </div>
              <p className="label mt-1">{photo.category}</p>
            </li>
          ))}
        </ul>
        <div ref={curtain} className="invisible absolute inset-0 z-10 bg-ink" aria-hidden />
      </div>

      <AnimatePresence>{open !== null && <Lightbox items={list} start={open} onClose={() => setOpen(null)} />}</AnimatePresence>
    </section>
  );
}
