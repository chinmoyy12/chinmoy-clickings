"use client";

import { useEffect, useRef, useState } from "react";
import { hasFinePointer, prefersReducedMotion } from "@/utils/device";

const COLORS = ["#ff6a3d", "#ff6a3d", "#ffb199", "#ece9e2"];
const POOL = 24;
const SPACING = 20;
const NATIVE = "input, textarea, select, [role='slider'], [role='dialog'], video";

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

/** A sharp pointer mark and short shard trail over the native cursor. Never intercepts input. */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const mark = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasFinePointer() && !prefersReducedMotion()) setEnabled(true);
  }, []);

  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext("2d");
    const pointer = mark.current;
    if (!enabled || !element || !context || !pointer) return;

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
      slowFrames = lastTime && now - lastTime > 45 ? slowFrames + 1 : Math.max(0, slowFrames - 1);
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
        shard.life -= 0.03;
        shard.x += shard.vx;
        shard.y += shard.vy;
        shard.vx *= 0.94;
        shard.vy *= 0.94;
        shard.angle += shard.spin;
        const scale = shard.size * Math.max(0.2, shard.life);
        context.save();
        context.translate(shard.x, shard.y);
        context.rotate(shard.angle);
        context.globalAlpha = Math.max(0, shard.life);
        context.fillStyle = shard.color;
        context.beginPath();
        context.moveTo(0, -scale);
        context.lineTo(scale * 0.6, scale * 0.7);
        context.lineTo(-scale * 0.6, scale * 0.7);
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
      const target = event.target as Element;
      const native = Boolean(target.closest?.(NATIVE));
      pointer.style.opacity = native ? "0" : "1";
      pointer.dataset.hover = target.closest?.("a, button, label") ? "true" : "false";
      pointer.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      // Glass panels carry a soft light that tracks the pointer.
      const panel = target.closest?.<HTMLElement>(".glass");
      if (panel) {
        const box = panel.getBoundingClientRect();
        panel.style.setProperty("--mx", `${event.clientX - box.left}px`);
        panel.style.setProperty("--my", `${event.clientY - box.top}px`);
      }
      if (native || Math.hypot(event.clientX - lastX, event.clientY - lastY) < SPACING) return;
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      lastX = event.clientX;
      lastY = event.clientY;
      const shard = pool[next];
      next = (next + 1) % POOL;
      shard.x = event.clientX;
      shard.y = event.clientY;
      // Shards lag behind the direction of travel.
      shard.vx = -dx * 0.03 + (Math.random() - 0.5) * 0.7;
      shard.vy = -dy * 0.03 + (Math.random() - 0.5) * 0.7;
      shard.spin = (Math.random() - 0.5) * 0.16;
      shard.angle = Math.random() * 6.28;
      shard.size = 3 + Math.random() * 3.5;
      shard.life = 1;
      shard.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      if (!running) {
        running = true;
        frame = requestAnimationFrame(draw);
      }
    };
    const onLeave = () => {
      pointer.style.opacity = "0";
    };

    const stop = () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", size);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      context.clearRect(0, 0, element.width, element.height);
      pointer.style.opacity = "0";
    };

    size();
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", size);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return stop;
  }, [enabled]);

  if (!enabled) return null;
  return (
    <>
      <canvas ref={canvas} data-shards aria-hidden className="pointer-events-none fixed inset-0 z-[120] h-full w-full" />
      <div ref={mark} data-pointer aria-hidden className="cursor-mark pointer-events-none fixed left-0 top-0 z-[121] opacity-0">
        <span />
      </div>
    </>
  );
}
