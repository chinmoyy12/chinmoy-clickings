"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/animations/gsap";
import { SectionReveal, TextReveal } from "@/components/Reveal";
import { projects } from "@/data/projects";

export function Timeline() {
  const list = useRef<HTMLOListElement>(null);
  const line = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tween = gsap.fromTo(line.current, { scaleY: 0 }, { scaleY: 1, ease: "none", scrollTrigger: { trigger: list.current, start: "top 65%", end: "bottom 65%", scrub: true } });
    const rows = [...(list.current?.querySelectorAll("li") ?? [])].map((row) =>
      ScrollTrigger.create({ trigger: row, start: "top 65%", onToggle: (self) => row.toggleAttribute("data-lit", self.isActive || self.progress > 0) }),
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      rows.forEach((row) => row.kill());
    };
  }, []);

  return (
    <section id="process" data-nav="solid" aria-labelledby="process-title" className="gutter grid gap-10 pt-24 sm:pt-40 lg:grid-cols-12 lg:gap-6">
      <div className="lg:sticky lg:top-24 lg:col-span-4 lg:self-start">
        <SectionReveal>
          <p className="label mb-3 text-ember">06 / The journey</p>
        </SectionReveal>
        <div id="process-title">
          <TextReveal lines={["Keep moving.", "Keep shooting."]} accent={1} className="display type-section" />
        </div>
      </div>

      <div className="relative pl-6 sm:pl-10 lg:col-span-7 lg:col-start-6">
        <span className="absolute inset-y-0 left-0 w-px bg-line" aria-hidden />
        <div ref={line} className="absolute inset-y-0 left-0 w-0.5 origin-top bg-ember" aria-hidden />
        <ol ref={list}>
          {projects.map((project) => (
            <li key={project.id} className="timeline-row border-b border-line py-6">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="display text-[clamp(1.75rem,3vw,2.75rem)] leading-none">{project.title}</h3>
                <span className="label tabular-nums text-ember">{project.year}</span>
              </div>
              <p className="label mt-2">
                {project.role} / {project.location}
              </p>
              <p className="mt-2 max-w-xl text-[0.9375rem] leading-snug text-ash">{project.tagline}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
