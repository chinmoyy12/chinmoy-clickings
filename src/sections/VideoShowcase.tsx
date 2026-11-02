"use client";

import { AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { Frame } from "@/components/Frame";
import { ImageReveal, SectionReveal, TextReveal } from "@/components/Reveal";
import { VideoPlayer } from "@/components/VideoPlayer";
import type { Film } from "@/data/types";
import { films, reel } from "@/data/videos";
import { hasFinePointer, prefersReducedMotion } from "@/utils/device";
import { pad } from "@/utils/media";

export function VideoShowcase() {
  const [playing, setPlaying] = useState<Film | null>(null);
  const [preview, setPreview] = useState(false);
  const clip = useRef<HTMLVideoElement>(null);

  const startPreview = () => {
    if (!hasFinePointer() || prefersReducedMotion()) return;
    setPreview(true);
    void clip.current?.play().catch(() => undefined);
  };
  const stopPreview = () => clip.current?.pause();

  return (
    <section id="film" data-nav="solid" aria-labelledby="film-title" className="relative z-10 -mt-[100svh] border-t border-line bg-ink pt-28 sm:pt-44">
      <header className="gutter mb-12 sm:mb-20">
        <SectionReveal>
          <p className="label mb-5 text-ember">03 / Cinematography</p>
        </SectionReveal>
        <TextReveal lines={["Moving", "pictures."]} className="display type-section" />
      </header>

      <div className="gutter">
        <ImageReveal dir="up">
          <button type="button" onClick={() => setPlaying(reel)} onPointerEnter={startPreview} onPointerLeave={stopPreview} data-cursor="Play reel" aria-label={`Play ${reel.title}`} className="zoom-host relative block aspect-[4/5] w-full overflow-hidden bg-surface sm:aspect-video">
            <div className="zoom-img absolute inset-0">
              <Frame image={reel.poster} sizes="100vw" quality={85} />
              {preview && <video ref={clip} src={reel.src} muted loop playsInline preload="none" poster={reel.poster.src} autoPlay className="absolute inset-0 h-full w-full object-cover" />}
            </div>
            <div className="vignette" />
            <span className="absolute bottom-4 left-4 flex items-center gap-3 sm:bottom-6 sm:left-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-paper/60" aria-hidden>
                <span className="ml-0.5 h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-paper" />
              </span>
              <span className="label text-paper">
                {reel.title}
                <br />
                <span className="text-paper/70">Sound on</span>
              </span>
            </span>
          </button>
        </ImageReveal>
        <div className="mt-4 flex flex-col justify-between gap-1 sm:flex-row">
          <p className="max-w-md text-[0.9375rem] text-ash">{reel.description}</p>
          <p className="label">{reel.year}</p>
        </div>
      </div>

      {/* Five apertures: hover one open and the others give way. */}
      <ul id="film-title" aria-label="Film categories" className="slats gutter mt-16 flex flex-col gap-3 sm:mt-28 lg:h-[72vh] lg:flex-row lg:gap-2">
        {films.map((film, i) => (
          <li key={film.id} className="slat group min-w-0 lg:flex lg:flex-1">
            <button type="button" onClick={() => setPlaying(film)} data-cursor="Play" className="relative block aspect-video w-full overflow-hidden bg-surface text-left lg:aspect-auto lg:h-full">
              <div className="absolute inset-0 brightness-[.7] transition-[filter] duration-700 group-hover:brightness-100 group-focus-within:brightness-100">
                <Frame image={film.poster} sizes="(min-width: 1024px) 50vw, 100vw" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
              <span className="label absolute left-3 top-3 text-paper">{pad(i + 1)}</span>
              <span className="sr-only">Play {film.title}:</span>
              <span className="absolute inset-x-3 bottom-3 block">
                <span className="display block text-[1.75rem] leading-none lg:text-[clamp(1.5rem,2.2vw,2.5rem)]">{film.category}</span>
                <span className="slat-copy mt-2 block max-w-[32ch] text-[0.875rem] leading-snug text-paper/75 lg:absolute lg:bottom-full lg:mb-2 lg:mt-0 lg:w-[32ch] lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100">{film.description}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <AnimatePresence>{playing && <VideoPlayer key={playing.id} film={playing} onClose={() => setPlaying(null)} />}</AnimatePresence>
    </section>
  );
}
