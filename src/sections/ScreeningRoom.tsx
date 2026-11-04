"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { AmbientBackdrop } from "@/components/AmbientBackdrop";
import { Frame } from "@/components/Frame";
import { TransitionLink } from "@/components/TransitionLink";
import { BlurHeading } from "@/components/Type";
import type { Film } from "@/data/types";
import { duration, films } from "@/data/videos";
import { hasFinePointer, prefersReducedMotion } from "@/utils/device";
import { optimizedUrl, pad } from "@/utils/media";

const time = (seconds: number) => (Number.isFinite(seconds) ? `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}` : "0:00");

/** Listens to the film's sound so the room can breathe with it. Only starts once audio is allowed. */
function useLoudness(video: HTMLVideoElement | null) {
  const level = useRef(0);
  const started = useRef(false);
  const start = useCallback(async () => {
    if (!video || started.current || prefersReducedMotion()) return;
    const Context = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Context) return;
    const context = new Context();
    await context.resume().catch(() => undefined);
    // Routing the sound through an analyser only once it can actually play keeps it audible.
    if (context.state !== "running") return void context.close();
    started.current = true;
    const analyser = context.createAnalyser();
    analyser.fftSize = 256;
    context.createMediaElementSource(video).connect(analyser);
    analyser.connect(context.destination);
    const bins = new Uint8Array(analyser.frequencyBinCount);
    const read = () => {
      analyser.getByteFrequencyData(bins);
      let sum = 0;
      for (let i = 0; i < 24; i++) sum += bins[i];
      level.current += (sum / (24 * 255) - level.current) * 0.2;
      requestAnimationFrame(read);
    };
    read();
  }, [video]);
  return { level, start };
}

