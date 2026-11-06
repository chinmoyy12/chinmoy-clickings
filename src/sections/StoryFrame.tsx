"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/animations/gsap";
import { Frame } from "@/components/Frame";
import { SwarmCursor, type Ring } from "@/components/SwarmCursor";
import { chapters, storyChoices } from "@/data/story";
import { prefersReducedMotion } from "@/utils/device";
import { pad } from "@/utils/media";
import { scrollToTarget } from "@/utils/scroll";

/** The story of a frame: scroll opens the lens, each chapter changes the picture, then the visitor chooses. */
export function StoryFrame() {
  const root = useRef<HTMLElement>(null);
  const lens = useRef<HTMLDivElement>(null);
  const flash = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const last = chapters.length;

  useEffect(() => {
    const reduced = prefersReducedMotion();
    let previous = 0;
    const trigger = ScrollTrigger.create({
      trigger: root.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const next = Math.min(last, Math.floor(self.progress * (last + 1)));
        const inChapter = self.progress * (last + 1) - next;
        lens.current?.style.setProperty("--iris", `${Math.min(100, 18 + next * 10 + inChapter * 16 + (next === last ? 60 : 0))}%`);
        if (next !== previous) {
          previous = next;
          setIndex(next);
          // Chapter 3 is the shutter.
          if (next === 2 && !reduced && flash.current) gsap.fromTo(flash.current, { opacity: 0.9 }, { opacity: 0, duration: 0.45, ease: "power2.out" });
        }
      },
    });
    return () => trigger.kill();
  }, [last]);

  const choose = (category: string) => {
    window.dispatchEvent(new CustomEvent("cc:filter", { detail: category }));
    // Scroll once the gallery has re-measured, or the refresh cancels the journey.
    window.setTimeout(() => scrollToTarget("#photo"), 800);
  };

  // The lens edge, in the same box the swarm draws in; once the lens has opened fully there is no edge to frame.
  const lensRing = useCallback((): Ring | null => {
    const element = lens.current;
    if (!element) return null;
    const iris = parseFloat(element.style.getPropertyValue("--iris")) || 18;
    if (iris >= 95) return null;
    const { width, height } = element.getBoundingClientRect();
    return { x: width / 2, y: height / 2, r: (iris / 100) * Math.hypot(width, height) / Math.SQRT2 + 10 };
  }, []);

  const shown = chapters[Math.min(index, last - 1)];

  return (
    <section ref={root} id="story" data-nav="solid" aria-label="The story of a frame" className="relative h-[520vh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="absolute inset-0" aria-hidden>
          {chapters.map((chapter, i) => (
            <div key={chapter.word} className="story-backdrop absolute inset-0 transition-opacity duration-1000 ease-cine" style={{ opacity: i === Math.min(index, last - 1) ? 1 : 0 }}>
              <Frame image={chapter.backdrop} sizes="100vw" quality={70} decorative />
            </div>
          ))}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgb(8_8_10/0.78)_80%)]" />
        </div>
        <div ref={lens} className="lens absolute inset-0">
          {chapters.map((chapter, i) => (
            <div key={chapter.word} aria-hidden={i !== index} className="absolute inset-0 transition-[opacity,transform] duration-700 ease-cine" style={{ opacity: i === Math.min(index, last - 1) ? 1 : 0, transform: i === index ? "scale(1)" : "scale(1.08)" }}>
              <Frame image={chapter.image} sizes="100vw" quality={85} decorative={i !== index} />
            </div>
          ))}
          <div className="absolute inset-0 bg-black/30" />
        </div>
        <SwarmCursor ring={lensRing} pulse={index + 1} count={1000} />
        <div ref={flash} aria-hidden className="pointer-events-none absolute inset-0 bg-white opacity-0" />

        <div className="gutter relative flex h-full flex-col justify-between pb-8 pt-24">
          <p className="label text-paper">The story of a frame</p>

          {index < last ? (
            <div key={shown.word} className="story-chapter">
              <p className="story-word display">{shown.word}</p>
              <p className="mt-3 max-w-md text-[clamp(1.0625rem,1.6vw,1.375rem)] leading-snug">{shown.line}</p>
            </div>
          ) : (
            <div className="story-chapter">
              <p className="story-word display">Your story?</p>
              <p className="mt-3 max-w-md text-[clamp(1.0625rem,1.6vw,1.375rem)] leading-snug">Every frame is somebody&apos;s. Choose one and I&apos;ll take you there.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {storyChoices.map((choice) => (
                  <button key={choice} type="button" onClick={() => choose(choice)} className="pill">
                    {choice} <span className="arrow" aria-hidden>→</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <ol className="flex gap-2" aria-hidden>
            {[...chapters.map((chapter) => chapter.word), "You"].map((label, i) => (
              <li key={label} className={`label flex items-center gap-2 transition-colors duration-300 ${i === index ? "text-ember" : "text-paper/60"}`}>
                {pad(i + 1)} <span className="max-sm:hidden">{label}</span>
                {i < last && <span className="h-px w-6 bg-paper/40 max-sm:w-3" />}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
