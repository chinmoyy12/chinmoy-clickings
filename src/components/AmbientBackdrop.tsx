"use client";

import { useEffect, useRef } from "react";
import { hasFinePointer, prefersReducedMotion } from "@/utils/device";

/**
 * A light field painted from the picture itself: the current film frame or photo is
 * redrawn into a tiny canvas and blown up behind it, so the room glows in the work's
 * own colours. It drifts in depth with the pointer and, for films, breathes with the sound.
 */
export function AmbientBackdrop({ source, level }: { source: HTMLVideoElement | HTMLImageElement | null; level?: React.RefObject<number> }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext("2d", { willReadFrequently: false });
    if (!element || !context || !source) return;
    const still = prefersReducedMotion();
    const pointer = { x: 0, y: 0, ex: 0, ey: 0 };
    let frame = 0;
    let lastPaint = 0;

    const paint = () => {
      const ready = source instanceof HTMLVideoElement ? source.readyState >= 2 : source.complete && source.naturalWidth > 0;
      if (!ready) return;
      try {
        context.drawImage(source, 0, 0, element.width, element.height);
      } catch {
        // A frame that cannot be read yet; the next one will be.
      }
    };

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      // Films repaint about 15 times a second, plenty for light this soft.
      if (source instanceof HTMLVideoElement && now - lastPaint > (still ? 250 : 66)) {
        lastPaint = now;
        paint();
      }
      if (!layer.current) return;
      pointer.ex += (pointer.x - pointer.ex) * 0.05;
      pointer.ey += (pointer.y - pointer.ey) * 0.05;
      const pulse = level?.current ?? 0;
      layer.current.style.transform = `translate3d(${(pointer.ex * -28).toFixed(1)}px, ${(pointer.ey * -22).toFixed(1)}px, 0) scale(${(1.25 + pulse * 0.12).toFixed(3)})`;
      layer.current.style.opacity = String(Math.min(0.95, 0.62 + pulse * 0.35));
    };

    paint();
    if (source instanceof HTMLImageElement) source.addEventListener("load", paint);
    const onMove = (event: PointerEvent) => {
      pointer.x = event.clientX / window.innerWidth - 0.5;
      pointer.y = event.clientY / window.innerHeight - 0.5;
    };
    if (hasFinePointer() && !still) window.addEventListener("pointermove", onMove, { passive: true });
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      if (source instanceof HTMLImageElement) source.removeEventListener("load", paint);
    };
  }, [source, level]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink" aria-hidden>
      <div ref={layer} className="absolute inset-[-10%] opacity-60 transition-opacity duration-700 will-change-transform">
        <canvas ref={canvas} width={48} height={27} className="ambient-canvas h-full w-full" />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_10%,rgb(8_8_10/0.55)_55%,rgb(8_8_10/0.92)_100%)]" />
      <div className="grain absolute inset-0 opacity-[0.07]" />
    </div>
  );
}
