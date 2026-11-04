"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "@/animations/gsap";
import { Frame } from "@/components/Frame";
import { ParallaxStars } from "@/components/ParallaxStars";
import { SectionReveal, TextReveal } from "@/components/Reveal";
import { useTransitionRouter } from "@/components/PageTransition";
import { photos } from "@/data/photos";
import type { Film } from "@/data/types";
import { duration, films } from "@/data/videos";
import { prefersReducedMotion } from "@/utils/device";
import { optimizedUrl, pad } from "@/utils/media";

const COUNT = films.length;
const IDLE_MS = 9000;

/** Shortest signed distance from the reel position to a card, so the reel loops. */
const offsetOf = (index: number, position: number) => {
  const raw = (((index - position) % COUNT) + COUNT) % COUNT;
  return raw > COUNT / 2 ? raw - COUNT : raw;
};
const wrap = (index: number) => ((index % COUNT) + COUNT) % COUNT;

/** The films on a 3D reel: drag or swipe it, the front card plays, and any card opens the full film. */
export function FilmsSection() {
  const stage = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const previews = useRef<(HTMLVideoElement | null)[]>([]);
  const reel = useRef({ position: 0 });
  const [active, setActive] = useState(0);
  const visible = useRef(false);
  const touched = useRef(0);
  const still = useRef(false);

  const layout = useCallback(() => {
    const width = stage.current?.clientWidth ?? 1000;
    const spread = Math.min(width * 0.28, 300);
    cards.current.forEach((card, i) => {
      if (!card) return;
      const offset = offsetOf(i, reel.current.position);
      const distance = Math.abs(offset);
      card.style.transform = `translate3d(calc(-50% + ${(offset * spread).toFixed(1)}px), -50%, ${(-distance * 260).toFixed(1)}px) rotateY(${(Math.max(-1, Math.min(1, offset)) * -42).toFixed(2)}deg) scale(${(1 - Math.min(distance, 3) * 0.05).toFixed(3)})`;
      card.style.opacity = String(Math.max(0, 1 - Math.max(0, distance - 2.2)));
      card.style.zIndex = String(100 - Math.round(distance * 10));
      card.style.filter = `brightness(${(1 - Math.min(distance, 2) * 0.28).toFixed(2)})`;
    });
    const nearest = wrap(Math.round(reel.current.position));
    setActive((current) => (current === nearest ? current : nearest));
  }, []);

  const goTo = useCallback(
    (target: number) => {
      gsap.to(reel.current, { position: target, duration: still.current ? 0 : 0.9, ease: "power3.out", overwrite: true, onUpdate: layout });
    },
    [layout],
  );
  const step = useCallback(
    (by: number) => {
      touched.current = performance.now();
      goTo(Math.round(reel.current.position) + by);
    },
    [goTo],
  );

  useEffect(() => {
    still.current = prefersReducedMotion();
    layout();
    const element = stage.current;
    if (!element) return;
    const resize = new ResizeObserver(layout);
    resize.observe(element);
    const io = new IntersectionObserver(([entry]) => (visible.current = entry.isIntersecting), { threshold: 0.35 });
    io.observe(element);

    // Drag or swipe sideways; vertical swipes still scroll the page.
    let start: { x: number; position: number; time: number } | null = null;
    let moved = false;
    const onDown = (event: PointerEvent) => {
      start = { x: event.clientX, position: reel.current.position, time: performance.now() };
      moved = false;
      gsap.killTweensOf(reel.current);
    };
    const onMove = (event: PointerEvent) => {
      if (!start) return;
      const dx = event.clientX - start.x;
      if (Math.abs(dx) > 6) moved = true;
      reel.current.position = start.position - dx / Math.min(element.clientWidth * 0.28, 300);
      layout();
    };
    const onUp = (event: PointerEvent) => {
      if (!start) return;
      const velocity = (event.clientX - start.x) / Math.max(1, performance.now() - start.time);
      const flung = reel.current.position - velocity * 1.8;
      start = null;
      touched.current = performance.now();
      if (moved) goTo(Math.round(flung));
    };
    // A drag must not also count as a click on the card under it.
    const onClickCapture = (event: MouseEvent) => {
      if (moved) {
        event.stopPropagation();
        event.preventDefault();
        moved = false;
      }
    };
    element.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    element.addEventListener("click", onClickCapture, true);
    return () => {
      resize.disconnect();
      io.disconnect();
      element.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      element.removeEventListener("click", onClickCapture, true);
      gsap.killTweensOf(reel.current);
    };
  }, [goTo, layout]);

  // Only the front card plays; when its loop ends the reel moves on unless someone is using it.
  useEffect(() => {
    previews.current.forEach((video, i) => {
      if (!video) return;
      if (i === active && !still.current) {
        video.currentTime = 0;
        void video.play().catch(() => undefined);
      } else video.pause();
    });
    const video = previews.current[active];
    if (!video || still.current) return;
    const onEnded = () => {
      if (visible.current && performance.now() - touched.current > IDLE_MS) goTo(Math.round(reel.current.position) + 1);
      else void video.play().catch(() => undefined);
    };
    video.addEventListener("ended", onEnded);
    return () => video.removeEventListener("ended", onEnded);
  }, [active, goTo]);

  // Pause everything off screen.
  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const io = new IntersectionObserver(([entry]) => {
      const video = previews.current[active];
      if (!video || still.current) return;
      if (entry.isIntersecting) void video.play().catch(() => undefined);
      else video.pause();
    });
    io.observe(element);
    return () => io.disconnect();
  }, [active]);

  const router = useTransitionRouter();
  const watch = (film: Film) => router.go(`/watch/${film.id}`, cards.current[films.indexOf(film)] ? { source: cards.current[films.indexOf(film)]!, src: optimizedUrl(film.poster.src, 1600) } : undefined);

  const open = (index: number) => {
    if (index === active) watch(films[index]);
    else {
      touched.current = performance.now();
      goTo(Math.round(reel.current.position) + offsetOf(index, reel.current.position));
    }
  };

  const current = films[active];

  return (
    <section id="films" data-nav="solid" aria-labelledby="films-title" className="relative isolate overflow-hidden pb-6 pt-24 sm:pt-40">
      <ParallaxStars className="-z-10" speed={1.2} />
      <header className="gutter grid gap-6 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <SectionReveal>
            <p className="label mb-3 text-ember">04 / Films</p>
          </SectionReveal>
          <div id="films-title">
            <TextReveal lines={["Moving", "pictures."]} accent={1} className="display type-section" />
          </div>
        </div>
        <SectionReveal className="lg:col-span-5 lg:text-right">
          <p className="display text-[clamp(3rem,6vw,5.5rem)] leading-none text-ember tabular-nums">{pad(COUNT)}</p>
          <p className="label mt-2">
            {pad(COUNT)} films / {pad(photos.length)} stills
          </p>
        </SectionReveal>
      </header>

      <div
        ref={stage}
        role="region"
        aria-roledescription="carousel"
        aria-label="Films"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") step(1);
          if (event.key === "ArrowLeft") step(-1);
          if (event.key === "Enter" && event.target === event.currentTarget) watch(films[active]);
        }}
        className="film-stage relative mt-6 h-[clamp(26rem,62vh,38rem)] touch-pan-y select-none [perspective:1400px] focus-visible:outline-none"
      >
        <div className="absolute inset-0 [transform-style:preserve-3d]">
          {films.map((film, i) => (
            <div key={film.id} ref={(node) => void (cards.current[i] = node)} className="film-card absolute left-1/2 top-1/2 w-[min(64vw,21rem)] will-change-transform" aria-hidden={i !== active}>
              <button type="button" tabIndex={i === active ? 0 : -1} onClick={() => open(i)} aria-label={i === active ? `Play ${film.title}, ${duration(film.seconds)}` : `Show ${film.title}`} className="group relative block aspect-[4/5] w-full overflow-hidden rounded-2xl border border-white/10 bg-surface text-left shadow-[0_40px_80px_-30px_rgb(0_0_0/0.9)]">
                <Frame image={film.poster} sizes="(min-width: 768px) 336px, 64vw" decorative />
                <video
                  ref={(node) => void (previews.current[i] = node)}
                  src={i === active ? film.preview : undefined}
                  poster={film.poster.src}
                  muted
                  playsInline
                  preload="none"
                  aria-hidden
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${i === active ? "opacity-100" : "opacity-0"}`}
                />
                <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/30" aria-hidden />
                <span className="absolute left-4 right-4 top-4 flex items-center justify-between">
                  <span className="label text-paper">{film.category}</span>
                  <span className="label tabular-nums text-paper/80">{duration(film.seconds)}</span>
                </span>
                <span className="absolute inset-x-4 bottom-4">
                  <span className="display block text-[clamp(1.5rem,3.2vw,2.25rem)] leading-none">{film.title}</span>
                  <span className={`label mt-3 inline-flex items-center gap-2 text-ember transition-opacity duration-300 ${i === active ? "opacity-100" : "opacity-0"}`}>
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-ember text-ink" aria-hidden>
                      ▶
                    </span>
                    Play film
                  </span>
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="gutter mt-2 flex items-center justify-between gap-4">
        <p className="min-w-0 truncate text-ash" aria-live="polite">
          <span className="text-paper">{current.title}.</span> {current.description}
        </p>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => step(-1)} aria-label="Previous film" className="pill !px-4">
            ←
          </button>
          <button type="button" onClick={() => step(1)} aria-label="Next film" className="pill !px-4">
            →
          </button>
        </div>
      </div>

      <ol className="gutter mt-12 lg:ml-[calc(100%*7/12)]">
        {films.map((film, i) => (
          <li key={film.id} className="border-t border-line last:border-b">
            <button type="button" onClick={() => watch(film)} onPointerEnter={() => i !== active && open(i)} className="row group grid w-full grid-cols-[2.5rem_1fr_auto] items-baseline gap-3 py-4 text-left">
              <span className={`label ${i === active ? "text-ember" : ""}`}>{pad(i + 1)}</span>
              <span className="min-w-0">
                <span className="display block text-[clamp(1.375rem,2.2vw,2rem)] leading-none transition-[color,transform] duration-500 ease-cine group-hover:translate-x-2 group-hover:text-ember">{film.title}</span>
                <span className="label mt-1 block">{film.category}</span>
              </span>
              <span className="label tabular-nums text-ember">{duration(film.seconds)}</span>
            </button>
          </li>
        ))}
      </ol>

    </section>
  );
}
