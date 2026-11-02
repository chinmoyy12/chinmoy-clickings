"use client";

import { useEffect, useRef, useState } from "react";
import { GhostCursor } from "@/components/GhostCursor";
import { devicePower, hasFinePointer, prefersReducedMotion } from "@/utils/device";

const NATIVE = "input, textarea, select, [role='slider'], [role='dialog'], video";

/** A sharp pointer mark and light smoke over the native cursor. Never intercepts input. */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [ghost, setGhost] = useState(false);
  const mark = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return;
    setEnabled(true);
    setGhost(devicePower() === "high");
  }, []);

  useEffect(() => {
    const pointer = mark.current;
    if (!enabled || !pointer) return;

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const target = event.target as Element;
      pointer.style.opacity = target.closest?.(NATIVE) ? "0" : "1";
      pointer.dataset.hover = target.closest?.("a, button, label") ? "true" : "false";
      pointer.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      // Glass panels carry a soft light that tracks the pointer.
      const panel = target.closest?.<HTMLElement>(".glass");
      if (panel) {
        const box = panel.getBoundingClientRect();
        panel.style.setProperty("--mx", `${event.clientX - box.left}px`);
        panel.style.setProperty("--my", `${event.clientY - box.top}px`);
      }
    };
    const onLeave = () => {
      pointer.style.opacity = "0";
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <>
      {ghost && <GhostCursor />}
      <div ref={mark} data-pointer aria-hidden className="cursor-mark pointer-events-none fixed left-0 top-0 z-[121] opacity-0">
        <span />
      </div>
    </>
  );
}
