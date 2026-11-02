"use client";

import { AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/animations/gsap";
import { darknessWipe } from "@/animations/transitions";
import { Frame } from "@/components/Frame";
import { Lightbox } from "@/components/Lightbox";
import { SectionReveal, TextReveal } from "@/components/Reveal";
import { photoCategories, photos } from "@/data/photos";
import { isDesktop, prefersReducedMotion } from "@/utils/device";
import { pad } from "@/utils/media";
import { scrollState, scrollToTarget } from "@/utils/scroll";

const FILTERS = ["All", ...photoCategories];

// The strip travels faster than the page scrolls, so a long sequence stays a short scroll.
const SCROLL_RATIO = 0.42;

// Repeating composition: height (share of the stage), vertical offset, overlap and depth.
const RHYTHM = [
  { h: 74, y: 8, gap: 5, depth: 0.02 },
  { h: 52, y: 40, gap: -3, depth: -0.05 },
  { h: 64, y: 2, gap: 7, depth: 0.04 },
  { h: 46, y: 46, gap: 4, depth: -0.03 },
  { h: 80, y: 14, gap: -2, depth: 0.05 },
  { h: 56, y: 0, gap: 8, depth: -0.04 },
];

export function PhotographyGallery() {
  const [filter, setFilter] = useState("All");
  const [shown, setShown] = useState("All");
  const [open, setOpen] = useState<number | null>(null);
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const curtain = useRef<HTMLDivElement>(null);
  const wiping = useRef(false);

  const list = useMemo(() => (shown === "All" ? photos : photos.filter((p) => p.category === shown)), [shown]);

  const measure = useCallback(() => {
    if (!section.current || !track.current) return;
    if (!isDesktop()) {
      section.current.style.removeProperty("--run");
      return;
    }
    const run = Math.max(0, track.current.scrollWidth - window.innerWidth);
    section.current.style.setProperty("--run", `${Math.round(run * SCROLL_RATIO)}px`);
  }, []);

  useLayoutEffect(() => {
    measure();
  }, [measure, list]);

  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  useEffect(() => {
    const media = gsap.matchMedia();
    media.add("(min-width: 64rem)", () => {
      const reduced = prefersReducedMotion();
      const move = gsap.quickSetter(track.current, "x", "px");
      const skew = gsap.quickTo(track.current, "skewX", { duration: 0.5, ease: "power3" });
      let visible = false;

      const render = (progress: number) => {
        const run = track.current ? track.current.scrollWidth - window.innerWidth : 0;
        move(-run * progress);
        if (reduced) return;
        track.current?.querySelectorAll<HTMLElement>("[data-depth]").forEach((frame) => {
          frame.style.transform = `translate3d(${(Number(frame.dataset.depth) * run * (progress - 0.5)).toFixed(1)}px, 0, 0)`;
        });
      };
      const trigger = ScrollTrigger.create({
        trigger: stage.current,
        start: "top top",
        end: () => `+=${track.current ? (track.current.scrollWidth - window.innerWidth) * SCROLL_RATIO : 0}`,
        onUpdate: (self) => render(self.progress),
        onToggle: (self) => (visible = self.isActive),
      });
      // Scroll speed leans the whole strip, hard-clamped so it can never feel unstable.
      const lean = () => {
        if (visible && !reduced) skew(gsap.utils.clamp(-2.4, 2.4, scrollState.velocity * 0.09));
      };
      gsap.ticker.add(lean);
      return () => {
        gsap.ticker.remove(lean);
        trigger.kill();
        gsap.set(track.current, { clearProps: "transform" });
      };
    });
    return () => media.revert();
  }, []);

  const choose = (next: string) => {
    if (next === filter || wiping.current) return;
    setFilter(next);
    const swap = () => {
      setShown(next);
      // Let the new list lay out under the curtain, then restart the sequence.
      requestAnimationFrame(() => {
        measure();
        ScrollTrigger.refresh();
        if (isDesktop() && stage.current && window.scrollY > stage.current.offsetTop + section.current!.offsetTop) {
          scrollToTarget(section.current!.offsetTop + stage.current.offsetTop, true);
        }
        if (track.current?.parentElement && !isDesktop()) track.current.parentElement.scrollLeft = 0;
      });
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
    <section ref={section} id="photo" data-nav="solid" aria-labelledby="photo-title" className="relative pt-28 sm:pt-44">
      <header className="gutter mb-10 grid grid-cols-4 gap-x-4 sm:grid-cols-8 lg:mb-14 lg:grid-cols-12 lg:items-end">
        <div className="col-span-4 sm:col-span-8 lg:col-span-6">
          <SectionReveal>
            <p className="label mb-5 text-ember">04 / Photography</p>
          </SectionReveal>
          <TextReveal lines={["Stills that", "keep moving."]} accent={1} className="display type-section" />
        </div>
        <SectionReveal className="col-span-4 mt-8 sm:col-span-8 lg:col-span-6 lg:mt-0">
          <div role="group" aria-label="Filter photographs by category" className="-mx-[var(--gutter)] flex gap-5 overflow-x-auto px-[var(--gutter)] [scrollbar-width:none] lg:mx-0 lg:flex-wrap lg:justify-end lg:gap-x-6 lg:gap-y-1 lg:overflow-visible lg:px-0">
            {FILTERS.map((name) => (
              <button key={name} type="button" aria-pressed={filter === name} onClick={() => choose(name)} className={`sweep label shrink-0 py-2 transition-colors duration-500 ${filter === name ? "text-paper" : "hover:text-paper"}`} aria-current={filter === name ? "true" : undefined}>
                {name}
              </button>
            ))}
          </div>
        </SectionReveal>
      </header>

      <div className="lg:h-[calc(100svh+var(--run,0px))]">
        <div ref={stage} className="relative overflow-hidden lg:sticky lg:top-0 lg:h-svh">
          <div className="snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] lg:h-full lg:snap-none lg:overflow-visible">
            <ul ref={track} className="flex w-max items-start gap-3 px-[var(--gutter)] pb-2 will-change-transform max-lg:!transform-none lg:h-full lg:gap-0 lg:px-[10vw] lg:pb-0 lg:pt-[12vh]">
              {list.map((photo, i) => {
                const beat = RHYTHM[i % RHYTHM.length];
                const ratio = photo.width / photo.height;
                return (
                  <li
                    key={photo.id}
                    className="gallery-item relative shrink-0 snap-center"
                    style={{ "--h": `${beat.h}vh`, "--y": `${beat.y}vh`, "--gap": `${beat.gap}vw`, "--ratio": ratio, zIndex: i % 2 ? 2 : 1 } as React.CSSProperties}
                  >
                    <div data-depth={beat.depth} className="will-change-transform">
                      <button type="button" onClick={() => setOpen(i)} data-cursor="Open" aria-label={`Open ${photo.title}, ${photo.category}`} className="zoom-host relative block aspect-[var(--ratio)] w-full overflow-hidden bg-surface">
                        <div className="zoom-img absolute inset-0">
                          <Frame image={photo} sizes="(min-width: 1024px) 50vw, 80vw" />
                        </div>
                      </button>
                      <div className="mt-2 flex justify-between gap-3">
                        <p className="label text-paper">{photo.title}</p>
                        <p className="label tabular-nums text-smoke">{pad(i + 1)}</p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div ref={curtain} className="invisible absolute inset-0 z-10 bg-ink" aria-hidden />
        </div>
      </div>

      <AnimatePresence>{open !== null && <Lightbox items={list} start={open} onClose={() => setOpen(null)} />}</AnimatePresence>
    </section>
  );
}
