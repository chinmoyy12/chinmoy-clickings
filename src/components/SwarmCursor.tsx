"use client";

import { useEffect, useRef } from "react";
import { devicePower, prefersReducedMotion } from "@/utils/device";

export interface Ring {
  x: number;
  y: number;
  r: number;
}

interface Props {
  /** Where the grains gather while the pointer rests or is away; without it they orbit the pointer, then melt away. */
  ring?: () => Ring | null;
  /** Change this number to make the swarm burst outward and regather. */
  pulse?: number;
  /** Grains on the most capable devices; others get fewer. */
  count?: number;
  className?: string;
}

const IDLE_MS = 1300;

/**
 * A swarm of light that chases the pointer: every grain rides its own spring around a
 * moving point, so the cloud stretches into a comet when you move and coils when you stop.
 */
export function SwarmCursor({ ring, pulse = 0, count = 900, className = "" }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const ringRef = useRef(ring);
  const burst = useRef<() => void>(() => undefined);
  ringRef.current = ring;

  useEffect(() => {
    const element = canvas.current;
    const host = element?.parentElement;
    const context = element?.getContext("2d");
    if (!element || !host || !context || prefersReducedMotion()) return;
    const power = devicePower();
    const n = power === "high" ? count : power === "mid" ? Math.round(count * 0.55) : Math.round(count * 0.3);

    // Each grain: position, velocity, its place in the cloud, and how tightly it follows.
    const x = new Float32Array(n);
    const y = new Float32Array(n);
    const vx = new Float32Array(n);
    const vy = new Float32Array(n);
    const angle = new Float32Array(n);
    const radius = new Float32Array(n);
    const spin = new Float32Array(n);
    const stiffness = new Float32Array(n);
    const warm = new Uint8Array(n);
    const bucket = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      angle[i] = Math.random() * Math.PI * 2;
      radius[i] = 4 + Math.random() ** 2 * 70;
      spin[i] = (0.4 + Math.random() * 1.4) * (Math.random() < 0.5 ? -1 : 1);
      stiffness[i] = 0.025 + Math.random() * 0.075;
      warm[i] = Math.random() < 0.22 ? 1 : 0;
    }

    let width = 0;
    let height = 0;
    const size = () => {
      const box = host.getBoundingClientRect();
      width = Math.max(1, Math.round(box.width));
      height = Math.max(1, Math.round(box.height));
      element.width = width;
      element.height = height;
    };
    size();
    const resize = new ResizeObserver(size);
    resize.observe(host);

    const pointer = { x: width / 2, y: height / 2, sx: width / 2, sy: height / 2, inside: false, moved: 0, seeded: false };
    let alpha = 0;
    const seed = (px: number, py: number) => {
      for (let i = 0; i < n; i++) {
        x[i] = px + (Math.random() - 0.5) * 40;
        y[i] = py + (Math.random() - 0.5) * 40;
        vx[i] = vy[i] = 0;
      }
      pointer.sx = px;
      pointer.sy = py;
      pointer.seeded = true;
    };
    const locate = (event: PointerEvent) => {
      const box = element.getBoundingClientRect();
      const px = event.clientX - box.left;
      const py = event.clientY - box.top;
      const inside = px >= 0 && py >= 0 && px <= box.width && py <= box.height;
      if (inside && !pointer.seeded) seed(px, py);
      pointer.x = px;
      pointer.y = py;
      pointer.inside = inside;
      if (inside) pointer.moved = performance.now();
      wake();
    };
    // Touch counts only while a finger is down; the swarm then rests on its ring.
    const onDown = (event: PointerEvent) => event.pointerType !== "mouse" && locate(event);
    const onUp = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") pointer.moved = 0;
    };
    const onLeave = () => {
      pointer.inside = false;
    };
    window.addEventListener("pointermove", locate, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    burst.current = () => {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 6 + Math.random() * 12;
        vx[i] += Math.cos(a) * s;
        vy[i] += Math.sin(a) * s;
      }
      wake();
    };

    let visible = false;
    let frame = 0;
    let running = false;
    let last = performance.now();
    const wake = () => {
      if (running || !visible) return;
      running = true;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
    });
    io.observe(host);

    const tick = (now: number) => {
      const f = Math.min(3, (now - last) / 16.67);
      last = now;
      const t = now / 1000;
      // With a ring to rest on, the swarm is there from the start, framing it.
      if (!pointer.seeded && ringRef.current) {
        const start = ringRef.current();
        if (start) seed(start.x, start.y);
      }
      const html = document.documentElement;
      if (!visible) {
        context.clearRect(0, 0, width, height);
        running = false;
        return;
      }
      // The intro and the launch rebuild have the stage first; wait for them rather than stopping.
      if (html.dataset.intro !== "done" || html.dataset.rebuild) {
        context.clearRect(0, 0, width, height);
        alpha = 0;
        frame = requestAnimationFrame(tick);
        return;
      }
      const idle = !pointer.inside || now - pointer.moved > IDLE_MS;
      const target = idle ? ringRef.current?.() ?? null : null;
      const showing = pointer.seeded && (!idle || target !== null || now - pointer.moved < IDLE_MS + 2600);
      alpha += ((showing ? (idle && !target ? 0.45 : 1) : 0) - alpha) * 0.06 * f;
      if (!showing && alpha < 0.01) {
        context.clearRect(0, 0, width, height);
        running = false;
        return;
      }
      frame = requestAnimationFrame(tick);

      // The heart of the swarm lags a little behind the pointer, so the cloud trails it.
      pointer.sx += (pointer.x - pointer.sx) * 0.22 * f;
      pointer.sy += (pointer.y - pointer.sy) * 0.22 * f;

      context.globalCompositeOperation = "source-over";
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "lighter";
      context.lineCap = "round";

      const damping = 0.86 ** f;
      for (let i = 0; i < n; i++) {
        let tx: number;
        let ty: number;
        let k = stiffness[i];
        if (target) {
          // Resting: the grains become a frame, spread evenly around the ring and slowly turning.
          const a = (i / n) * Math.PI * 2 + t * 0.12 * Math.sign(spin[i]);
          const wobble = Math.sin(t * 1.7 + angle[i] * 3) * 6 + (radius[i] - 37) * 0.18;
          tx = target.x + Math.cos(a) * (target.r + wobble);
          ty = target.y + Math.sin(a) * (target.r + wobble);
          k *= 0.55;
        } else {
          // Following: each grain circles its own point near the pointer.
          const a = angle[i] + t * spin[i];
          const spread = idle ? 0.55 : 1;
          tx = pointer.sx + Math.cos(a) * radius[i] * spread;
          ty = pointer.sy + Math.sin(a) * radius[i] * spread;
        }
        vx[i] = (vx[i] + (tx - x[i]) * k * f) * damping;
        vy[i] = (vy[i] + (ty - y[i]) * k * f) * damping;
        x[i] += vx[i] * f;
        y[i] += vy[i] * f;
        // Fast grains streak and shine; slow ones are faint points. Sorted into a few batches to draw.
        const speed = Math.abs(vx[i]) + Math.abs(vy[i]);
        bucket[i] = warm[i] * 3 + (speed < 1.5 ? 0 : speed < 6 ? 1 : 2);
      }
      for (let b = 0; b < 6; b++) {
        const hot = b >= 3;
        const a = [0.38, 0.62, 0.95][b % 3] * alpha;
        context.strokeStyle = hot ? `rgba(255,120,72,${a.toFixed(3)})` : `rgba(236,233,226,${(a * 0.85).toFixed(3)})`;
        context.lineWidth = hot ? 1.8 : 1.3;
        context.beginPath();
        for (let i = 0; i < n; i++) {
          if (bucket[i] !== b) continue;
          context.moveTo(x[i] - vx[i] * 1.6, y[i] - vy[i] * 1.6);
          context.lineTo(x[i] + 0.01, y[i]);
        }
        context.stroke();
      }
    };

    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", locate);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [count]);

  // A new pulse value throws the swarm outward.
  useEffect(() => {
    if (pulse) burst.current();
  }, [pulse]);

  return <canvas ref={canvas} aria-hidden className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
}
