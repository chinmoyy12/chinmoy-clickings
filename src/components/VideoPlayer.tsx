"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Frame } from "@/components/Frame";
import type { Film } from "@/data/types";
import { useModal } from "@/hooks/useModal";

const time = (seconds: number) => {
  if (!Number.isFinite(seconds)) return "0:00";
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;
};

/** Full-screen player: everything but the picture stays out of the way. */
export function VideoPlayer({ film, onClose }: { film: Film; onClose: () => void }) {
  const ref = useModal<HTMLDivElement>(onClose);
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [failed, setFailed] = useState(false);
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    void element.play().catch(() => setPlaying(false));
  }, []);

  useEffect(() => {
    if (!playing) return setIdle(false);
    let timer = window.setTimeout(() => setIdle(true), 2600);
    const wake = () => {
      setIdle(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setIdle(true), 2600);
    };
    window.addEventListener("pointermove", wake);
    window.addEventListener("keydown", wake);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("pointermove", wake);
      window.removeEventListener("keydown", wake);
    };
  }, [playing]);

  const toggle = () => {
    const element = video.current;
    if (!element) return;
    if (element.paused) void element.play();
    else element.pause();
  };
  const fullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void ref.current?.requestFullscreen?.();
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const element = video.current;
      if (!element || (event.target as Element).tagName === "INPUT") return;
      if (event.key === " " && (event.target as Element).tagName !== "BUTTON") {
        event.preventDefault();
        toggle();
      }
      if (event.key === "m") setMuted((value) => !value);
      if (event.key === "f") fullscreen();
      if (event.key === "ArrowRight") element.currentTime += 5;
      if (event.key === "ArrowLeft") element.currentTime -= 5;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const pct = duration ? (current / duration) * 100 : 0;

  return createPortal(
    <motion.div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={`${film.title} video player`}
      className={`fixed inset-0 z-[95] flex items-center justify-center bg-black ${idle ? "cursor-none" : ""}`}
      initial={{ clipPath: "inset(12% 12% 12% 12%)", opacity: 0 }}
      animate={{ clipPath: "inset(0% 0% 0% 0%)", opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
    >
      {failed ? (
        <div className="absolute inset-0">
          <Frame image={film.poster} sizes="100vw" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/55">
            <p className="label text-paper">This film could not be loaded</p>
          </div>
        </div>
      ) : (
        <video
          ref={video}
          src={film.src}
          poster={film.poster.src}
          muted={muted}
          playsInline
          preload="auto"
          className="h-full w-full object-contain"
          onClick={toggle}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(event) => setCurrent(event.currentTarget.currentTime)}
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
          onError={() => setFailed(true)}
        />
      )}

      <div className={`absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent px-[var(--gutter)] py-2 transition-opacity duration-500 ${idle ? "opacity-0" : ""}`}>
        <p className="label truncate text-paper">
          {film.title} <span className="text-ash">/ {film.category}</span>
        </p>
        <button type="button" onClick={onClose} data-autofocus className="ctrl -mr-2">
          Close
        </button>
      </div>

      {!failed && (
        <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-[var(--gutter)] pb-2 pt-8 transition-opacity duration-500 ${idle ? "opacity-0" : ""}`}>
          <input
            type="range"
            className="scrub block"
            min={0}
            max={duration || 0}
            step={0.1}
            value={current}
            aria-label="Seek"
            aria-valuetext={`${time(current)} of ${time(duration)}`}
            style={{ "--pct": `${pct}%` } as React.CSSProperties}
            onChange={(event) => {
              if (video.current) video.current.currentTime = Number(event.target.value);
            }}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button type="button" onClick={toggle} className="ctrl -ml-2">
                {playing ? "Pause" : "Play"}
              </button>
              <button type="button" onClick={() => setMuted(!muted)} aria-pressed={muted} className="ctrl">
                {muted ? "Unmute" : "Mute"}
              </button>
            </div>
            <div className="flex items-center gap-4">
              <p className="label tabular-nums max-sm:hidden">
                {time(current)} / {time(duration)}
              </p>
              <button type="button" onClick={fullscreen} className="ctrl -mr-2">
                Full
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>,
    document.body,
  );
}