/** A film on its own page: the room is lit by the film, the controls stay out of the way. */
export function ScreeningRoom({ film }: { film: Film }) {
  const stage = useRef<HTMLDivElement>(null);
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [length, setLength] = useState(film.seconds);
  const [buffered, setBuffered] = useState(0);
  const [idle, setIdle] = useState(false);
  const [needsSound, setNeedsSound] = useState(false);
  const { level, start } = useLoudness(video);

  const index = films.findIndex((item) => item.id === film.id);
  const previous = films[(index - 1 + films.length) % films.length];
  const next = films[(index + 1) % films.length];
  const vertical = film.height > film.width;

  // Try to start with sound (the click that brought you here usually allows it), else start muted.
  useEffect(() => {
    if (!video) return;
    video.play().then(
      () => void start(),
      () => {
        video.muted = true;
        setMuted(true);
        setNeedsSound(true);
        void video.play().catch(() => undefined);
      },
    );
  }, [video, start]);

  const toggle = useCallback(() => {
    if (!video) return;
    if (video.paused) void video.play().then(() => start());
    else video.pause();
  }, [video, start]);

  const unmute = () => {
    if (!video) return;
    video.muted = false;
    setMuted(false);
    setNeedsSound(false);
    void start();
  };

  const mute = () => {
    if (!video) return;
    video.muted = true;
    setMuted(true);
  };

  const fullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else if (stage.current?.requestFullscreen) void stage.current.requestFullscreen();
    else (video as HTMLVideoElement & { webkitEnterFullscreen?: () => void })?.webkitEnterFullscreen?.();
  };

  // Controls fade while the film plays and nobody moves.
  useEffect(() => {
    if (!playing) return setIdle(false);
    let timer = window.setTimeout(() => setIdle(true), 2400);
    const wake = () => {
      setIdle(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setIdle(true), 2400);
    };
    window.addEventListener("pointermove", wake);
    window.addEventListener("keydown", wake);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointermove", wake);
      window.removeEventListener("keydown", wake);
    };
  }, [playing]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!video || ["INPUT", "TEXTAREA", "SELECT"].includes((event.target as Element).tagName)) return;
      if (event.key === " " || event.key === "k") {
        if ((event.target as Element).tagName === "BUTTON" && event.key === " ") return;
        event.preventDefault();
        toggle();
      }
      if (event.key === "m") {
        if (video.muted) unmute();
        else mute();
      }
      if (event.key === "f") fullscreen();
      if (event.key === "ArrowRight") video.currentTime = Math.min(video.duration, video.currentTime + 5);
      if (event.key === "ArrowLeft") video.currentTime = Math.max(0, video.currentTime - 5);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // The picture leans a little toward the pointer, like a screen you could step around.
  useEffect(() => {
    const element = stage.current;
    if (!element || !hasFinePointer() || prefersReducedMotion()) return;
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = event.clientX / window.innerWidth - 0.5;
        const y = event.clientY / window.innerHeight - 0.5;
        element.style.transform = `perspective(1600px) rotateY(${(x * 4).toFixed(2)}deg) rotateX(${(-y * 3).toFixed(2)}deg)`;
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  const pct = length ? (current / length) * 100 : 0;

  return (
    <main id="main" className="relative isolate min-h-svh pb-16 pt-24 sm:pt-28">
      <AmbientBackdrop source={video} level={level} />

      <div className="gutter mb-5 flex items-center justify-between gap-4">
        <TransitionLink href="/" className="label sweep text-paper">
          ← Back to the work
        </TransitionLink>
        <p className="label tabular-nums">
          <span className="text-ember">{pad(index + 1)}</span> / {pad(films.length)}
        </p>
      </div>

      <div className="gutter grid items-start gap-8 lg:grid-cols-12 lg:gap-10">
        <motion.div initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className={vertical ? "lg:col-span-5 lg:col-start-2" : "lg:col-span-8"}>
          <div ref={stage} className={`screen group relative mx-auto overflow-hidden rounded-2xl bg-black transition-transform duration-300 ease-out ${idle ? "cursor-none" : ""}`} style={{ aspectRatio: `${film.width} / ${film.height}`, maxHeight: "76svh", maxWidth: vertical ? "calc(76svh * 9 / 16)" : undefined }}>
            <video
              ref={setVideo}
              src={film.src}
              poster={film.poster.src}
              playsInline
              preload="auto"
              muted={muted}
              onClick={toggle}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
              onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
              onLoadedMetadata={(event) => setLength(event.currentTarget.duration)}
              onProgress={(event) => {
                const media = event.currentTarget;
                if (media.buffered.length) setBuffered((media.buffered.end(media.buffered.length - 1) / (media.duration || 1)) * 100);
              }}
              className="h-full w-full object-contain"
              aria-label={`${film.title}, ${duration(film.seconds)}`}
            />

            <AnimatePresence>
              {!playing && (
                <motion.button key="play" type="button" onClick={toggle} aria-label="Play" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.2 }} transition={{ duration: 0.3 }} className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-ember text-2xl text-ink shadow-[0_20px_60px_-10px_rgb(255_106_61/0.8)]">
                  ▶
                </motion.button>
              )}
            </AnimatePresence>

            {needsSound && (
              <button type="button" onClick={unmute} className="pill absolute right-3 top-3 !px-4 !py-2">
                Tap for sound
              </button>
            )}

            <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-4 pb-3 pt-12 transition-opacity duration-500 ${idle ? "opacity-0" : "opacity-100"}`}>
              <div className="relative h-5">
                <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/15" aria-hidden />
                <span className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/25" style={{ width: `${buffered}%` }} aria-hidden />
                <span className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-ember" style={{ width: `${pct}%` }} aria-hidden />
                <input
                  type="range"
                  min={0}
                  max={length || 0}
                  step={0.1}
                  value={current}
                  aria-label="Seek"
                  aria-valuetext={`${time(current)} of ${time(length)}`}
                  onChange={(event) => video && (video.currentTime = Number(event.target.value))}
                  className="screen-seek absolute inset-0 w-full cursor-pointer"
                />
              </div>
              <div className="mt-1 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1">
                  <button type="button" onClick={toggle} className="ctrl -ml-2">
                    {playing ? "Pause" : "Play"}
                  </button>
                  <button type="button" onClick={muted ? unmute : mute} aria-pressed={muted} className="ctrl">
                    {muted ? "Unmute" : "Mute"}
                  </button>
                  <p className="label ml-2 tabular-nums">
                    {time(current)} / {time(length)}
                  </p>
                </div>
                <button type="button" onClick={fullscreen} className="ctrl -mr-2">
                  Full screen
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.aside initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }} className={vertical ? "lg:col-span-5 lg:col-start-8" : "lg:col-span-4"}>
          <p className="label text-ember">
            {film.category} / {duration(film.seconds)}
          </p>
          <BlurHeading as="h2" text={film.title} className="mt-3 text-[clamp(2.5rem,5vw,4.5rem)]" />
          <p className="mt-4 max-w-md text-[1.0625rem] leading-relaxed text-ash">{film.description}</p>
          <p className="label mt-4">Original file, {film.width} × {film.height}</p>

          <div className="mt-8 flex gap-2">
            <TransitionLink href={`/watch/${previous.id}`} morphSrc={optimizedUrl(previous.poster.src, 1200)} className="pill !px-4" aria-label={`Previous film: ${previous.title}`}>
              ←
            </TransitionLink>
            <TransitionLink href={`/watch/${next.id}`} morphSrc={optimizedUrl(next.poster.src, 1200)} className="pill">
              Next: {next.title} <span className="arrow" aria-hidden>→</span>
            </TransitionLink>
          </div>

          <p className="label mb-3 mt-10">More films</p>
          <ul className="grid grid-cols-2 gap-3">
            {films
              .filter((item) => item.id !== film.id)
              .map((item) => (
                <li key={item.id}>
                  <TransitionLink href={`/watch/${item.id}`} morphSrc={optimizedUrl(item.poster.src, 1200)} className="group block">
                    <span className="relative block aspect-video overflow-hidden rounded-xl bg-surface">
                      <Frame image={item.poster} sizes="(min-width: 1024px) 14vw, 45vw" className="transition-transform duration-700 ease-cine group-hover:scale-105" />
                      <span className="label absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 tabular-nums">{duration(item.seconds)}</span>
                    </span>
                    <span className="mt-2 block text-[0.9375rem] leading-tight transition-colors duration-300 group-hover:text-ember">{item.title}</span>
                  </TransitionLink>
                </li>
              ))}
          </ul>
        </motion.aside>
      </div>
    </main>
  );
}
