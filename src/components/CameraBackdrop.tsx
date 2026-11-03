"use client";

import { useEffect, useRef, useState } from "react";
import { photos } from "@/data/photos";
import { canUseWebGL, devicePower, hasFinePointer, prefersReducedMotion } from "@/utils/device";
import { optimizedUrl } from "@/utils/media";

// Landscape frames suit the camera's 3:2 screen.
const SCREEN = photos.filter((photo) => photo.width > photo.height).map((photo) => optimizedUrl(photo.src, 640));

/** Chinmoy's α6400 behind the intro: drag to turn it, click to fire the shutter. */
export function CameraBackdrop({ className = "" }: { className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const flash = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const element = canvas.current;
    const section = element?.closest("section");
    if (!element || !section) return;
    const input = { x: 0, y: 0, scroll: 0 };
    let teardown: (() => void) | undefined;
    let cancelled = false;

    // Progress of the camera itself across the screen, so the zoom and screen flip happen in view.
    const onScroll = () => {
      const box = element.getBoundingClientRect();
      input.scroll = Math.min(1, Math.max(0, (window.innerHeight - box.top) / (window.innerHeight + box.height)));
    };
    const onPointer = (event: PointerEvent) => {
      input.x = event.clientX / window.innerWidth - 0.5;
      input.y = event.clientY / window.innerHeight - 0.5;
    };
    const onShutter = () => {
      if (!flash.current || prefersReducedMotion()) return;
      flash.current.animate([{ opacity: 0.85 }, { opacity: 0 }], { duration: 420, easing: "ease-out" });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    if (hasFinePointer()) window.addEventListener("pointermove", onPointer, { passive: true });
    element.addEventListener("cc:shutter", onShutter);

    // Build it once the intro has landed and the browser is idle, never on devices that cannot draw it.
    const build = () => {
      if (cancelled || !canUseWebGL()) return;
      void import("@/three/CameraScene")
        .then(async ({ createCameraScene }) => {
          if (cancelled || !canvas.current) return;
          const font = getComputedStyle(document.body).fontFamily;
          const stop = await createCameraScene(canvas.current, input, SCREEN, { animate: !prefersReducedMotion() && devicePower() !== "low", font });
          if (cancelled) return stop();
          teardown = stop;
          setLive(true);
        })
        .catch(() => setLive(false));
    };
    // Safari has no requestIdleCallback; a short delay stands in for it.
    const whenIdle = (run: () => void) => (typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(run, { timeout: 2500 }) : setTimeout(run, 400));
    const afterIntro = () => {
      const html = document.documentElement;
      if (html.dataset.landed) return whenIdle(build);
      const watch = new MutationObserver(() => {
        if (!html.dataset.landed) return;
        watch.disconnect();
        whenIdle(build);
      });
      watch.observe(html, { attributes: true, attributeFilter: ["data-landed"] });
      stopWatching = () => watch.disconnect();
    };
    let stopWatching = () => undefined as void;
    const gate = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        gate.disconnect();
        afterIntro();
      },
      { rootMargin: "100% 0px" },
    );
    gate.observe(element);

    return () => {
      cancelled = true;
      gate.disconnect();
      stopWatching();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointer);
      element.removeEventListener("cc:shutter", onShutter);
      teardown?.();
    };
  }, []);

  return (
    <div className={`camera-backdrop ${className}`}>
      <div className="camera-glow absolute inset-0" aria-hidden />
      <canvas
        ref={canvas}
        role="img"
        aria-label="A 3D model of Chinmoy's Sony α6400 with its 18–135mm lens. Drag to turn it and click to fire the shutter."
        className={`pointer-events-auto absolute inset-0 h-full w-full cursor-grab touch-pan-y transition-opacity duration-700 active:cursor-grabbing ${live ? "opacity-100" : "opacity-0"}`}
      />
      <div ref={flash} className="pointer-events-none absolute inset-0 rounded-full bg-white opacity-0 mix-blend-overlay" aria-hidden />
      <p className={`label pointer-events-none absolute bottom-0 right-0 text-paper/60 lg:bottom-auto lg:top-0 transition-opacity duration-700 ${live ? "opacity-100" : "opacity-0"}`} aria-hidden>
        <span className="normal-case">α</span>6400 / Drag to turn · Click to shoot
      </p>
    </div>
  );
}
