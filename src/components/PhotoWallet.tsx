"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Frame } from "@/components/Frame";
import { TransitionLink } from "@/components/TransitionLink";
import type { MediaImage } from "@/data/types";
import { prefersReducedMotion } from "@/utils/device";
import { optimizedUrl, pad } from "@/utils/media";

export interface WalletItem {
  id: string;
  title: string;
  meta: string;
  image: MediaImage;
  href?: string;
  onOpen?: () => void;
  action: string;
}

const CARD_HEIGHT = 188;
const FAN_TOP = -176;
const SPRING = { type: "spring", stiffness: 260, damping: 20 } as const;

/** A leather holder of print-like cards: they fan out on hover or tap, and one pulls free when chosen. */
export function PhotoWallet({ label, total, items }: { label: string; total: string; items: WalletItem[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const still = useRef(false);
  const count = items.length;
  const step = Math.min(38, (CARD_HEIGHT - 20) / count);
  const current = items.find((item) => item.id === active);

  useEffect(() => {
    still.current = prefersReducedMotion();
    const onOutside = (event: PointerEvent) => {
      if (root.current?.contains(event.target as Node)) return;
      setActive(null);
      setOpen(false);
    };
    window.addEventListener("pointerdown", onOutside, { passive: true });
    return () => window.removeEventListener("pointerdown", onOutside);
  }, []);

  const fanned = open || active !== null;

  return (
    <div className="flex flex-col items-center">
      <div
        ref={root}
        className="relative mt-[13rem] h-56 w-[min(86vw,24rem)] [perspective:1000px]"
        onPointerEnter={(event) => event.pointerType === "mouse" && setOpen(true)}
        onPointerLeave={(event) => {
          if (event.pointerType !== "mouse") return;
          setOpen(false);
          setActive(null);
        }}
        // Keyboard focus opens it; a tap's focus must not, or the click would close it again.
        onFocusCapture={(event) => event.target.matches(":focus-visible") && setOpen(true)}
      >
        <div className="absolute inset-0 translate-y-2.5 scale-[0.98] rounded-[1.1rem] bg-[#050506]" aria-hidden />

        <ul className="absolute inset-x-4 top-0">
          {items.map((item, i) => {
            const isActive = active === item.id;
            const y = isActive ? -CARD_HEIGHT + 10 : fanned ? FAN_TOP + i * step : -30 + i * (10 / count);
            return (
              <motion.li
                key={item.id}
                initial={false}
                animate={{ y, scale: isActive ? 1.05 : 1 - (count - 1 - i) * 0.012, rotateX: fanned && !isActive ? -4 : 0 }}
                transition={still.current ? { duration: 0 } : SPRING}
                style={{ zIndex: isActive ? 40 : 10 + i, height: CARD_HEIGHT, transformOrigin: "50% 100%" }}
                className="absolute inset-x-0 top-0 overflow-hidden rounded-xl border border-white/10 bg-surface shadow-[0_14px_30px_-12px_rgb(0_0_0/0.9)]"
              >
                <Frame image={item.image} sizes="360px" />
                <span className={`absolute inset-0 bg-black transition-opacity duration-300 ${isActive || fanned ? "opacity-0" : "opacity-40"}`} aria-hidden />
                <span className="absolute inset-x-0 top-0 h-2/5 bg-gradient-to-b from-black/75 to-transparent" aria-hidden />
                <button type="button" aria-pressed={isActive} aria-label={`${item.title}, ${item.meta}`} onClick={() => setActive(isActive ? null : item.id)} className="absolute inset-0 flex items-start justify-between gap-3 p-2.5 text-left">
                  <span className="min-w-0 text-[0.8125rem] font-semibold leading-tight">
                    <span className="mr-2 font-mono text-[0.6875rem] text-ember">{pad(i + 1)}</span>
                    {item.title}
                  </span>
                  <span className="label shrink-0 text-paper/75">{item.meta}</span>
                </button>
                {isActive && (
                  <span className="absolute bottom-2.5 left-2.5">
                    {item.href ? (
                      <TransitionLink href={item.href} morphSrc={optimizedUrl(item.image.src, 2048)} className="pill !px-4 !py-2">
                        {item.action} <span className="arrow" aria-hidden>→</span>
                      </TransitionLink>
                    ) : (
                      <button type="button" onClick={item.onOpen} className="pill !px-4 !py-2">
                        {item.action} <span className="arrow" aria-hidden>→</span>
                      </button>
                    )}
                  </span>
                )}
              </motion.li>
            );
          })}
        </ul>

        <motion.button
          type="button"
          onClick={() => {
            setOpen(!fanned);
            setActive(null);
          }}
          aria-expanded={fanned}
          aria-label={`${label}, ${fanned ? "close" : "open"} the wallet`}
          initial={false}
          animate={{ rotateX: fanned ? 5 : 0, y: fanned ? 6 : 0 }}
          transition={still.current ? { duration: 0 } : { type: "spring", stiffness: 200, damping: 20 }}
          style={{ zIndex: 30, transformOrigin: "50% 100%" }}
          className="wallet absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-[1.1rem] text-center"
        >
          <span className="absolute inset-3 rounded-xl border border-dashed border-white/12" aria-hidden />
          <span className="label relative">{label}</span>
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={current?.id ?? "total"} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className="display relative mt-1 max-w-[85%] truncate text-[clamp(1.875rem,6vw,2.5rem)] leading-tight">
              {current?.title ?? total}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>
      <p className="label mt-7 text-center">{active ? "Tap outside to close" : fanned ? "Pick a card" : "Hover or tap the wallet"}</p>
    </div>
  );
}
