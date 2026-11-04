"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/animations/gsap";
import { CLIP_FULL } from "@/animations/transitions";
import { prefersReducedMotion } from "@/utils/device";
import { preloadImage } from "@/utils/media";
import { scrollToTarget } from "@/utils/scroll";

const HOME_SCROLL = "cc:home-scroll";

interface Morph {
  source: HTMLElement;
  src: string;
}

interface TransitionApi {
  go: (href: string, morph?: Morph) => void;
}

const Context = createContext<TransitionApi>({ go: () => undefined });
export const useTransitionRouter = () => useContext(Context);

export function PageTransition({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const curtain = useRef<HTMLDivElement>(null);
  const morphRoot = useRef<HTMLDivElement>(null);
  const morphImage = useRef<HTMLImageElement>(null);
  const pending = useRef<{ kind: "wipe" | "morph"; hash: string } | null>(null);
  const busy = useRef(false);
  useEffect(() => {
    history.scrollRestoration = "manual";
  }, []);

  // Settle the new route: place the scroll, then lift whatever covers the screen.
  useEffect(() => {
    const entering = pending.current;
    pending.current = null;

    const place = () => {
      ScrollTrigger.refresh();
      const hash = entering?.hash || window.location.hash;
      const saved = sessionStorage.getItem(HOME_SCROLL);
      if (pathname === "/" && hash) {
        scrollToTarget(hash, true);
      } else if (pathname === "/" && saved) {
        scrollToTarget(Number(saved), true);
      } else {
        scrollToTarget(0, true);
      }
      if (pathname === "/") sessionStorage.removeItem(HOME_SCROLL);
    };
    const frame = requestAnimationFrame(place);

    if (entering) {
      const done = () => {
        busy.current = false;
      };
      if (entering.kind === "morph") {
        const hero = document.querySelector("[data-project-hero]");
        const reduced = prefersReducedMotion();
        const tl = gsap.timeline({ onComplete: done, delay: 0.1 });
        if (hero && !reduced) tl.fromTo(hero, { filter: "blur(10px)" }, { filter: "blur(0px)", duration: 0.9, clearProps: "filter" }, 0);
        tl.to(morphRoot.current, { autoAlpha: 0, duration: 0.7, ease: "none" }, 0.05);
      } else {
        const reduced = prefersReducedMotion();
        const tl = gsap.timeline({ onComplete: done, delay: 0.12 });
        if (reduced) tl.to(curtain.current, { autoAlpha: 0, duration: 0.25, ease: "none" });
        else tl.set(curtain.current, { transformOrigin: "center top" }).to(curtain.current, { scaleY: 0, duration: 0.8, ease: "inout" });
      }
    }
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  const push = useCallback(
    (href: string) => {
      const [path] = href.split("#");
      if (path === pathname || path === "") {
        // Same route: there is no new page to wait for.
        busy.current = false;
        return false;
      }
      router.push(href, { scroll: false });
      return true;
    },
    [pathname, router],
  );

  const go = useCallback<TransitionApi["go"]>(
    (href, morph) => {
      if (busy.current) return;
      busy.current = true;
      const [path, hash = ""] = href.split("#");
      if (pathname === "/") {
        if (/^\/(watch|stills)\//.test(path)) sessionStorage.setItem(HOME_SCROLL, String(window.scrollY));
        else sessionStorage.removeItem(HOME_SCROLL);
      }
      pending.current = { kind: morph ? "morph" : "wipe", hash: hash ? `#${hash}` : "" };
      const reduced = prefersReducedMotion();

      if (morph && morphRoot.current && morphImage.current) {
        const root = morphRoot.current;
        const picture = morphImage.current;
        const box = morph.source.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        picture.src = morph.src;
        const ready = preloadImage(morph.src);

        if (reduced) {
          gsap.set(root, { autoAlpha: 1, clipPath: CLIP_FULL });
          gsap.fromTo(root, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "none", onComplete: () => void ready.then(() => push(href)) });
          return;
        }

        const inset = `inset(${box.top}px ${vw - box.right}px ${vh - box.bottom}px ${box.left}px)`;
        const scale = Math.max(box.width / vw, box.height / vh);
        const originX = ((box.left + box.width / 2) / vw) * 100;
        const originY = ((box.top + box.height / 2) / vh) * 100;
        gsap.set(root, { autoAlpha: 1, clipPath: inset, backgroundColor: "transparent" });
        gsap.set(picture, { scale, xPercent: 0, yPercent: 0, transformOrigin: `${originX}% ${originY}%` });
        const shade = root.previousElementSibling;

        const tl = gsap.timeline({ onComplete: () => void ready.then(() => push(href)) });
        tl.to(shade, { autoAlpha: 1, duration: 0.7, ease: "none" }, 0)
          .to(root, { clipPath: CLIP_FULL, duration: 1, ease: "inout" }, 0)
          .to(picture, { scale: 1, duration: 1.1, ease: "inout" }, 0)
          .set(shade, { autoAlpha: 0 });
        return;
      }

      const target = curtain.current;
      if (!target) return;
      if (reduced) {
        gsap.fromTo(target, { autoAlpha: 0, scaleY: 1 }, { autoAlpha: 1, duration: 0.25, ease: "none", onComplete: () => void push(href) });
        return;
      }
      gsap.set(target, { autoAlpha: 1, scaleY: 0, transformOrigin: "center bottom" });
      gsap.to(target, { scaleY: 1, duration: 0.7, ease: "inout", onComplete: () => void push(href) });
    },
    [pathname, push],
  );

  const api = useMemo(() => ({ go }), [go]);

  return (
    <Context.Provider value={api}>
      {children}
      <div className="invisible fixed inset-0 z-[100] bg-black opacity-0" aria-hidden />
      <div ref={morphRoot} className="invisible fixed inset-0 z-[101] overflow-hidden bg-ink" aria-hidden>
        <img ref={morphImage} alt="" className="h-full w-full object-cover" />
      </div>
      <div ref={curtain} className="invisible fixed inset-0 z-[103] bg-ink opacity-0" aria-hidden />
    </Context.Provider>
  );
}
