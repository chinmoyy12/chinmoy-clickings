"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { TransitionLink } from "@/components/TransitionLink";
import { useModal } from "@/hooks/useModal";
import { navigation, site } from "@/data/site";
import { social } from "@/data/social";

const EASE = [0.16, 1, 0.3, 1] as const;
const SPRING = { type: "spring", stiffness: 340, damping: 32, mass: 0.7 } as const;
const RING = 2 * Math.PI * 17;
const CHAPTERS: Record<string, string> = { about: "About", services: "Services", story: "The story", work: "Work", films: "Films", photo: "Photography", play: "Play", contact: "Contact" };

/** A floating island: full bar at rest, a compact pill with live section and progress while scrolling. */
export function Navigation() {
  const pathname = usePathname();
  const [compact, setCompact] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState("");
  const [chapter, setChapter] = useState("Home");
  const [open, setOpen] = useState(false);
  const ring = useRef<SVGCircleElement>(null);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const mid = window.innerHeight * 0.4;
      if (y < 60) setCompact(false);
      else if (Math.abs(y - lastY) > 4) setCompact(true);
      lastY = y;
      const span = document.documentElement.scrollHeight - window.innerHeight;
      if (ring.current) ring.current.style.strokeDashoffset = String(RING * (1 - (span > 0 ? y / span : 0)));
      const current = [...document.querySelectorAll<HTMLElement>("section[id]")].find((section) => {
        const box = section.getBoundingClientRect();
        return box.top <= mid && box.bottom > mid;
      });
      setChapter(current ? (CHAPTERS[current.id] ?? "Home") : pathname === "/" ? "Home" : "Project");
      setActive(navigation.find((item) => item.id === current?.id)?.id ?? "");
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  const expanded = !compact || hovered;

  return (
    <>
      <header className="intro-nav pointer-events-none fixed inset-x-0 top-3 z-[80] flex justify-center px-3">
        <LayoutGroup>
          <motion.div
            layout
            transition={SPRING}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={() => setHovered(false)}
            onFocusCapture={() => setHovered(true)}
            onBlurCapture={() => setHovered(false)}
            style={{ borderRadius: 999 }}
            className="island pointer-events-auto flex max-w-full items-center gap-1 p-1"
          >
            <motion.div layout="position" className="relative h-10 w-10 shrink-0">
              <svg viewBox="0 0 40 40" className="absolute inset-0 -rotate-90" aria-hidden>
                <circle cx="20" cy="20" r="17" className="fill-none stroke-line" strokeWidth="1.5" />
                <circle ref={ring} cx="20" cy="20" r="17" className="fill-none stroke-ember" strokeWidth="1.5" strokeLinecap="round" strokeDasharray={RING} strokeDashoffset={RING} />
              </svg>
              <TransitionLink href="/" aria-label="Chinmoy Clickings, home" className="absolute inset-[5px] block overflow-hidden rounded-full bg-raised">
                <Image src="/media/hero/avatar-small.webp" alt="" fill sizes="30px" className="object-cover" />
              </TransitionLink>
            </motion.div>

            <AnimatePresence mode="popLayout" initial={false}>
              {expanded ? (
                <motion.nav key="links" aria-label="Primary" initial={{ opacity: 0, filter: "blur(6px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0, filter: "blur(6px)" }} transition={{ duration: 0.22 }} className="hidden items-center lg:flex">
                  {navigation.map((item) => (
                    <TransitionLink key={item.id} href={item.href} aria-current={active === item.id ? "true" : undefined} className="relative rounded-full px-4 py-2.5 text-[0.8125rem] font-medium">
                      {active === item.id && <motion.span layoutId="island-active" transition={SPRING} className="absolute inset-0 rounded-full bg-paper" />}
                      <span className={`relative transition-colors duration-200 ${active === item.id ? "text-ink" : "text-paper/80 hover:text-paper"}`}>{item.label}</span>
                    </TransitionLink>
                  ))}
                </motion.nav>
              ) : null}
            </AnimatePresence>

            <div className={`min-w-0 items-center overflow-hidden px-3 ${expanded ? "flex lg:hidden" : "flex"}`}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={chapter} initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "-100%", opacity: 0 }} transition={{ duration: 0.22, ease: EASE }} className="block whitespace-nowrap text-[0.8125rem] font-medium">
                  {chapter}
                </motion.span>
              </AnimatePresence>
            </div>

            <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open} className="ctrl rounded-full bg-paper px-4 !text-ink lg:hidden">
              Menu
            </button>
          </motion.div>
        </LayoutGroup>
      </header>

      <AnimatePresence>{open && <MobileMenu onClose={() => setOpen(false)} />}</AnimatePresence>
    </>
  );
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  const ref = useModal<HTMLDivElement>(onClose);
  const mounted = useRef(false);
  const pathname = usePathname();

  // A link that changes route should also dismiss the sheet.
  useEffect(() => {
    if (mounted.current) onClose();
    mounted.current = true;
  }, [pathname, onClose]);

  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      className="fixed inset-0 z-[85] flex flex-col justify-between bg-ink"
      initial={{ clipPath: "circle(0% at 90% 4%)" }}
      animate={{ clipPath: "circle(150% at 90% 4%)" }}
      exit={{ clipPath: "circle(0% at 90% 4%)" }}
      transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="gutter flex items-center justify-between py-3">
        <span className="text-[0.75rem] tracking-[0.16em]">
          CHINMOY <span className="text-ash">CLICKINGS</span>
        </span>
        <button type="button" data-autofocus onClick={onClose} className="ctrl -mr-2">
          Close
        </button>
      </div>
      <nav aria-label="Mobile" className="gutter">
        <ol>
          {navigation.map((item, i) => (
            <li key={item.id} className="ml border-b border-line">
              <motion.span initial={{ y: "105%" }} animate={{ y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.2 + i * 0.06 }}>
                <TransitionLink href={item.href} onClick={onClose} className="display flex items-baseline justify-between py-3 text-[clamp(2.5rem,12vw,4.25rem)]">
                  {item.label}
                  <span className="label font-sans text-ember">0{i + 1}</span>
                </TransitionLink>
              </motion.span>
            </li>
          ))}
        </ol>
      </nav>
      <div className="gutter flex items-center justify-between pb-6">
        <a href={social.instagram.url} target="_blank" rel="noreferrer" className="label sweep">
          {social.instagram.handle}
        </a>
        <span className="label">{site.location}</span>
      </div>
    </motion.div>
  );
}
