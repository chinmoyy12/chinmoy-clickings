"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/animations/gsap";
import { SectionReveal, TextReveal } from "@/components/Reveal";
import { TransitionLink } from "@/components/TransitionLink";
import { projects } from "@/data/projects";
import { pad } from "@/utils/media";

/** Thin decorative line art; it frames the count and implies no award. */
function Frond({ flip }: { flip?: boolean }) {
  const ticks = Array.from({ length: 8 }, (_, i) => 118 + i * 18);
  return (
    <svg viewBox="0 0 60 120" className={`h-[clamp(6rem,11vw,10rem)] w-auto fill-none stroke-ember ${flip ? "-scale-x-100" : ""}`} strokeWidth="1" aria-hidden>
      <path d="M38 112 A 46 54 0 0 1 38 8" />
      {ticks.map((angle) => {
        const r = (angle * Math.PI) / 180;
        const x = 60 + Math.cos(r) * 48;
        const y = 60 + Math.sin(r) * 54;
        return <line key={angle} x1={x} y1={y} x2={x - 10 * Math.cos(r + 0.7)} y2={y - 10 * Math.sin(r + 0.7)} />;
      })}
    </svg>
  );
}

export function Recognition() {
  const count = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const value = { n: 0 };
    const tween = gsap.to(value, {
      n: projects.length,
      duration: 1.6,
      ease: "power2.out",
      paused: true,
      onUpdate: () => {
        if (count.current) count.current.textContent = pad(Math.round(value.n));
      },
      scrollTrigger: { trigger: count.current, start: "top 85%", once: true },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <section id="recognition" data-nav="solid" aria-labelledby="recognition-title" className="gutter grid gap-12 pt-24 sm:pt-40 lg:grid-cols-12 lg:gap-6">
      <div className="lg:col-span-5">
        <SectionReveal>
          <p className="label mb-3 text-ember">02 / The body of work</p>
        </SectionReveal>
        <div id="recognition-title">
          <TextReveal lines={["Selected", "work."]} accent={1} className="display type-section" />
        </div>
        <div className="mt-10 flex items-center gap-3">
          <Frond />
          <span ref={count} className="display text-[clamp(5rem,9vw,8.5rem)] leading-none tabular-nums">
            {pad(projects.length)}
          </span>
          <Frond flip />
        </div>
        <p className="label mt-3">06 projects / 2024–2026</p>
      </div>

      <ol className="lg:col-span-6 lg:col-start-7 lg:self-end">
        {projects.map((project, i) => (
          <li key={project.id} className="border-t border-line last:border-b">
            <TransitionLink href={`/work/${project.slug}`} className="row group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-3 py-4">
              <span className="label text-ember">{pad(i + 1)}</span>
              <span className="min-w-0">
                <span className="display block text-[clamp(1.5rem,2.4vw,2.25rem)] leading-none transition-[color,transform] duration-500 ease-cine group-hover:translate-x-2 group-hover:text-ember">{project.title}</span>
                <span className="label mt-1 block">{project.role}</span>
              </span>
              <span className="display text-[clamp(1.5rem,2.4vw,2.25rem)] leading-none tabular-nums text-ember">{project.year}</span>
            </TransitionLink>
          </li>
        ))}
      </ol>
    </section>
  );
}
