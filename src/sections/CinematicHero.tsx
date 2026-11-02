"use client";

import { AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/animations/gsap";
import { Magnetic } from "@/components/MagneticButton";
import { TransitionLink } from "@/components/TransitionLink";
import { VideoPlayer } from "@/components/VideoPlayer";
import { photos } from "@/data/photos";
import { projects } from "@/data/projects";
import { site } from "@/data/site";
import { social } from "@/data/social";
import { reel } from "@/data/videos";
import { prefersReducedMotion } from "@/utils/device";
import { pad } from "@/utils/media";
import { scrollState } from "@/utils/scroll";

const STATS = [
  [pad(projects.length), "Projects"],
  [pad(photos.length), "Stills"],
];

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
  const word = useRef<HTMLDivElement>(null);
  const subject = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const section = root.current;
    if (!section || prefersReducedMotion()) return;
    const pointer = { x: 0, y: 0 };
    const eased = { x: 0, y: 0, v: 0 };
    let visible = true;
    let webgl = false;
    let teardown: (() => void) | undefined;
    let cancelled = false;

    const fail = () => {
      webgl = false;
      setLive(false);
    };
    import("@/three/HeroScene")
      .then(async ({ canUseWebGL, createHeroScene }) => {
        if (cancelled || !canUseWebGL() || !canvas.current) return;
        teardown = await createHeroScene(
          canvas.current,
          pointer,
          () => {
            webgl = true;
            setLive(true);
          },
          fail,
        );
        if (cancelled) teardown();
      })
      .catch(fail);

    const onPointer = (event: PointerEvent) => {
      pointer.x = event.clientX / window.innerWidth - 0.5;
      pointer.y = event.clientY / window.innerHeight - 0.5;
    };
    const onTilt = (event: DeviceOrientationEvent) => {
      if (event.gamma === null || event.beta === null) return;
      pointer.x = gsap.utils.clamp(-0.5, 0.5, event.gamma / 40);
      pointer.y = gsap.utils.clamp(-0.5, 0.5, (event.beta - 45) / 50);
    };
    // iOS only grants motion access from a user gesture.
    const Orientation = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> } | undefined;
    const askTilt = () => {
      void Orientation?.requestPermission?.().then((state) => {
        if (state === "granted") window.addEventListener("deviceorientation", onTilt, { passive: true });
      });
    };
    if (Orientation?.requestPermission) section.addEventListener("touchend", askTilt, { once: true });
    else window.addEventListener("deviceorientation", onTilt, { passive: true });

    const render = () => {
      if (!visible) return;
      eased.x += (pointer.x - eased.x) * 0.06;
      eased.y += (pointer.y - eased.y) * 0.06;
      eased.v += (gsap.utils.clamp(-40, 40, scrollState.velocity) - eased.v) * 0.1;
      const progress = Math.min(1, window.scrollY / section.offsetHeight);
      if (word.current) word.current.style.transform = `translate3d(${(eased.x * 34).toFixed(2)}px, ${(eased.y * 16 + progress * 70).toFixed(2)}px, 0)`;
      if (copy.current) copy.current.style.transform = `translate3d(${(-eased.x * 14).toFixed(2)}px, ${(progress * -50 + eased.v * 0.4).toFixed(2)}px, 0)`;
      if (subject.current) {
        // Without WebGL the same cutout tilts in CSS 3D, so the depth never disappears.
        const tilt = webgl ? "" : ` rotateY(${(eased.x * 9).toFixed(2)}deg) rotateX(${(-eased.y * 6).toFixed(2)}deg)`;
        subject.current.style.transform = `translate3d(${(-eased.x * 16).toFixed(2)}px, ${(progress * 26).toFixed(2)}px, 0)${tilt}`;
      }
    };

    const observer = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    observer.observe(section);
    window.addEventListener("pointermove", onPointer, { passive: true });
    gsap.ticker.add(render);
    return () => {
      cancelled = true;
      teardown?.();
      observer.disconnect();
      section.removeEventListener("touchend", askTilt);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("deviceorientation", onTilt);
      gsap.ticker.remove(render);
    };
  }, []);

  return (
    <section ref={root} data-nav="image" aria-labelledby="hero-title" className="hero relative h-svh min-h-[36rem] overflow-hidden bg-ink [perspective:1200px]">
      <div className="hero-glow absolute inset-0" aria-hidden />

      <div ref={word} aria-hidden className="hero-word absolute inset-x-0 text-center will-change-transform">
        <p className="display hero-giant">
          <Chars text={site.heroWord} />
        </p>
      </div>

      <div ref={subject} className="hero-subject absolute will-change-transform [transform-style:preserve-3d]">
        <Image
          src="/media/hero/subject.webp"
          alt={site.heroAlt}
          fill
          priority
          fetchPriority="high"
          sizes="(max-width: 768px) 90vw, 50vw"
          quality={85}
          className={`object-contain object-top transition-opacity duration-700 ${live ? "opacity-0" : "opacity-100"}`}
        />
        <canvas ref={canvas} aria-hidden className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${live ? "opacity-100" : "opacity-0"}`} />
      </div>

      <div className="vignette" />
      <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-ink via-ink/60 to-transparent max-sm:h-3/5" />

      <div ref={copy} className="hero-copy gutter absolute inset-x-0 will-change-transform">
        <p className="intro-late hero-greeting mb-1">Hello, I'm</p>
        <h1 id="hero-title" className="display hero-name">
          <span className="sr-only">Chinmoy Clickings, photographer and cinematographer</span>
          <Chars text="CLICKINGS" offset={7} />
        </h1>
        <p className="intro-late label mt-3 text-ember">{site.roles}</p>
        <p className="intro-late mt-3 max-w-[23rem] text-[0.9375rem] leading-snug text-paper/80">{site.about.lead}</p>
        <div className="intro-late mt-5 flex flex-wrap items-center gap-5">
          <Magnetic>
            <TransitionLink href="/#work" className="pill">
              View work <span className="arrow" aria-hidden>→</span>
            </TransitionLink>
          </Magnetic>
          <button type="button" onClick={() => setPlaying(true)} className="label sweep flex items-center gap-2 text-paper">
            <span className="h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-ember" aria-hidden />
            Play showreel
          </button>
        </div>
      </div>

      <dl className="intro-late absolute right-[var(--gutter)] top-1/2 hidden -translate-y-1/2 text-right lg:block">
        {STATS.map(([value, name]) => (
          <div key={name} className="mb-5">
            <dd className="display text-5xl text-ember">{value}</dd>
            <dt className="label">{name}</dt>
          </div>
        ))}
      </dl>

      <div className="intro-late gutter absolute inset-x-0 bottom-4 hidden items-end justify-between gap-6 sm:flex">
        <a href={social.instagram.url} target="_blank" rel="noreferrer" className="label sweep">
          {social.instagram.handle}
        </a>
        <span className="flex items-center gap-3">
          <span className="label">Scroll</span>
          <span className="relative h-8 w-px bg-line" aria-hidden>
            <span className="scroll-tick absolute inset-0 bg-ember" />
          </span>
        </span>
      </div>

      <AnimatePresence>{playing && <VideoPlayer film={reel} onClose={() => setPlaying(false)} />}</AnimatePresence>
    </section>
  );
}
