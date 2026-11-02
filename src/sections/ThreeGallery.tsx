"use client";

import { AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { Component, useEffect, useMemo, useRef, useState } from "react";
import { ScrollTrigger } from "@/animations/gsap";
import { Frame } from "@/components/Frame";
import { Lightbox } from "@/components/Lightbox";
import { ImageReveal, SectionReveal, TextReveal } from "@/components/Reveal";
import { archive } from "@/data/photos";
import { deviceTier, type Tier } from "@/utils/device";

const ArchiveScene = dynamic(() => import("@/three/ArchiveScene"), { ssr: false });

class SceneBoundary extends Component<{ onFail: () => void; children: React.ReactNode }> {
  componentDidCatch() {
    this.props.onFail();
  }
  static getDerivedStateFromError() {
    return null;
  }
  render() {
    return this.props.children;
  }
}

/** The 2D version of the archive, for no WebGL, low power, phones and reduced motion. */
function Fallback({ onOpen }: { onOpen: (index: number) => void }) {
  const items = archive.slice(0, 8);
  return (
    <ul className="gutter grid grid-cols-4 gap-x-3 gap-y-6 sm:grid-cols-8 lg:grid-cols-12 lg:gap-y-16">
      {items.map((photo, i) => {
        const span = ["col-span-4 lg:col-span-7", "col-span-2 mt-10 sm:col-span-4 lg:col-span-3 lg:col-start-9 lg:mt-24", "col-span-2 sm:col-span-4 lg:col-span-4", "col-span-4 lg:col-span-6 lg:col-start-6 lg:mt-20"][i % 4];
        return (
          <li key={photo.id} className={span}>
            <ImageReveal dir={i % 2 ? "up" : "left"}>
              <button type="button" onClick={() => onOpen(i)} data-cursor="Open" aria-label={`Open ${photo.title}`} className="zoom-host relative block aspect-[var(--r)] w-full overflow-hidden bg-surface" style={{ "--r": photo.width / photo.height } as React.CSSProperties}>
                <div className="zoom-img absolute inset-0">
                  <Frame image={photo} sizes="(min-width: 1024px) 50vw, 100vw" />
                </div>
              </button>
            </ImageReveal>
            <p className="label mt-2 text-paper">{photo.title}</p>
          </li>
        );
      })}
    </ul>
  );
}

export function ThreeGallery() {
  const [tier, setTier] = useState<Tier | null>(null);
  const [failed, setFailed] = useState(false);
  const [near, setNear] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const [focus, setFocus] = useState<number | null>(null);
  const track = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [running, setRunning] = useState(false);

  useEffect(() => setTier(deviceTier()), []);

  const live = tier !== null && tier !== "none" && !failed;
  const items = useMemo(() => (tier === "reduced" ? archive.slice(0, 10) : archive), [tier]);

  // This section's height depends on the device, so everything below it re-measures.
  useEffect(() => {
    if (tier === null) return;
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(frame);
  }, [tier, failed]);

  useEffect(() => {
    if (!live || !track.current) return;
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && setNear(true), { rootMargin: "120% 0px" });
    io.observe(track.current);
    const trigger = ScrollTrigger.create({
      trigger: track.current,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => setRunning(self.isActive),
      onUpdate: () => {
        const box = track.current!.getBoundingClientRect();
        progress.current = Math.min(1, Math.max(0, -box.top / (box.height - window.innerHeight)));
      },
    });
    return () => {
      io.disconnect();
      trigger.kill();
    };
  }, [live]);

  const select = (index: number) => setFocus(index);

  return (
    <section data-nav="solid" aria-labelledby="archive-title" className="relative pt-28 sm:pt-44">
      {live ? (
        <div ref={track} className="relative h-[460vh] bg-ink">
          <div className="sticky top-0 h-svh overflow-hidden">
            {near && (
              <SceneBoundary onFail={() => setFailed(true)}>
                <ArchiveScene
                  items={items}
                  progress={progress}
                  running={running && open === null}
                  dpr={tier === "reduced" ? 1 : 1.5}
                  focused={focus}
                  onSelect={select}
                  onArrive={() => focus !== null && setOpen(focus)}
                  onContextLost={() => setFailed(true)}
                />
              </SceneBoundary>
            )}
            <div className="pointer-events-none absolute inset-x-[var(--gutter)] top-24 flex items-start justify-between gap-6">
              <div>
                <p className="label mb-3 text-ember">04 / The archive</p>
                <h2 id="archive-title" className="display text-[clamp(2rem,4vw,4rem)]">
                  Walk through the frames.
                </h2>
              </div>
              <p className="label max-sm:hidden">Scroll to travel / Select to enter</p>
            </div>
            <ul className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:bottom-4 focus-within:left-[var(--gutter)] focus-within:flex focus-within:flex-wrap focus-within:gap-3">
              {items.map((photo, i) => (
                <li key={photo.id}>
                  <button type="button" onClick={() => setOpen(i)} className="label text-paper">
                    Open {photo.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <>
          <header className="gutter mb-12 sm:mb-20">
            <SectionReveal>
              <p className="label mb-5 text-ember">04 / The archive</p>
            </SectionReveal>
            <TextReveal lines={["Walk through", "the frames."]} className="display type-section" />
          </header>
          <Fallback onOpen={setOpen} />
        </>
      )}
      <AnimatePresence>
        {open !== null && (
          <Lightbox
            items={live ? items : archive.slice(0, 8)}
            start={open}
            onClose={() => {
              setOpen(null);
              setFocus(null);
            }}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
