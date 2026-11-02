"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/animations/gsap";
import { Frame } from "@/components/Frame";
import { SectionReveal } from "@/components/Reveal";
import { TransitionLink } from "@/components/TransitionLink";
import { projects } from "@/data/projects";
import type { Project } from "@/data/types";
import { hasFinePointer, prefersReducedMotion } from "@/utils/device";
import { optimizedUrl } from "@/utils/media";

function ProjectRow({ project, flipped }: { project: Project; flipped: boolean }) {
  const tilt = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = tilt.current;
    if (!element || prefersReducedMotion()) return;
    // The frame swings up into place as it scrolls in, like a print being lifted.
    const entrance = gsap.fromTo(element, { rotationX: 24, rotationY: flipped ? -14 : 14, y: 60, opacity: 0.2 }, { rotationX: 0, rotationY: 0, y: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: element, start: "top 95%", end: "top 45%", scrub: 0.6 } });
    return () => {
      entrance.scrollTrigger?.kill();
      entrance.kill();
    };
  }, [flipped]);

  const onMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!hasFinePointer() || prefersReducedMotion()) return;
    const box = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    gsap.to(event.currentTarget.firstElementChild, { rotationY: x * 12, rotationX: -y * 12, duration: 0.5, ease: "power2.out" });
  };
  const onLeave = (event: React.PointerEvent<HTMLDivElement>) => {
    gsap.to(event.currentTarget.firstElementChild, { rotationY: 0, rotationX: 0, duration: 0.7 });
  };

  const [first, ...rest] = project.title.split(" ");

  return (
    <li className="work-card grid items-center gap-6 lg:grid-cols-12">
      <div className={`[perspective:1100px] lg:col-span-7 ${flipped ? "lg:order-2 lg:col-start-6" : ""}`} onPointerMove={onMove} onPointerLeave={onLeave}>
        <div className="[transform-style:preserve-3d]">
          <div ref={tilt}>
            <TransitionLink href={`/work/${project.slug}`} morphSrc={optimizedUrl(project.hero.src, 2048)} aria-label={`${project.title}, view project`} className="zoom-host group relative block aspect-[16/10] overflow-hidden bg-surface shadow-[0_30px_80px_-34px_rgb(255_106_61/0.45)]">
              <span className="zoom-img absolute inset-0 block">
                <Frame image={project.hero} sizes="(min-width: 1024px) 58vw, 100vw" quality={85} />
              </span>
            </TransitionLink>
          </div>
        </div>
      </div>
      <div className={`lg:col-span-4 ${flipped ? "lg:order-1 lg:col-start-1" : "lg:col-start-9"}`}>
        <p className="label text-ember">{project.id}</p>
        <h3 className="display mt-2 text-[clamp(2rem,3.6vw,3.5rem)] leading-[1]">
          {first} <span className="hero-greeting text-[0.85em] normal-case text-ash">{rest.join(" ")}</span>
        </h3>
        <p className="label mt-3">
          {project.category} / {project.year}
        </p>
        <p className="mt-3 max-w-sm text-ash">{project.tagline}</p>
        <TransitionLink href={`/work/${project.slug}`} className="pill pill-ghost mt-5">
          View project <span className="arrow" aria-hidden>→</span>
        </TransitionLink>
      </div>
    </li>
  );
}

export function WorkStrip() {
  return (
    <section id="work" data-nav="solid" aria-labelledby="work-title" className="gutter pt-24 sm:pt-40">
      <header className="mb-14 flex flex-wrap items-end justify-between gap-4">
        <div>
          <SectionReveal>
            <p className="label mb-3 text-ember">03 / Selected work</p>
          </SectionReveal>
          <h2 id="work-title" className="display type-section">
            <span className="chrome-word">Selected</span> <span className="hero-greeting text-[0.8em] normal-case text-paper">work</span>
          </h2>
        </div>
      </header>
      <ol className="space-y-20 lg:space-y-28">
        {projects.map((project, i) => (
          <ProjectRow key={project.id} project={project} flipped={i % 2 === 1} />
        ))}
      </ol>
    </section>
  );
}
