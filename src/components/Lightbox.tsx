"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Photo } from "@/data/types";
import { useModal } from "@/hooks/useModal";
import { pad } from "@/utils/media";

const EASE = [0.16, 1, 0.3, 1] as const;
const SWIPE = 70;

/** Full-screen viewer with keyboard, swipe, backdrop and button controls. */
export function Lightbox({ items, start, onClose }: { items: Photo[]; start: number; onClose: () => void }) {
  const [index, setIndex] = useState(start);
  const ref = useModal<HTMLDivElement>(onClose);
  const photo = items[index];
  const single = items.length < 2;

  const step = (by: number) => setIndex((i) => (i + by + items.length) % items.length);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const portrait = photo.height > photo.width;

  useEffect(() => {
    if (single) return;
    for (const by of [1, -1]) {
      const image = new window.Image();
      image.src = items[(index + by + items.length) % items.length].src;
    }
  }, [index, items, single]);

  return createPortal(
    <motion.div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={`${photo.title}, photograph ${index + 1} of ${items.length}`}
      className="fixed inset-0 z-[95] flex flex-col bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="gutter relative z-10 flex items-center justify-between py-2">
        <p className="label tabular-nums" aria-live="polite">
          <span className="text-ember">{pad(index + 1)}</span> / {pad(items.length)}
        </p>
        <button type="button" data-autofocus onClick={onClose} className="ctrl -mr-2">
          Close
        </button>
      </div>

      <div data-backdrop onClick={(event) => event.target === event.currentTarget && onClose()} className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-[var(--gutter)]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={photo.id}
            className={`relative max-h-full touch-pan-y ${portrait ? "h-full" : "w-full max-w-[min(100%,calc((100svh-10rem)*1.5))]"}`}
            style={{ aspectRatio: `${photo.width} / ${photo.height}` }}
            drag={single ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={(_, info) => {
              if (Math.abs(info.offset.x) > SWIPE) step(info.offset.x < 0 ? 1 : -1);
            }}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <Image src={photo.src} alt={photo.alt} fill unoptimized draggable={false} className="object-contain" />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="gutter relative z-10 flex items-center justify-between gap-4 py-2">
        <div className="min-w-0">
          <p className="display truncate text-2xl">{photo.title}</p>
          <p className="truncate text-[0.8125rem] text-ash">
            {photo.category} — {photo.alt}
          </p>
          <p className="label mt-1">
            Original, {photo.width} × {photo.height}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" disabled={single} onClick={() => step(-1)} aria-label="Previous photograph" className="ctrl disabled:opacity-30">
            Prev
          </button>
          <button type="button" disabled={single} onClick={() => step(1)} aria-label="Next photograph" className="ctrl disabled:opacity-30">
            Next
          </button>
        </div>
      </div>
    </motion.div>,
    document.body,
  );
}
