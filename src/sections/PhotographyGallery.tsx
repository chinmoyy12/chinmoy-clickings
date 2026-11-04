"use client";

import { AnimatePresence } from "framer-motion";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/animations/gsap";
import { Frame } from "@/components/Frame";
import { Lightbox } from "@/components/Lightbox";
import { SectionReveal, TextReveal } from "@/components/Reveal";
import { photoCategories, photos } from "@/data/photos";
import type { Photo } from "@/data/types";
import { prefersReducedMotion } from "@/utils/device";
import { pad } from "@/utils/media";

const FILTERS = ["All", ...photoCategories];

interface Cell {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Shortest-column masonry: every frame keeps its real shape. */
function pack(items: Photo[], width: number) {
  const columns = width < 700 ? 2 : width < 1300 ? 3 : 4;
  const gap = width < 700 ? 12 : 20;
  const w = (width - gap * (columns - 1)) / columns;
  const heights = new Array<number>(columns).fill(0);
  const cells = new Map<string, Cell>();
  for (const photo of items) {
    const column = heights.indexOf(Math.min(...heights));
    const h = (w * photo.height) / photo.width;
    cells.set(photo.id, { x: column * (w + gap), y: heights[column], w, h });
    heights[column] += h + gap;
  }
  return { cells, height: Math.max(0, Math.max(...heights) - gap) };
}

const byPosition = (cells: Map<string, Cell>) => [...cells.entries()].sort((a, b) => a[1].y - b[1].y || a[1].x - b[1].x);

export function PhotographyGallery() {
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState<number | null>(null);
  const [width, setWidth] = useState(0);
  const board = useRef<HTMLDivElement>(null);
  const tiles = useRef(new Map<string, HTMLLIElement>());
  const shownBefore = useRef(new Set<string>());
  const entered = useRef(false);

  const list = useMemo(() => (filter === "All" ? photos : photos.filter((photo) => photo.category === filter)), [filter]);
  const { cells, height } = useMemo(() => pack(list, width), [list, width]);

  // The story section and the wallet can hand over a choice.
  useEffect(() => {
    const onFilter = (event: Event) => setFilter((event as CustomEvent<string>).detail);
    window.addEventListener("cc:filter", onFilter);
    return () => window.removeEventListener("cc:filter", onFilter);
  }, []);

  useEffect(() => {
    const element = board.current;
    if (!element) return;
    const resize = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    resize.observe(element);
    return () => resize.disconnect();
  }, []);

  // Place every tile: new ones focus in, kept ones glide, filtered-out ones fade away.
  useLayoutEffect(() => {
    if (!width) return;
    const still = prefersReducedMotion();
    const ordered = byPosition(cells);
    for (const [id, tile] of tiles.current) {
      const cell = cells.get(id);
      if (!cell) {
        gsap.to(tile, { autoAlpha: 0, scale: 0.88, duration: still ? 0 : 0.35, ease: "power2.in", overwrite: "auto" });
        continue;
      }
      const place = { x: cell.x, y: cell.y, width: cell.w, height: cell.h };
      if (!entered.current) {
        gsap.set(tile, { ...place, autoAlpha: 0 });
      } else if (!shownBefore.current.has(id)) {
        const order = ordered.findIndex(([key]) => key === id);
        gsap.fromTo(
          tile,
          { ...place, autoAlpha: 0, scale: 0.86, filter: still ? "none" : "blur(14px)" },
          { autoAlpha: 1, scale: 1, filter: "blur(0px)", duration: still ? 0 : 0.8, delay: still ? 0 : 0.15 + order * 0.04, ease: "power3.out", overwrite: "auto", clearProps: "filter" },
        );
      } else {
        gsap.to(tile, { ...place, autoAlpha: 1, scale: 1, duration: still ? 0 : 0.7, ease: "power3.out", overwrite: "auto" });
      }
    }
    shownBefore.current = new Set(cells.keys());
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(frame);
  }, [cells, width]);

  // The first arrival: frames rise from below and come into focus, top rows first.
  useEffect(() => {
    const element = board.current;
    if (!element || !width || entered.current) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || entered.current) return;
        io.disconnect();
        entered.current = true;
        const still = prefersReducedMotion();
        byPosition(cells).forEach(([id, cell], i) => {
          const tile = tiles.current.get(id);
          if (!tile) return;
          gsap.fromTo(
            tile,
            { x: cell.x, y: cell.y + (still ? 0 : 90), autoAlpha: 0, filter: still ? "none" : "blur(20px)" },
            { y: cell.y, autoAlpha: 1, filter: "blur(0px)", duration: still ? 0 : 1.2, delay: still ? 0 : i * 0.06, ease: "power3.out", clearProps: "filter" },
          );
        });
      },
      { threshold: 0.05 },
    );
    io.observe(element);
    return () => io.disconnect();
  }, [cells, width]);

  const hover = (tile: HTMLElement, on: boolean) => {
    if (prefersReducedMotion()) return;
    gsap.to(tile.firstElementChild, { scale: on ? 0.96 : 1, duration: 0.45, ease: "power2.out" });
    gsap.to(tile.querySelector(".tint"), { opacity: on ? 0.32 : 0, duration: 0.45 });
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
              <button key={name} type="button" aria-pressed={filter === name} aria-current={filter === name ? "true" : undefined} onClick={() => setFilter(name)} className={`sweep label shrink-0 py-3 transition-colors duration-300 lg:py-1 ${filter === name ? "text-ember" : "hover:text-paper"}`}>
                {name}
              </button>
            ))}
          </div>
        </SectionReveal>
      </header>

      <p className="sr-only" role="status">
        Showing {list.length} {list.length === 1 ? "photograph" : "photographs"}
        {filter === "All" ? "" : ` in ${filter}`}
      </p>

      {/* Until it is measured (and without JavaScript) the gallery is a plain column layout. */}
      <div ref={board} className="relative" style={{ height: width ? height : undefined }}>
        <ul className={width ? undefined : "columns-2 gap-3 lg:columns-3"}>
          {photos.map((photo) => {
            const shown = width ? cells.has(photo.id) : filter === "All" || photo.category === filter;
            const index = list.indexOf(photo);
            return (
              <li
                key={photo.id}
                ref={(node) => void (node ? tiles.current.set(photo.id, node) : tiles.current.delete(photo.id))}
                aria-hidden={!shown}
                className={[shown && "gallery-item", width ? "absolute left-0 top-0 will-change-transform" : "mb-3 break-inside-avoid", !shown && (width ? "pointer-events-none" : "hidden")].filter(Boolean).join(" ")}
                style={width ? undefined : { aspectRatio: `${photo.width} / ${photo.height}` }}
                onPointerEnter={(event) => event.pointerType === "mouse" && hover(event.currentTarget, true)}
                onPointerLeave={(event) => event.pointerType === "mouse" && hover(event.currentTarget, false)}
              >
                <button type="button" tabIndex={shown ? 0 : -1} onClick={() => index >= 0 && setOpen(index)} aria-label={`Open ${photo.title}, ${photo.category}, in full quality`} className="group relative block h-full w-full overflow-hidden rounded-xl bg-surface shadow-[0_18px_40px_-20px_rgb(0_0_0/0.9)]">
                  <Frame image={photo} sizes="(min-width: 1300px) 25vw, (min-width: 700px) 33vw, 50vw" />
                  <span className="tint pointer-events-none absolute inset-0 bg-gradient-to-tr from-ember to-[#ff3d6e] opacity-0 mix-blend-soft-light" aria-hidden />
                  <span className="pointer-events-none absolute inset-0 rounded-xl border border-transparent transition-colors duration-300 group-hover:border-ember group-focus-visible:border-ember" aria-hidden />
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/75 via-black/20 to-transparent p-3 pt-10 text-left transition-opacity duration-300 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100">
                    <span className="min-w-0">
                      <span className="display block truncate text-[clamp(1rem,1.6vw,1.375rem)] leading-none">{photo.title}</span>
                      <span className="label mt-1 block">{photo.category}</span>
                    </span>
                    <span className="label tabular-nums text-ember">{pad(photos.indexOf(photo) + 1)}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <AnimatePresence>{open !== null && <Lightbox items={list} start={open} onClose={() => setOpen(null)} />}</AnimatePresence>
    </section>
  );
}
