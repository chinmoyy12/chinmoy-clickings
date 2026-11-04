"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AmbientBackdrop } from "@/components/AmbientBackdrop";
import { Frame } from "@/components/Frame";
import { TransitionLink } from "@/components/TransitionLink";
import { BlurHeading } from "@/components/Type";
import { photoCategories, photos } from "@/data/photos";
import { hasFinePointer, prefersReducedMotion } from "@/utils/device";
import { optimizedUrl, pad } from "@/utils/media";

const SWIPE = 70;
export const categorySlug = (category: string) => category.toLowerCase();

/** One category of stills on its own page, each shown as the original file in a room lit by the photo. */
export function StillsRoom({ category }: { category: string }) {
  const set = photos.filter((photo) => photo.category === category);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLOListElement>(null);
  const photo = set[index];
  const portrait = photo.height > photo.width;

  const go = (by: number) => {
    setDirection(by);
    setIndex((i) => (i + by + set.length) % set.length);
  };
  const pick = (i: number) => {
    setDirection(i > index ? 1 : -1);
    setIndex(i);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Ready the neighbours, and keep the active thumbnail in view.
  useEffect(() => {
    for (const by of [1, -1]) {
      const next = new window.Image();
      next.src = set[(index + by + set.length) % set.length].src;
    }
    rail.current?.children[index]?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "nearest", inline: "center" });
  }, [index, set]);

  useEffect(() => {
    const element = tilt.current;
    if (!element || !hasFinePointer() || prefersReducedMotion()) return;
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = event.clientX / window.innerWidth - 0.5;
        const y = event.clientY / window.innerHeight - 0.5;
        element.style.transform = `perspective(1800px) rotateY(${(x * 5).toFixed(2)}deg) rotateX(${(-y * 4).toFixed(2)}deg)`;
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <main id="main" className="relative isolate flex min-h-svh flex-col pb-8 pt-24 sm:pt-28">
      <AmbientBackdrop source={image} />

      <div className="gutter flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <TransitionLink href="/" className="label sweep text-paper">
          ← Back to the work
        </TransitionLink>
        <nav aria-label="Categories" className="-mx-[var(--gutter)] flex gap-5 overflow-x-auto px-[var(--gutter)] [scrollbar-width:none] sm:mx-0 sm:px-0">
          {photoCategories.map((name) => (
            <TransitionLink key={name} href={`/stills/${categorySlug(name)}`} aria-current={name === category ? "page" : undefined} className={`sweep label shrink-0 py-2 ${name === category ? "text-ember" : "hover:text-paper"}`}>
              {name}
            </TransitionLink>
          ))}
        </nav>
      </div>

      <div className="gutter mt-4 grid flex-1 items-center gap-6 lg:grid-cols-12">
        <div className="relative flex h-[min(56svh,40rem)] items-center justify-center sm:h-[min(68svh,52rem)] lg:col-span-9" ref={tilt} style={{ transition: "transform 0.3s ease-out" }}>
          <AnimatePresence mode="popLayout" initial={false} custom={direction}>
            <motion.div
              key={photo.id}
              custom={direction}
              className={`relative max-h-full touch-pan-y overflow-hidden rounded-2xl shadow-[0_50px_120px_-30px_rgb(0_0_0/0.95)] ${portrait ? "h-full" : "w-full"}`}
              style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
              drag={set.length > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.3}
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.x) > SWIPE) go(info.offset.x < 0 ? 1 : -1);
              }}
              variants={{
                enter: (d: number) => ({ opacity: 0, x: d * 90, scale: 0.94, filter: "blur(12px)" }),
                show: { opacity: 1, x: 0, scale: 1, filter: "blur(0px)" },
                leave: (d: number) => ({ opacity: 0, x: d * -90, scale: 0.94, filter: "blur(12px)" }),
              }}
              initial="enter"
              animate="show"
              exit="leave"
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                ref={(node) => {
                  if (node) setImage(node);
                }}
                src={photo.src}
                alt={photo.alt}
                fill
                unoptimized
                priority
                draggable={false}
                className="object-contain"
              />
            </motion.div>
          </AnimatePresence>
          {set.length > 1 && (
            <>
              <button type="button" onClick={() => go(-1)} aria-label="Previous photograph" className="pill absolute left-0 top-1/2 -translate-y-1/2 !px-4 max-sm:hidden">
                ←
              </button>
              <button type="button" onClick={() => go(1)} aria-label="Next photograph" className="pill absolute right-0 top-1/2 -translate-y-1/2 !px-4 max-sm:hidden">
                →
              </button>
            </>
          )}
        </div>

        <aside className="lg:col-span-3" aria-live="polite">
          <p className="label tabular-nums">
            <span className="text-ember">{pad(index + 1)}</span> / {pad(set.length)} · {category}
          </p>
          <BlurHeading key={photo.id} as="h2" text={photo.title} className="mt-3 text-[clamp(2rem,3.4vw,3.25rem)]" />
          <p className="mt-3 text-ash">{photo.alt}</p>
          <p className="label mt-4">
            Original, {photo.width} × {photo.height}
          </p>
          <a href={photo.src} target="_blank" rel="noreferrer" className="sweep label mt-4 inline-block text-paper">
            Open the original file ↗
          </a>
        </aside>
      </div>

      <ol ref={rail} className="gutter mt-6 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]" aria-label={`${category} photographs`}>
        {set.map((item, i) => (
          <li key={item.id} className="shrink-0">
            <button type="button" onClick={() => pick(i)} aria-label={`Show ${item.title}`} aria-current={i === index ? "true" : undefined} className={`relative block h-16 overflow-hidden rounded-lg transition-[opacity,transform,box-shadow] duration-300 sm:h-20 ${i === index ? "opacity-100 shadow-[0_0_0_2px_var(--color-ember)]" : "opacity-45 hover:opacity-90"}`} style={{ aspectRatio: `${item.width} / ${item.height}` }}>
              <Frame image={item} sizes="120px" decorative />
            </button>
          </li>
        ))}
      </ol>
    </main>
  );
}

export const stillsPreview = (category: string) => optimizedUrl(photos.find((photo) => photo.category === category)!.src, 1600);
