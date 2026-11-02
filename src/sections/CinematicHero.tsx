"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/animations/gsap";
import { LightRays } from "@/components/LightRays";
import { Magnetic } from "@/components/MagneticButton";
import { TransitionLink } from "@/components/TransitionLink";
import { VideoPlayer } from "@/components/VideoPlayer";
import { photos } from "@/data/photos";
import { projects } from "@/data/projects";
import { site } from "@/data/site";
import { reel } from "@/data/videos";
import { hasFinePointer, prefersReducedMotion } from "@/utils/device";
import { pad } from "@/utils/media";

const ROLES = ["Cinematographer", "Storyteller", "Colorist", "Frame hunter"];

function RotatingRole() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % ROLES.length), 2400);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <span className="hero-greeting relative ml-1 inline-block min-w-[9em] overflow-hidden align-bottom text-ember">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={ROLES[index]} className="inline-block" initial={{ y: "70%", opacity: 0, filter: "blur(6px)" }} animate={{ y: 0, opacity: 1, filter: "blur(0px)" }} exit={{ y: "-70%", opacity: 0, filter: "blur(6px)" }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
          {ROLES[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

const STATS = [
  [pad(projects.length), "Projects"],
  [pad(photos.length), "Stills"],
];

export function CinematicHero() {
  const root = useRef<HTMLElement>(null);
  const word = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const section = root.current;
    if (!section || prefersReducedMotion()) return;
    const pointer = { x: 0, y: 0, spins: 0 };
    let teardown: (() => void) | undefined;
    let cancelled = false;
    let visible = true;

    import("@/three/HeroScene")
      .then(async ({ canUseWebGL, createHeroScene }) => {
        if (cancelled || !canUseWebGL() || !canvas.current) return;
        teardown = await createHeroScene(canvas.current, pointer, () => setLive(true), () => setLive(false));
        if (cancelled) teardown();
      })
      .catch(() => setLive(false));

    const onPointer = (event: PointerEvent) => {
      pointer.x = event.clientX / window.innerWidth - 0.5;
      pointer.y = event.clientY / window.innerHeight - 0.5;
    };
    const onSpin = (event: MouseEvent) => {
      if (!(event.target as Element).closest("a, button")) pointer.spins += 1;
    };
    section.addEventListener("click", onSpin);
    const render = () => {
      if (!visible || !word.current) return;
      const progress = Math.min(1, window.scrollY / section.offsetHeight);
      word.current.style.transform = `translate3d(${(pointer.x * 22).toFixed(1)}px, ${(progress * 90).toFixed(1)}px, 0) scale(${(1 + progress * 0.25).toFixed(3)})`;
      word.current.style.opacity = String(1 - progress * 1.2);
    };
    const observer = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    observer.observe(section);
    if (hasFinePointer()) window.addEventListener("pointermove", onPointer, { passive: true });
    gsap.ticker.add(render);
    return () => {
      cancelled = true;
      teardown?.();
      observer.disconnect();
      section.removeEventListener("click", onSpin);
      window.removeEventListener("pointermove", onPointer);
      gsap.ticker.remove(render);
    };
  }, []);

  return (
    <section ref={root} data-nav="image" aria-labelledby="hero-title" className="hero relative h-svh overflow-hidden bg-black">
      <div className="hero-glow absolute inset-0" aria-hidden />
      <LightRays color="#ff8a5c" className="opacity-55" />

      <div className="hero-subject absolute">
        <Image src="/media/hero/avatar.webp" alt={site.heroAlt} fill priority fetchPriority="high" sizes="(max-width: 768px) 90vw, 60vw" quality={85} className={`object-contain object-top transition-opacity duration-500 ${live ? "opacity-0" : "opacity-100"}`} />
      </div>
      <canvas ref={canvas} aria-hidden className="absolute inset-0 h-full w-full" />

      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black to-transparent" />

      <div ref={word} className="hero-word absolute inset-x-0 text-center will-change-transform">
        <h1 id="hero-title" className="display hero-giant inline-block">
          <span className="sr-only">Chinmoy Clickings, photographer and cinematographer</span>
          <span aria-hidden className="hero-part hero-part-left chrome-word">
            {site.heroWord.slice(0, 4)}
          </span>
          <span aria-hidden className="hero-part hero-part-right chrome-word">
            {site.heroWord.slice(4)}
          </span>
        </h1>
      </div>

      <div className="hero-copy gutter absolute inset-x-0 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <p className="intro-late text-[clamp(0.9375rem,1.4vw,1.25rem)] font-semibold">
          Photographer <span className="hero-greeting font-normal text-ash">&amp;</span>
          <RotatingRole />
        </p>
        <div className="intro-late flex items-center gap-5">
          {site.showreelReady && (
            <button type="button" onClick={() => setPlaying(true)} className="label sweep text-paper">
              Play showreel
            </button>
          )}
          <Magnetic>
            <TransitionLink href="/#work" className="pill">
              View selected work <span className="arrow" aria-hidden>→</span>
            </TransitionLink>
          </Magnetic>
        </div>
      </div>

      <dl className="intro-late absolute right-[var(--gutter)] top-24 hidden text-right lg:block">
        {STATS.map(([value, name]) => (
          <div key={name} className="mb-4">
            <dd className="display text-4xl text-ember">{value}</dd>
            <dt className="label">{name}</dt>
          </div>
        ))}
      </dl>

      <AnimatePresence>{playing && <VideoPlayer film={reel} onClose={() => setPlaying(false)} />}</AnimatePresence>
    </section>
  );
}
