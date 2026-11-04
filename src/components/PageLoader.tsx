"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { gsap } from "@/animations/gsap";
import { site } from "@/data/site";
import { prefersReducedMotion } from "@/utils/device";

/**
 * The intro: a dot falls and bounces, a bar rises to form "!", the bar levers
 * around the dot sweeping the name out and becoming its letter I, then the name
 * changes letter by letter into the hero word and slides down into place.
 */
let introSeen = false;

export function PageLoader() {
  const root = useRef<HTMLDivElement>(null);
  const glow = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);
  const word = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const html = document.documentElement;
    const finish = () => {
      html.dataset.intro = "done";
    };
    const land = () => {
      html.dataset.landed = "true";
    };
    // The intro lands on the home hero and plays once per visit, so other pages,
    // and coming back home from a film or a set of stills, open straight away.
    if (pathname !== "/" || introSeen || prefersReducedMotion()) {
      introSeen = true;
      land();
      gsap.to(root.current, { autoAlpha: 0, duration: 0.25, ease: "none", onStart: finish });
      return;
    }

    let tl: gsap.core.Timeline | undefined;
    let cancelled = false;
    const skip = () => {
      cancelled = true;
      window.clearTimeout(backstop);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
      tl?.kill();
      finish();
      land();
      gsap.to(root.current, { autoAlpha: 0, duration: 0.3, ease: "none", overwrite: true });
    };
    // Animation frames stop in a background tab; a timer still guarantees the reveal.
    const backstop = window.setTimeout(skip, 14000);
    window.addEventListener("keydown", skip, { once: true });
    window.addEventListener("pointerdown", skip, { once: true });

    const start = () => {
      introSeen = true;
      const element = word.current!;
      const letters = [...element.children] as HTMLElement[];
      const pivotIndex = letters.findIndex((letter) => letter.textContent === "I");
      const bar = letters[pivotIndex];
      const size = parseFloat(getComputedStyle(element).fontSize);
      const vh = window.innerHeight;
      const box = bar.getBoundingClientRect();
      const shift = window.innerWidth / 2 - (box.left + box.width / 2);
      const diameter = Math.max(14, size * 0.17);
      const baseline = box.top + size * 0.8;
      const rest = baseline + size * 0.1;
      const pivotX = box.left + box.width / 2 + shift;

      gsap.set(element, { x: shift, visibility: "visible" });
      gsap.set(letters, { opacity: 0 });
      gsap.set(bar, { opacity: 1, scaleY: 0, transformOrigin: `50% ${size * 0.8}px` });
      gsap.set(dot.current, { width: diameter, height: diameter, x: pivotX - diameter / 2, y: -40, scaleX: 0.82, scaleY: 1.25 });

      const flash = (at: string | number) => tl!.fromTo(glow.current, { opacity: 0.9 }, { opacity: 0.25, duration: 0.5, ease: "power2.out" }, at);

      // Phones get a brisker version of the same film.
      tl = gsap.timeline().timeScale(window.innerWidth < 768 ? 1.5 : 1);

      // Fall, squash, bounce, fall, squash, settle.
      tl.to(dot.current, { y: rest, duration: 0.62, ease: "power2.in" });
      tl.addLabel("first");
      flash("first");
      tl.to(dot.current, { scaleX: 1.6, scaleY: 0.5, duration: 0.07, ease: "none" }, "first")
        .to(dot.current, { y: rest - vh * 0.2, scaleX: 0.9, scaleY: 1.15, duration: 0.36, ease: "power2.out" })
        .to(dot.current, { y: rest, scaleX: 0.92, scaleY: 1.1, duration: 0.3, ease: "power2.in" });
      tl.addLabel("second");
      flash("second");
      tl.to(dot.current, { scaleX: 1.4, scaleY: 0.62, duration: 0.06, ease: "none" }, "second")
        .to(dot.current, { scaleX: 1, scaleY: 1, duration: 0.3, ease: "elastic.out(1.2, 0.5)" })
        // The bar rises: an exclamation mark.
        .addLabel("bang", "-=0.1");
      flash("bang");
      tl.to(bar, { scaleY: 1, duration: 0.34, ease: "back.out(2.2)" }, "bang")
        .to({}, { duration: 0.22 })
        .set(bar, { transformOrigin: `${box.width / 2}px ${rest + diameter / 2 - box.top}px` })
        // The bar levers left around the dot and throws out the first letters.
        .addLabel("sweep")
        .to(bar, { rotationZ: -62, duration: 0.5, ease: "power2.inOut" }, "sweep")
        .to(element, { x: 0, duration: 1.6, ease: "power2.inOut" }, "sweep");

      const unfold = (group: HTMLElement[], at: string, side: number) => {
        group.forEach((letter, i) => {
          const rect = letter.getBoundingClientRect();
          const originX = pivotX - shift - rect.left;
          const originY = rest + diameter / 2 - rect.top;
          gsap.set(letter, { transformOrigin: `${originX}px ${originY}px` });
          tl!.fromTo(letter, { opacity: 0, rotationZ: side * 88, rotationY: side * -70, scale: 0.72 }, { opacity: 1, rotationZ: 0, rotationY: 0, scale: 1, duration: 0.62, ease: "back.out(1.3)", immediateRender: false }, `${at}+=${i * 0.1}`);
        });
      };
      unfold(letters.slice(0, pivotIndex).reverse(), "sweep+=0.12", 1);
      tl.addLabel("swing", "sweep+=0.46")
        .to(bar, { rotationZ: 48, duration: 0.5, ease: "power2.inOut" }, "swing");
      unfold(letters.slice(pivotIndex + 1), "swing+=0.14", -1);
      tl.to(bar, { rotationZ: 0, duration: 0.5, ease: "back.out(2)" }, "swing+=0.5")
        // The dot drops away once the word stands on its own.
        .to(dot.current, { y: rest + vh * 0.16, opacity: 0, duration: 0.42, ease: "power2.in" }, "-=0.18")
        .to(glow.current, { opacity: 0, duration: 0.5, ease: "none" }, "<")
        .to({}, { duration: 0.34 });

      // Letter by letter, the name becomes the hero word.
      const from = site.loaderName;
      const to = site.heroWord;
      tl.call(() => {
        gsap.set(element, { clearProps: "transform" });
        element.classList.add("chrome-word");
        element.textContent = from;
      });
      for (let i = 1; i <= to.length; i++) tl.call(() => (element.textContent = to.slice(0, i) + from.slice(i)), undefined, `+=0.13`);

      // It slides into the hero and opens around the portrait as the particles arrive.
      tl.to({}, { duration: 0.25 }).add(() => {
        element.innerHTML = `<span class="inline-block">${to.slice(0, 4)}</span><span class="inline-block">${to.slice(4)}</span>`;
        const target = document.querySelector(".hero-giant")?.getBoundingClientRect();
        if (!target) return;
        const gap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--hero-gap")) || 0;
        const offset = (gap * window.innerWidth) / 200;
        const [left, right] = [...element.children];
        const y = target.top + target.height / 2 - (window.innerHeight / 2);
        window.removeEventListener("keydown", skip);
        window.removeEventListener("pointerdown", skip);
        finish();
        gsap.to(root.current, { backgroundColor: "rgba(0,0,0,0)", duration: 1.1, ease: "none" });
        gsap.to(element, { y, duration: 1.5, ease: "power3.inOut" });
        gsap.to(left, { x: -offset, duration: 1.5, ease: "power3.out", delay: 0.3 });
        gsap.to(right, {
          x: offset,
          duration: 1.5,
          ease: "power3.out",
          delay: 0.3,
          onComplete: () => {
            window.clearTimeout(backstop);
            land();
            gsap.to(root.current, { autoAlpha: 0, duration: 0.2, ease: "none" });
          },
        });
      });
    };

    // Wait for the display font and the 3D scene, so the film plays on a quiet main thread, but never for long.
    const family = getComputedStyle(word.current!).fontFamily;
    const scene = new Promise((done) => {
      if (html.dataset.heroReady) done(true);
      else window.addEventListener("cc:hero-ready", done, { once: true });
    });
    void Promise.race([Promise.all([document.fonts.load(`800 100px ${family}`), scene]), new Promise((done) => setTimeout(done, 1800))]).then(() => !cancelled && start());

    return () => {
      cancelled = true;
      window.clearTimeout(backstop);
      window.removeEventListener("keydown", skip);
      window.removeEventListener("pointerdown", skip);
      tl?.kill();
    };
  }, [pathname]);

  return (
    <div ref={root} id="loader" className="pointer-events-none fixed inset-0 z-[110] flex items-center justify-center overflow-hidden bg-black [perspective:1100px]" aria-hidden>
      <div ref={glow} className="absolute inset-0 opacity-0" style={{ background: "radial-gradient(circle at 50% 50%, rgb(255 255 255 / 0.26), transparent 30%)" }} />
      <div ref={word} className="loader-word invisible flex justify-center [transform-style:preserve-3d]">
        {[...site.loaderName].map((char, i) => (
          <span key={i} className="chrome-char inline-block">
            {char}
          </span>
        ))}
      </div>
      <div ref={dot} className="absolute left-0 top-0 rounded-full bg-gray-200" />
    </div>
  );
}
