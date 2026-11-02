"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef } from "react";
import { hasFinePointer, prefersReducedMotion } from "@/utils/device";

const REACH = 12;
const SPRING = { stiffness: 260, damping: 18, mass: 0.4 };

/** Pulls its child gently toward the cursor, never more than 12px. */
export function Magnetic({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, SPRING);
  const y = useSpring(my, SPRING);

  const onMove = (event: React.PointerEvent) => {
    if (!ref.current || !hasFinePointer() || prefersReducedMotion()) return;
    const box = ref.current.getBoundingClientRect();
    mx.set(((event.clientX - box.left - box.width / 2) / (box.width / 2)) * REACH);
    my.set(((event.clientY - box.top - box.height / 2) / (box.height / 2)) * REACH);
  };
  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.span ref={ref} className={`inline-block ${className ?? ""}`} style={{ x, y }} onPointerMove={onMove} onPointerLeave={reset}>
      {children}
    </motion.span>
  );
}
