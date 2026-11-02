"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { hasFinePointer, prefersReducedMotion } from "@/utils/device";

const RING = { stiffness: 260, damping: 26, mass: 0.5 };

/** A red dot with a trailing ring that opens into a labelled disc over media. */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [link, setLink] = useState(false);
  const [visible, setVisible] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, RING);
  const ry = useSpring(y, RING);

  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return;
    setEnabled(true);
    document.documentElement.classList.add("has-cursor");

    const onMove = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      setVisible(true);
    };
    const onOver = (event: PointerEvent) => {
      const target = event.target as Element;
      setLabel(target.closest("[data-cursor]")?.getAttribute("data-cursor") ?? null);
      setLink(Boolean(target.closest("a, button, label")));
    };
    const onLeave = () => setVisible(false);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("has-cursor");
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[120]" style={{ opacity: visible ? 1 : 0 }}>
      <motion.div className="absolute left-0 top-0" style={{ x: rx, y: ry }}>
        <motion.div
          className={`-ml-10 -mt-10 flex h-20 w-20 items-center justify-center rounded-full border transition-colors duration-300 ${label ? "border-transparent bg-ember text-paper" : "border-ember/70"}`}
          initial={false}
          animate={{ scale: label ? 1 : link ? 0.7 : 0.45 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        >
          <span className={`font-mono text-[0.625rem] uppercase tracking-[0.12em] transition-opacity duration-200 ${label ? "opacity-100" : "opacity-0"}`}>{label}</span>
        </motion.div>
      </motion.div>
      <motion.div className="absolute left-0 top-0 -ml-[3px] -mt-[3px] h-1.5 w-1.5 rounded-full bg-ember" style={{ x, y, opacity: label ? 0 : 1 }} />
    </div>
  );
}
