"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { hasFinePointer, prefersReducedMotion } from "@/utils/device";

const SPRING = { stiffness: 620, damping: 44, mass: 0.5 };

let setExternalLabel: ((label: string | null) => void) | null = null;

/** For surfaces with no DOM targets to hover, such as the WebGL canvas. */
export const setCursorLabel = (label: string | null) => setExternalLabel?.(label);

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [external, setExternal] = useState<string | null>(null);
  const [link, setLink] = useState(false);
  const [visible, setVisible] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, SPRING);
  const sy = useSpring(y, SPRING);

  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return;
    setEnabled(true);
    setExternalLabel = setExternal;
    document.documentElement.classList.add("has-cursor");

    const onMove = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
    };
    const onOver = (event: PointerEvent) => {
      const target = event.target as Element;
      setLabel(target.closest("[data-cursor]")?.getAttribute("data-cursor") ?? null);
      setLink(Boolean(target.closest("a, button")));
    };
    const onLeave = () => setVisible(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      setExternalLabel = null;
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("has-cursor");
    };
  }, [x, y]);

  if (!enabled) return null;
  const text = external ?? label;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[120]"
      style={{ x: sx, y: sy, opacity: visible ? 1 : 0 }}
    >
      <motion.div
        className="-ml-12 -mt-12 flex h-24 w-24 items-center justify-center rounded-full bg-paper text-center text-ink"
        initial={false}
        animate={{ scale: text ? 1 : link ? 0.2 : 0.1 }}
        transition={{ type: "spring", stiffness: 420, damping: 34 }}
      >
        <motion.span
          className="px-2 text-[0.625rem] uppercase leading-tight tracking-[0.12em]"
          initial={false}
          animate={{ opacity: text ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {text}
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
