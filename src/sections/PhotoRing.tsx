"use client";

import { AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "@/animations/gsap";
import { Lightbox } from "@/components/Lightbox";
import { photos } from "@/data/photos";
import { prefersReducedMotion } from "@/utils/device";

// Every other still keeps the ring varied without crowding it.
const items = photos.filter((_, i) => i % 2 === 0);

/** A 3D ring of stills. The filterable gallery below holds the same work for keyboards and 2D fallbacks. */
export function PhotoRing() {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [off, setOff] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setOff(true);
      return;
    }
    const progress = { value: 0 };
    let teardown: (() => void) | undefined;
    let cancelled = false;
    const trigger = ScrollTrigger.create({ trigger: root.current, start: "top bottom", end: "bottom top", onUpdate: (self) => (progress.value = self.progress) });
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || teardown) return;
        io.disconnect();
        void import("@/three/RingScene")
          .then(({ createRingScene }) => {
            if (cancelled || !canvas.current) return;
            teardown = createRingScene(canvas.current, items, progress, setOpen, setHover, () => setOff(true));
          })
          .catch(() => setOff(true));
      },
      { rootMargin: "150% 0px" },
    );
    if (root.current) io.observe(root.current);
    return () => {
      cancelled = true;
      io.disconnect();
      trigger.kill();
      teardown?.();
    };
  }, []);

  useEffect(() => {
    if (off) requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [off]);

  if (off) return null;

  return (
    <section ref={root} data-nav="solid" aria-label="Rotating 3D ring of photographs" className="relative h-[280vh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <p aria-hidden className="display pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[clamp(3.5rem,13vw,15rem)] leading-none text-paper/10">
          Stills
        </p>
        <canvas ref={canvas} aria-hidden style={{ cursor: hover === null ? "auto" : "pointer" }} className="absolute inset-0 h-full w-full" />
        <p className="label absolute bottom-6 left-1/2 w-max -translate-x-1/2 text-paper/80">{hover === null ? "Scroll to turn / Click a frame" : items[hover].title}</p>
      </div>
      <AnimatePresence>{open !== null && <Lightbox items={items} start={open} onClose={() => setOpen(null)} />}</AnimatePresence>
    </section>
  );
}
