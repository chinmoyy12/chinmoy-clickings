"use client";

import { useEffect, useRef, useState } from "react";
import { hasFinePointer, prefersReducedMotion } from "@/utils/device";

const NATIVE = "input, textarea, select, [role='slider'], [role='dialog'], video";

/** A sharp pointer mark over the native cursor. Never intercepts input. */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const mark = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return;
    setEnabled(true);
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
    <div ref={mark} data-pointer aria-hidden className="cursor-mark pointer-events-none fixed left-0 top-0 z-[121] opacity-0">
      <span />
    </div>
  );
}
