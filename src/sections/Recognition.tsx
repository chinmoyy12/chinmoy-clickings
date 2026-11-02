"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/animations/gsap";
import { SectionReveal, TextReveal } from "@/components/Reveal";
import { TransitionLink } from "@/components/TransitionLink";
import { projects } from "@/data/projects";
import { pad } from "@/utils/media";

const LEAVES = Array.from({ length: 9 }, (_, i) => 112 + i * 17);

function Laurel({ flip }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 60 120" className={`h-[clamp(6rem,11vw,10rem)] w-auto fill-ember ${flip ? "-scale-x-100" : ""}`} aria-hidden>
      {LEAVES.map((angle) => {
        const r = (angle * Math.PI) / 180;
        const x = 60 + Math.cos(r) * 46;
        const y = 60 + Math.sin(r) * 52;
        return <ellipse key={angle} cx={x} cy={y} rx="4.4" ry="11" transform={`rotate(${angle + 118} ${x} ${y})`} />;
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
          <TextReveal lines={["The work.", "The recognition."]} accent={1} className="display type-section" />
        </div>
        <div className="mt-10 flex items-center gap-3">
          <Laurel />
          <span ref={count} className="display text-[clamp(5rem,9vw,8.5rem)] leading-none tabular-nums">
            {pad(projects.length)}
          </span>
          <Laurel flip />
        </div>
        <p className="label mt-3">Selected projects, 2024 to 2026</p>
      </div>

      <ol className="lg:col-span-6 lg:col-start-7 lg:self-end">
        {projects.map((project, i) => (
          <li key={project.id} className="border-t border-line last:border-b">
            <TransitionLink href={`/work/${project.slug}`} data-cursor="View" className="row group grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-3 py-4">
              <span className="label text-ember">{pad(i + 1)}</span>
              <span className="min-w-0">
                <span className="display block text-[clamp(1.5rem,2.4vw,2.25rem)] leading-none transition-[color,transform] duration-500 ease-cine group-hover:translate-x-2 group-hover:text-ember">{project.title}</span>
                <span className="label mt-1 block">{project.role}</span>
              </span>
              <span className="label tabular-nums text-paper">{project.year}</span>
            </TransitionLink>
          </li>
        ))}
      </ol>
    </section>
  );
}
