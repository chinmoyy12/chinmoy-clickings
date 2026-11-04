"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { guideLines } from "@/data/story";
import { prefersReducedMotion } from "@/utils/device";

const ORDER = ["about", "story", "work", "films", "photo", "play", "hire", "contact"];

/** A small version of Chinmoy who narrates each section and jumps to the next one when tapped. */
export function AvatarGuide() {
  const pathname = usePathname();
  const [section, setSection] = useState("hero");
  const [talking, setTalking] = useState(true);
  const [muted, setMuted] = useState(false);
  const timer = useRef(0);

  useEffect(() => {
    const check = () => {
      const mid = window.innerHeight * 0.45;
      const current = [...document.querySelectorAll<HTMLElement>("section[id]")].find((node) => {
        const box = node.getBoundingClientRect();
        return box.top <= mid && box.bottom > mid;
      });
      setSection(current && guideLines[current.id] ? current.id : window.scrollY < window.innerHeight * 0.5 ? "hero" : (current?.id ?? "hero"));
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);

  useEffect(() => {
    setTalking(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setTalking(false), 5200);
    return () => window.clearTimeout(timer.current);
  }, [section]);

  if (pathname !== "/") return null;

  const line = guideLines[section] ?? guideLines.hero;
  const next = () => {
    const after = ORDER[ORDER.indexOf(section) + 1] ?? (section === "hero" ? ORDER[0] : "main");
    document.getElementById(after)?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  return (
    <div className="intro-late fixed bottom-[8.5rem] left-3 z-[70] sm:bottom-[5.5rem] flex items-end gap-2 sm:left-[var(--gutter)]">
      <motion.button type="button" onClick={next} aria-label="Go to the next section" whileHover={{ scale: 1.12, rotate: -6 }} whileTap={{ scale: 0.9 }} animate={{ y: talking ? [0, -5, 0] : 0 }} transition={{ repeat: talking ? Infinity : 0, duration: 1.3, ease: "easeInOut" }} className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-ember bg-raised shadow-[0_8px_30px_-8px_rgb(255_106_61/0.6)]">
        <Image src="/media/hero/avatar-small.webp" alt="" fill sizes="48px" className="object-cover" />
      </motion.button>
      <AnimatePresence>
        {talking && !muted && (
          <motion.div key={section} role="status" initial={{ opacity: 0, y: 8, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} transition={{ type: "spring", stiffness: 380, damping: 28 }} style={{ transformOrigin: "0% 100%" }} className="mb-1 flex max-w-[15rem] items-start gap-2 rounded-2xl rounded-bl-sm bg-paper px-3 py-2 text-[0.8125rem] font-medium leading-snug text-ink">
            <span>{line}</span>
            <button type="button" onClick={() => setMuted(true)} aria-label="Hide guide messages" className="-mr-1 -mt-0.5 px-1 text-ink/60 hover:text-ink">
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
