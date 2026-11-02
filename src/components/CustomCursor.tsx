"use client";

import { useEffect, useRef, useState } from "react";
import { hasFinePointer, prefersReducedMotion } from "@/utils/device";

const COLORS = ["#e8262d", "#e8262d", "#ff7b8a", "#35c7c9", "#a9d4ff", "#f5b25a"];
const POOL = 36;
const SPACING = 22;
const INTERACTIVE = "a, button, input, label, video, [role='dialog']";

interface Shard {
  x: number;
  y: number;
  vx: number;
  vy: number;
  spin: number;
  angle: number;
  size: number;
  life: number;
  color: string;
}

/** A sparse trail of triangular shards behind the native cursor. Never intercepts input. */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (hasFinePointer() && !prefersReducedMotion()) setEnabled(true);
  }, []);

  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext("2d");
    if (!enabled || !element || !context) return;

    const pool: Shard[] = Array.from({ length: POOL }, () => ({ x: 0, y: 0, vx: 0, vy: 0, spin: 0, angle: 0, size: 0, life: 0, color: COLORS[0] }));
    let next = 0;
    let frame = 0;
    let running = false;
    let lastX = 0;
    let lastY = 0;
    let lastTime = 0;
    let slowFrames = 0;

    const size = () => {
      element.width = window.innerWidth;
      element.height = window.innerHeight;
    };

    const draw = (now: number) => {
      const slow = lastTime && now - lastTime > 45;
      slowFrames = slow ? slowFrames + 1 : Math.max(0, slowFrames - 1);
      lastTime = now;
      if (slowFrames > 30) {
        // The device is struggling: drop the decoration, keep the page.
        stop();
        return;
      }
      context.clearRect(0, 0, element.width, element.height);
      let alive = 0;
      for (const shard of pool) {
        if (shard.life <= 0) continue;
        alive++;
        shard.life -= 0.022;
        shard.x += shard.vx;
        shard.y += shard.vy;
        shard.vx *= 0.96;
        shard.vy = shard.vy * 0.96 + 0.015;
        shard.angle += shard.spin;
        context.save();
        context.translate(shard.x, shard.y);
        context.rotate(shard.angle);
        context.globalAlpha = Math.max(0, shard.life);
        context.fillStyle = shard.color;
        context.beginPath();
        context.moveTo(0, -shard.size);
        context.lineTo(shard.size * 0.7, shard.size * 0.7);
        context.lineTo(-shard.size * 0.7, shard.size * 0.7);
        context.closePath();
        context.fill();
        context.restore();
      }
      if (alive) {
        frame = requestAnimationFrame(draw);
      } else {
        running = false;
        lastTime = 0;
      }
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      if (Math.hypot(event.clientX - lastX, event.clientY - lastY) < SPACING) return;
      lastX = event.clientX;
      lastY = event.clientY;
      if ((event.target as Element).closest?.(INTERACTIVE)) return;
      const shard = pool[next];
      next = (next + 1) % POOL;
      shard.x = event.clientX + 10;
      shard.y = event.clientY + 12;
      shard.vx = (Math.random() - 0.5) * 1.2;
      shard.vy = (Math.random() - 0.5) * 1.2;
      shard.spin = (Math.random() - 0.5) * 0.14;
      shard.angle = Math.random() * 6.28;
      shard.size = 3 + Math.random() * 3.5;
      shard.life = 1;
      shard.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      if (!running) {
        running = true;
        frame = requestAnimationFrame(draw);
      }
    };

    const stop = () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", size);
      context.clearRect(0, 0, element.width, element.height);
    };

    size();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", size);
    return stop;
  }, [enabled]);

  if (!enabled) return null;
  return <canvas ref={canvas} data-shards aria-hidden className="pointer-events-none fixed inset-0 z-[120] h-full w-full" />;
}
