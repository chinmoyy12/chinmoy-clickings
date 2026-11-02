"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "@/animations/gsap";
import { site } from "@/data/site";
import { prefersReducedMotion } from "@/utils/device";
import { scrollState } from "@/utils/scroll";

// [pointer reach in px, scroll travel in px] per depth layer. Far layers barely move.
const DEPTH = { sky: [6, 12], ridge: [14, 34], back: [20, 52], subject: [30, 64], front: [44, 80], light: [10, 20] } as const;
type Layer = keyof typeof DEPTH;

const Chars = ({ text, offset = 0 }: { text: string; offset?: number }) => (
  <span aria-hidden className="ml">
    <span>
      {[...text].map((char, i) => (
        <span key={i} className="hero-char" style={{ "--i": i + offset } as React.CSSProperties}>
          {char}
        </span>
      ))}
    </span>
  </span>
);

export function CinematicHero() {
  const root = useRef<HTMLElement>(null);
  const layers = useRef<Partial<Record<Layer, HTMLDivElement | null>>>({});
  const set = (name: Layer) => (el: HTMLDivElement | null) => {
    layers.current[name] = el;
  };

  useEffect(() => {
    const section = root.current;
    if (!section || prefersReducedMotion()) return;

    const target = { x: 0, y: 0 };
    const eased = { x: 0, y: 0, v: 0 };
    let visible = true;

    const onPointer = (event: PointerEvent) => {
      target.x = event.clientX / window.innerWidth - 0.5;
      target.y = event.clientY / window.innerHeight - 0.5;
    };
    const onTilt = (event: DeviceOrientationEvent) => {
      if (event.gamma === null || event.beta === null) return;
      target.x = gsap.utils.clamp(-0.5, 0.5, event.gamma / 50);
      target.y = gsap.utils.clamp(-0.5, 0.5, (event.beta - 45) / 60);
    };

    const render = () => {
      if (!visible) return;
      eased.x += (target.x - eased.x) * 0.06;
      eased.y += (target.y - eased.y) * 0.06;
      eased.v += (gsap.utils.clamp(-40, 40, scrollState.velocity) - eased.v) * 0.1;
      const progress = Math.min(1, window.scrollY / section.offsetHeight);
      for (const name of Object.keys(DEPTH) as Layer[]) {
        const element = layers.current[name];
        if (!element) continue;
        const [reach, travel] = DEPTH[name];
        const x = -eased.x * reach;
        const y = -eased.y * reach * 0.6 + progress * travel + eased.v * (reach / 44);
        element.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      }
    };

    const observer = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    observer.observe(section);
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("deviceorientation", onTilt, { passive: true });
    gsap.ticker.add(render);
    return () => {
      observer.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("deviceorientation", onTilt);
      gsap.ticker.remove(render);
    };
  }, []);

  return (
    <section ref={root} data-nav="image" aria-labelledby="hero-title" className="hero relative h-svh min-h-[34rem] overflow-hidden bg-black">
      <div className="hero-plate absolute inset-0">
        <div ref={set("sky")} className="absolute -inset-[4%] will-change-transform">
          <Image src="/media/hero/background.jpg" alt="" fill priority fetchPriority="high" sizes="110vw" quality={85} className="object-cover object-[63%_center]" />
        </div>
        <div ref={set("ridge")} className="absolute -inset-[4%] will-change-transform">
          <Image src="/media/hero/midground.webp" alt="" fill sizes="110vw" quality={80} className="object-cover object-[63%_center]" />
        </div>

        <div ref={set("back")} className="hero-word absolute inset-x-[var(--gutter)] will-change-transform">
          <p className="display text-paper/95">
            <Chars text="CHINMOY" />
          </p>
        </div>

        {/* The subject stands between the two words: the name wraps around them in depth. */}
        <div ref={set("subject")} className="absolute inset-y-0 right-0 w-full will-change-transform">
          <div className="hero-subject absolute bottom-0 aspect-[5/6]">
            <Image src="/media/hero/subject.webp" alt="A photographer in silhouette, camera at the eye, rim-lit by the last of the sun." fill priority fetchPriority="high" sizes="(max-width: 640px) 90vw, 60vw" quality={85} className="object-contain object-bottom" />
          </div>
        </div>

        <div ref={set("light")} className="pointer-events-none absolute inset-0 will-change-transform" aria-hidden>
          <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_63%_62%,rgb(255_154_120/0.12),transparent_70%)]" />
        </div>
        <div className="vignette" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />

        <div ref={set("front")} className="hero-word hero-word-front absolute inset-x-[var(--gutter)] will-change-transform">
          <p className="display text-paper">
            <Chars text="CLICKINGS" offset={7} />
          </p>
        </div>
      </div>

      <h1 id="hero-title" className="sr-only">
        Chinmoy Clickings, photography and cinematography
      </h1>

      <div className="intro-late gutter absolute inset-x-0 bottom-6 flex items-end justify-between gap-6 sm:bottom-8">
        <p className="label max-w-[13rem] text-paper/80 sm:max-w-none">{site.descriptor}</p>
        <div className="flex shrink-0 items-center gap-3">
          <span className="label max-sm:hidden">Scroll to explore</span>
          <span className="relative h-10 w-px bg-line" aria-hidden>
            <span className="scroll-tick absolute inset-0 bg-paper" />
          </span>
        </div>
      </div>
    </section>
  );
}
