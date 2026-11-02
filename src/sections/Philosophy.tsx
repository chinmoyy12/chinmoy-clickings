"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/animations/gsap";
import { Frame } from "@/components/Frame";
import { philosophy } from "@/data/photos";
import { site } from "@/data/site";
import { prefersReducedMotion } from "@/utils/device";

export function Philosophy() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const active = picked ?? scrolled;

  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: root.current,
      start: "top top",
      end: "bottom 200%",
      onUpdate: (self) => {
        setPicked(null);
        setScrolled(Math.min(philosophy.length - 1, Math.floor(self.progress * philosophy.length)));
      },
    });
    // The film section is a sheet that rises over this scene as it recedes.
    const recede = prefersReducedMotion()
      ? null
      : gsap.to(stage.current, { scale: 0.9, opacity: 0.35, ease: "none", scrollTrigger: { trigger: root.current, start: "bottom 200%", end: "bottom bottom", scrub: true } });
    return () => {
      trigger.kill();
      recede?.scrollTrigger?.kill();
      recede?.kill();
    };
  }, []);

  return (
    <section ref={root} data-nav="image" aria-label="Philosophy" className="relative mt-24 h-[520vh] bg-black sm:mt-40">
      <div ref={stage} className="sticky top-0 h-svh origin-top overflow-hidden will-change-transform">
        {philosophy.map((scene, i) => (
          <div key={scene.word} aria-hidden={i !== active} className="absolute inset-0 transition-[opacity,transform] duration-[1200ms] ease-cine" style={{ opacity: i === active ? 1 : 0, transform: i === active ? "scale(1)" : "scale(1.05)" }}>
            <Frame image={scene.image} sizes="100vw" quality={85} decorative={i !== active} />
          </div>
        ))}
        <div className="absolute inset-0 bg-black/50" />
        <div className="vignette" />

        <div className="gutter relative flex h-full flex-col justify-between gap-4 pb-6 pt-20">
          <p className="label text-paper/80">Philosophy</p>
          <ul className="my-auto">
            {philosophy.map((scene, i) => (
              <li key={scene.word}>
                <button
                  type="button"
                  aria-pressed={i === active}
                  onPointerEnter={(event) => event.pointerType === "mouse" && setPicked(i)}
                  onFocus={() => setPicked(i)}
                  onClick={() => setPicked(i)}
                  className={`display flex w-full items-baseline gap-5 text-left text-[clamp(2.75rem,min(10.5vw,12.5svh),10rem)] leading-[1] transition-[color,transform] duration-700 ease-cine ${i === active ? "translate-x-2 text-paper sm:translate-x-3" : "text-paper/30 hover:text-paper/60"}`}
                >
                  {scene.word}.
                  <span className={`label font-sans transition-opacity duration-500 max-sm:hidden ${i === active ? "text-paper opacity-100" : "opacity-0"}`}>{scene.line}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="grid gap-2 sm:grid-cols-2 sm:items-end">
            <p className="text-[0.9375rem] text-paper/80 sm:hidden">{philosophy[active].line}</p>
            <p className="display max-w-[24ch] text-[clamp(1.5rem,2.6vw,2.5rem)] leading-tight sm:col-start-2 sm:justify-self-end sm:text-right">{site.philosophyLine}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
