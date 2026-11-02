"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/animations/gsap";
import { sceneIn, sceneOut, textSwap } from "@/animations/transitions";
import { ProjectScene } from "@/components/ProjectScene";
import { SectionReveal, TextReveal } from "@/components/Reveal";
import { projects } from "@/data/projects";
import { prefersReducedMotion } from "@/utils/device";
import { scrollToTarget } from "@/utils/scroll";

const SCENE_VH = 120;

export function SelectedWork() {
  const track = useRef<HTMLDivElement>(null);
  const reel = useRef<HTMLDivElement>(null);
  const ambient = useRef<(HTMLDivElement | null)[]>([]);
  const ticks = useRef<(HTMLButtonElement | null)[]>([]);

  const jumpTo = (index: number) => {
    const element = track.current;
    if (!element || !window.matchMedia("(min-width: 64rem)").matches) return;
    const span = element.offsetHeight - window.innerHeight;
    const start = element.getBoundingClientRect().top + window.scrollY;
    scrollToTarget(start + span * (index / (projects.length - 1)), true);
  };

  useEffect(() => {
    const media = gsap.matchMedia();
    media.add("(min-width: 64rem)", () => {
      const root = track.current;
      if (!root) return;
      const scenes = [...root.querySelectorAll<HTMLElement>("[data-scene]")];
      const part = (scene: HTMLElement, selector: string) => scene.querySelector<HTMLElement>(selector)!;
      const texts = scenes.map((scene) => [...scene.querySelectorAll<HTMLElement>("[data-text]")]);
      const count = scenes.length;
      const reduced = prefersReducedMotion();

      const activate = (index: number) => {
        scenes.forEach((scene, i) => scene.toggleAttribute("data-active", i === index));
        ticks.current.forEach((tick, i) => tick?.toggleAttribute("aria-current", i === index));
      };
      activate(0);

      scenes.slice(1).forEach((scene, i) => {
        gsap.set(texts[i + 1], { yPercent: 110 });
        gsap.set(part(scene, "[data-frame]"), reduced ? { autoAlpha: 0 } : { clipPath: "inset(100% 0% 0% 0%)" });
        gsap.set(ambient.current[i + 1], { autoAlpha: 0 });
      });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: reduced ? true : 0.6,
          onUpdate: (self) => activate(Math.round(self.progress * (count - 1))),
        },
      });

      for (let i = 1; i < count; i++) {
        const at = i - 1 + 0.15;
        const current = scenes[i - 1];
        const next = scenes[i];
        if (reduced) {
          tl.to(part(current, "[data-frame]"), { autoAlpha: 0, duration: 0.3 }, at).to(part(next, "[data-frame]"), { autoAlpha: 1, duration: 0.3 }, at);
          tl.to(texts[i - 1], { opacity: 0, duration: 0.3 }, at).set(texts[i], { yPercent: 0 }, at).fromTo(texts[i], { opacity: 0 }, { opacity: 1, duration: 0.3 }, at);
        } else {
          sceneOut(tl, part(current, "[data-frame]"), part(current, "[data-shade]"), at, 0.7);
          sceneIn(tl, part(next, "[data-frame]"), part(next, "[data-image]"), at + 0.05, 0.7);
          textSwap(tl, texts[i - 1], texts[i], at, 0.32);
        }
        tl.to(ambient.current[i], { autoAlpha: 1, duration: 0.7 }, at);
        tl.to(ambient.current[i - 1], { autoAlpha: 0, duration: 0.7 }, at);
        tl.to(reel.current, { yPercent: (-100 / count) * i, duration: 0.6 }, at);
      }
      tl.to({}, { duration: 0.15 });
      return () => {
        scenes.forEach((scene) => scene.removeAttribute("data-active"));
      };
    });
    return () => media.revert();
  }, []);

  return (
    <section id="work" data-nav="solid" aria-labelledby="work-title" className="relative">
      <header className="gutter mb-14 flex items-end justify-between gap-6 sm:mb-20">
        <div>
          <SectionReveal>
            <p className="label mb-5 text-ember">01 / Selected work</p>
          </SectionReveal>
          <TextReveal lines={["Six films", "and frames."]} className="display type-section" />
        </div>
        <SectionReveal className="max-sm:hidden">
          <p className="label">({String(projects.length).padStart(2, "0")})</p>
        </SectionReveal>
      </header>

      <div ref={track} id="work-title" className="gutter lg:h-[var(--work-h)] lg:px-0" style={{ "--work-h": `${projects.length * SCENE_VH}vh` } as React.CSSProperties}>
        <div className="lg:sticky lg:top-0 lg:h-svh lg:overflow-hidden">
          {projects.map((project, i) => (
            <div
              key={project.id}
              ref={(el) => {
                ambient.current[i] = el;
              }}
              aria-hidden
              className="absolute inset-0 hidden lg:block"
              style={{ background: `radial-gradient(70% 80% at 60% 50%, ${project.ambient}, transparent 75%)` }}
            />
          ))}

          {/* Oversized scene number: a strip of digits rolled by scroll. */}
          <div aria-hidden className="absolute left-[var(--gutter)] top-[13vh] hidden h-[0.86em] overflow-hidden font-display text-[clamp(8rem,17vw,21rem)] leading-[0.86] text-paper/10 lg:block">
            <div ref={reel} className="will-change-transform">
              {projects.map((project) => (
                <div key={project.id} className="h-[0.86em]">
                  {project.id}
                </div>
              ))}
            </div>
          </div>

          <ol className="relative lg:absolute lg:inset-0">
            {projects.map((project, i) => (
              <ProjectScene key={project.id} project={project} index={i} onFocusProject={jumpTo} />
            ))}
          </ol>

          <nav aria-label="Jump to project" className="absolute right-[calc(var(--gutter)/2-0.5rem)] top-1/2 hidden -translate-y-1/2 flex-col lg:flex">
            {projects.map((project, i) => (
              <button
                key={project.id}
                ref={(el) => {
                  ticks.current[i] = el;
                }}
                type="button"
                tabIndex={-1}
                onClick={() => jumpTo(i)}
                aria-label={`Show ${project.title}`}
                className="group flex h-6 w-6 items-center justify-center"
              >
                <span className="h-px w-3 bg-paper/30 transition-[transform,background-color] duration-500 group-hover:bg-paper group-aria-[current]:scale-x-150 group-aria-[current]:bg-ember" />
              </button>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}
