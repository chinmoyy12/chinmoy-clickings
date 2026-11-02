"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { TransitionLink } from "@/components/TransitionLink";
import { useModal } from "@/hooks/useModal";
import { navigation, site } from "@/data/site";
import { social } from "@/data/social";

type Surface = "clear" | "solid";
const EASE = [0.22, 1, 0.36, 1] as const;

export function Navigation() {
  const pathname = usePathname();
  const [surface, setSurface] = useState<Surface>("clear");
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      const probe = 72;
      // Sections flagged data-nav="image" are full-bleed: the bar melts into them.
      const under = [...document.querySelectorAll<HTMLElement>("[data-nav]")].reverse().find((section) => {
        const box = section.getBoundingClientRect();
        return box.top <= probe && box.bottom > probe;
      });
      setSurface(window.scrollY < 40 || under?.dataset.nav === "image" ? "clear" : "solid");
      setActive(
        navigation.find((item) => {
          const box = document.getElementById(item.id)?.getBoundingClientRect();
          return box && box.top <= window.innerHeight * 0.4 && box.bottom > window.innerHeight * 0.4;
        })?.id ?? "",
      );
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [pathname]);

  return (
    <>
      <header className="intro-nav fixed inset-x-0 top-0 z-[80]">
        <div
          className={`pointer-events-none absolute inset-0 border-b transition-[opacity,border-color] duration-700 ${
            surface === "solid" ? "border-line bg-ink/80 opacity-100" : "border-transparent bg-gradient-to-b from-black/45 to-transparent opacity-100"
          }`}
        />
        <div className={`gutter relative flex items-center justify-between transition-[padding] duration-700 ease-cine ${surface === "solid" ? "py-3" : "py-5"}`}>
          <TransitionLink href="/" className="text-[0.75rem] tracking-[0.16em]" aria-label="Chinmoy Clickings, home">
            CHINMOY <span className="text-ash">CLICKINGS</span>
          </TransitionLink>

          <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
            {navigation.map((item) => (
              <TransitionLink key={item.id} href={item.href} aria-current={active === item.id ? "true" : undefined} className="sweep text-[0.6875rem] uppercase tracking-[0.16em]">
                {active === item.id && <span className="mr-2 inline-block h-1 w-1 translate-y-[-2px] rounded-full bg-ember" aria-hidden />}
                {item.label}
              </TransitionLink>
            ))}
          </nav>

          <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open} className="ctrl -mr-2 lg:hidden">
            Menu
          </button>
        </div>
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
      initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
      animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
      exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
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
                <TransitionLink href={item.href} onClick={onClose} className="display flex items-baseline justify-between py-3 text-[clamp(2.75rem,13vw,4.5rem)]">
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
