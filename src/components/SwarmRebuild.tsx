"use client";

import { useEffect, useRef } from "react";
import { devicePower, hasFinePointer, prefersReducedMotion } from "@/utils/device";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tx: number;
  ty: number;
  colour: string;
  size: number;
  seed: number;
}

// Milliseconds from the moment the title lands.
const BURST = 380;
const SWARM_END = 2300;
const REBUILD_END = 3700;
const DONE = 4300;

let played = false;

/** Opened fresh at the home page (a first visit or a refresh), not reached by moving around the site. */
function freshHomeLoad() {
  const entry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  const first = entry ? new URL(entry.name).pathname : location.pathname;
  return first === "/" && location.pathname === "/";
}

/** Where every particle belongs: pixels of the hero title, drawn exactly where the real letters sit. */
function sampleTitle(parts: HTMLElement[], budget: number) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true })!;
  context.fillStyle = "#fff";
  for (const part of parts) {
    const box = part.getBoundingClientRect();
    const style = getComputedStyle(part);
    context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    (context as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = style.letterSpacing;
    const text = part.textContent ?? "";
    const metrics = context.measureText(text);
    const ascent = metrics.fontBoundingBoxAscent;
    const lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize);
    const baseline = box.top + parseFloat(style.paddingTop) + (lineHeight - (ascent + metrics.fontBoundingBoxDescent)) / 2 + ascent;
    context.fillText(text, box.left + parseFloat(style.paddingLeft), baseline);
  }
  const step = Math.max(3, Math.round(width / 420));
  const pixels = context.getImageData(0, 0, width, height).data;
  const points: [number, number][] = [];
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) if (pixels[(y * width + x) * 4 + 3] > 128) points.push([x, y]);
  }
  // Keep an even spread when there are more pixels than particles.
  for (let i = points.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [points[i], points[j]] = [points[j], points[i]];
  }
  return points.slice(0, budget);
}

/**
 * On a fresh load of the home page, the title shatters into a swarm that chases the
 * cursor, then flies back and rebuilds the word before the real letters return.
 */
