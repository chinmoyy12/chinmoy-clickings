"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/animations/gsap";
import { site } from "@/data/site";
import { prefersReducedMotion } from "@/utils/device";

const SEEN = "cc:seen";

/** A dot falls, bounces, stretches into "!", then ribbons out into the name in 3D and lands in the hero. */
export function PageLoader() {
  const root = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const word = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    const finish = () => {
      html.dataset.intro = "done";
      sessionStorage.setItem(SEEN, "1");
    };
    if (sessionStorage.getItem(SEEN) || prefersReducedMotion()) {
      gsap.to(root.current, { autoAlpha: 0, duration: 0.25, ease: "none", onStart: finish });
      return;
    }

    // Animation frames stop in a background tab; a timer still guarantees the reveal.
    const backstop = window.setTimeout(() => {
      finish();
      if (root.current) root.current.style.visibility = "hidden";
    }, 7000);

    const letters = [...(word.current?.children ?? [])] as HTMLElement[];
    const vh = window.innerHeight;
    const tl = gsap.timeline({ onComplete: () => window.clearTimeout(backstop) });

    gsap.set(word.current, { scale: 0.62 });
    gsap.set(letters, { opacity: 0 });
    gsap.set(bar.current, { scaleY: 0, transformOrigin: "50% 100%" });
    gsap.set(dot.current, { y: -vh * 0.62 });

    // The fall, with each landing squashing the dot.
    tl.to(dot.current, { y: vh * 0.06, duration: 0.42, ease: "power2.in" })
      .to(dot.current, { scaleY: 0.55, scaleX: 1.5, duration: 0.05 })
      .to(dot.current, { y: -vh * 0.16, scaleX: 1, scaleY: 1.2, duration: 0.24, ease: "power2.out" })
      .to(dot.current, { y: vh * 0.06, scaleY: 1, duration: 0.22, ease: "power2.in" })
      .to(dot.current, { scaleY: 0.7, scaleX: 1.3, duration: 0.04 })
      .to(dot.current, { scaleX: 1, scaleY: 1, duration: 0.1 })
      // The exclamation mark rises out of the dot.
      .to(glow.current, { opacity: 1, duration: 0.3, ease: "none" }, "-=0.05")
      .to(bar.current, { scaleY: 1, duration: 0.26, ease: "back.out(2.4)" }, "<")
      .to({}, { duration: 0.14 })
      .to(bar.current, { rotationZ: -68, x: -30, opacity: 0, duration: 0.3, ease: "power2.in" })
      .to(dot.current, { x: () => (letters.at(-1)?.getBoundingClientRect().right ?? 0) - window.innerWidth / 2 + 12, y: vh * 0.045, duration: 0.8, ease: "power3.out" }, "<")
      // Letters unfold in 3D along the path, one by one.
      .fromTo(
        letters,
        { opacity: 1, rotationY: -115, rotationX: 55, rotationZ: -30, x: 90, z: -240, scale: 0.4 },
        { rotationY: 0, rotationX: 0, rotationZ: 0, x: 0, z: 0, scale: 1, duration: 0.62, ease: "back.out(1.5)", stagger: 0.085, immediateRender: false },
        "<",
      )
      .to(dot.current, { opacity: 0, scale: 0, duration: 0.2 }, "-=0.2")
      .to(glow.current, { opacity: 0.4, duration: 0.3, ease: "none" }, "<")
      .to({}, { duration: 0.28 })
      // A quick full flip of the word, then it lands exactly on the hero's word.
      .to(letters, { rotationX: 360, duration: 0.6, ease: "power3.inOut", stagger: 0.03 })
      .add(() => {
        const target = document.querySelector(".hero-giant")?.getBoundingClientRect();
        const box = word.current?.getBoundingClientRect();
        if (!target || !box) return;
        const scale = (target.width / box.width) * 0.62;
        gsap.to(word.current, { y: target.top + target.height / 2 - window.innerHeight / 2, scale, duration: 0.8, ease: "power3.inOut" });
      })
      .to(glow.current, { opacity: 0, duration: 0.5, ease: "none" })
      .add(finish, "+=0.1")
      .to(root.current, { backgroundColor: "rgba(0,0,0,0)", duration: 0.5, ease: "none" }, "<")
      .to(root.current, { autoAlpha: 0, duration: 0.3, ease: "none" }, "+=0.15");

    return () => {
      window.clearTimeout(backstop);
      tl.kill();
    };
  }, []);

  return (
    <div ref={root} id="loader" className="pointer-events-none fixed inset-0 z-[110] flex items-center justify-center overflow-hidden bg-black [perspective:900px]" aria-hidden>
      <div ref={glow} className="absolute inset-0 opacity-0" style={{ background: "radial-gradient(circle at 50% 50%, rgb(255 255 255 / 0.2), transparent 34%)" }} />
      <div ref={word} className="loader-word display flex [transform-style:preserve-3d]">
        {[...site.heroWord].map((char, i) => (
          <span key={i} className="chrome-char inline-block [backface-visibility:visible]">
            {char}
          </span>
        ))}
      </div>
      <div ref={bar} className="absolute left-1/2 top-[calc(50%-5.5rem)] h-24 w-5 -translate-x-1/2 rounded-sm bg-gradient-to-b from-white to-neutral-400" />
      <div ref={dot} className="absolute left-1/2 top-1/2 -ml-[11px] mt-[1.4rem] h-[22px] w-[22px] rounded-full bg-white" />
    </div>
  );
}
