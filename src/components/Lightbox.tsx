"use client";

import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Photo } from "@/data/types";
import { useModal } from "@/hooks/useModal";
import { pad } from "@/utils/media";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Full-screen editorial viewer. Drag a frame aside to find its notes underneath. */
export function Lightbox({ items, start, onClose }: { items: Photo[]; start: number; onClose: () => void }) {
  const [index, setIndex] = useState(start);
  const ref = useModal<HTMLDivElement>(onClose);
  const photo = items[index];
  const dragX = useMotionValue(0);
  const noteOpacity = useTransform(dragX, [0, 120], [0, 1]);

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
      transition={{ duration: 0.4 }}
    >
      <div className="gutter relative z-10 flex items-center justify-between py-2">
        <p className="label tabular-nums">
          <span className="text-ember">{pad(index + 1)}</span> / {pad(items.length)}
        </p>
        <button type="button" data-autofocus onClick={onClose} className="ctrl -mr-2">
          Close
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-[var(--gutter)]">
        <motion.div style={{ opacity: noteOpacity }} className="absolute inset-y-0 left-[var(--gutter)] flex w-[min(15rem,50vw)] flex-col justify-center gap-3">
          <p className="label text-ember">Field note</p>
          <p className="display text-2xl sm:text-3xl">{photo.note}</p>
          <p className="label">
            {photo.location} / {photo.year}
          </p>
        </motion.div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={photo.id}
            data-cursor="Drag"
            className={`relative max-h-full touch-pan-y ${portrait ? "h-full" : "w-full max-w-[min(100%,calc((100svh-9rem)*1.5))]"}`}
            style={{ aspectRatio: `${photo.width} / ${photo.height}`, x: dragX }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0.04, right: 0.42 }}
            dragTransition={{ bounceStiffness: 220, bounceDamping: 26 }}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <Image src={photo.src} alt={photo.alt} fill sizes="100vw" quality={85} draggable={false} className="object-contain" />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="gutter relative z-10 flex items-center justify-between gap-4 py-2">
        <div className="min-w-0">
          <p className="display truncate text-2xl">{photo.title}</p>
          <p className="label">
            {photo.category} <span className="sm:hidden">/ drag for notes</span>
            <span className="max-sm:hidden">/ drag the frame for notes</span>
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => step(-1)} className="ctrl">
            Prev
          </button>
          <button type="button" onClick={() => step(1)} className="ctrl">
            Next
          </button>
        </div>
      </div>
    </motion.div>,
    document.body,
  );
}