export function SwarmRebuild() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (played || prefersReducedMotion() || !freshHomeLoad()) return;
    const html = document.documentElement;
    let frame = 0;
    let stopped = false;
    let teardown = () => undefined as void;

    const run = () => {
      const element = canvas.current;
      const title = document.querySelector<HTMLElement>(".hero-giant");
      const parts = [...document.querySelectorAll<HTMLElement>(".hero-part")];
      const context = element?.getContext("2d");
      if (!element || !context || !title || !parts.length || window.scrollY > 40) return;

      const width = window.innerWidth;
      const height = window.innerHeight;
      element.width = width;
      element.height = height;
      const budget = devicePower() === "high" ? 1600 : devicePower() === "mid" ? 900 : 500;
      const targets = sampleTitle(parts, budget);
      if (!targets.length) return;
      played = true;
      html.dataset.rebuild = "playing";
      const titleBox = title.getBoundingClientRect();
      const particles: Particle[] = targets.map(([tx, ty]) => {
        const depth = (ty - titleBox.top) / Math.max(1, titleBox.height);
        const shade = Math.round(255 - Math.min(1, Math.max(0, depth)) * 70);
        return {
          x: tx,
          y: ty,
          vx: 0,
          vy: 0,
          tx,
          ty,
          colour: Math.random() < 0.16 ? "255,106,61" : `${shade},${shade},${Math.min(255, shade + 6)}`,
          size: Math.random() < 0.2 ? 2.4 : 1.6,
          seed: Math.random() * Math.PI * 2,
        };
      });

      // The real title steps aside while its particles fly.
      title.style.transition = "none";
      title.style.opacity = "0";

      const centre = { x: titleBox.left + titleBox.width / 2, y: titleBox.top + titleBox.height / 2 - height * 0.15 };
      const pointer = { x: centre.x, y: centre.y, live: false };
      const onMove = (event: PointerEvent) => {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.live = true;
      };
      if (hasFinePointer()) window.addEventListener("pointermove", onMove, { passive: true });

      const restoreTitle = () => {
        title.style.transition = "opacity 0.6s ease";
        title.style.opacity = "";
      };
      const finish = () => {
        if (stopped) return;
        stopped = true;
        delete html.dataset.rebuild;
        cancelAnimationFrame(frame);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("scroll", onScroll);
        restoreTitle();
        context.clearRect(0, 0, width, height);
        element.style.display = "none";
      };
      // Scrolling away moves the title; end cleanly rather than rebuild it in the wrong place.
      const onScroll = () => window.scrollY > 60 && finish();
      window.addEventListener("scroll", onScroll, { passive: true });
      teardown = finish;

      const start = performance.now();
      let last = start;
      let titleBack = false;
      const tick = (now: number) => {
        frame = requestAnimationFrame(tick);
        const t = now - start;
        // Without a mouse, the swarm follows a slow loop around the screen instead.
        const goal = pointer.live ? pointer : { x: centre.x + Math.cos(t / 520) * width * 0.22, y: centre.y + Math.sin(t / 380) * height * 0.16 };

        context.globalCompositeOperation = "source-over";
        context.clearRect(0, 0, width, height);
        context.globalCompositeOperation = "lighter";
        const fade = t > REBUILD_END - 300 ? Math.max(0, 1 - (t - (REBUILD_END - 300)) / (DONE - REBUILD_END + 300)) : 1;

        // Motion is measured in 60fps steps, so it looks the same on fast and slow screens.
        const f = Math.min(4, (now - last) / 16.67);
        last = now;
        const rebuilt = Math.min(1, Math.max(0, (t - SWARM_END) / (REBUILD_END - SWARM_END)));

        for (const p of particles) {
          if (t < BURST) {
            // The word bursts: every grain is thrown out from where it sat.
            if (p.vx === 0 && p.vy === 0) {
              const angle = Math.atan2(p.y - centre.y, p.x - centre.x) + (Math.random() - 0.5) * 1.2;
              const speed = 7 + Math.random() * 11;
              p.vx = Math.cos(angle) * speed;
              p.vy = Math.sin(angle) * speed;
            }
            p.vx *= 0.92 ** f;
            p.vy *= 0.92 ** f;
          } else if (t < SWARM_END) {
            // The swarm: drawn hard to the cursor, then circling it in a loose cloud.
            const dx = goal.x - p.x;
            const dy = goal.y - p.y;
            const distance = Math.hypot(dx, dy) + 0.001;
            const near = Math.min(1, 140 / distance);
            const pull = 0.95 - near * 0.55;
            const orbit = 0.25 + near * 0.9;
            p.vx += ((dx / distance) * pull + (-dy / distance) * orbit + Math.cos(t / 240 + p.seed) * 0.4) * f;
            p.vy += ((dy / distance) * pull + (dx / distance) * orbit + Math.sin(t / 280 + p.seed) * 0.4) * f;
            p.vx *= 0.92 ** f;
            p.vy *= 0.92 ** f;
          } else {
            // The rebuild: a spring that tightens until every grain is home.
            const k = 0.02 + rebuilt * 0.12;
            p.vx = (p.vx + (p.tx - p.x) * k * f) * 0.78 ** f;
            p.vy = (p.vy + (p.ty - p.y) * k * f) * 0.78 ** f;
          }
          p.x += p.vx * f;
          p.y += p.vy * f;
          // In the last stretch every grain is eased onto its letter, however few frames there were.
          if (rebuilt > 0.6) {
            const settle = Math.min(1, (rebuilt - 0.6) * 2.5);
            p.x += (p.tx - p.x) * settle * 0.35;
            p.y += (p.ty - p.y) * settle * 0.35;
          }
          const glow = t < SWARM_END ? 0.85 : 0.95;
          context.fillStyle = `rgba(${p.colour},${(glow * fade).toFixed(3)})`;
          context.fillRect(p.x, p.y, p.size, p.size);
        }

        if (!titleBack && t > REBUILD_END - 250) {
          titleBack = true;
          restoreTitle();
        }
        if (t > DONE) finish();
      };
      frame = requestAnimationFrame(tick);
    };

    // Begin the moment the intro hands the title over.
    const begin = () => requestAnimationFrame(() => requestAnimationFrame(run));
    let watch: MutationObserver | undefined;
    if (html.dataset.landed) begin();
    else {
      watch = new MutationObserver(() => {
        if (!html.dataset.landed) return;
        watch?.disconnect();
        begin();
      });
      watch.observe(html, { attributes: true, attributeFilter: ["data-landed"] });
    }
    return () => {
      watch?.disconnect();
      teardown();
    };
  }, []);

  return <canvas ref={canvas} aria-hidden className="pointer-events-none fixed inset-0 z-[60] h-full w-full" />;
}
