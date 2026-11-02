"use client";

import { useState } from "react";
import { ScrollTrigger } from "@/animations/gsap";
import { Frame } from "@/components/Frame";
import { SectionReveal, TextReveal } from "@/components/Reveal";
import { TransitionLink } from "@/components/TransitionLink";
import { photoCategories } from "@/data/photos";
import { projects } from "@/data/projects";
import type { Project } from "@/data/types";
import { optimizedUrl } from "@/utils/media";

const FILTERS = ["All", "Film", "Photography", "Conceptual"];

const matches = (project: Project, filter: string) => {
  if (filter === "All") return true;
  if (filter === "Film") return /film|cinematography/i.test(project.category);
  return project.category.toLowerCase().includes(filter.toLowerCase());
};

export function WorkStrip() {
  const [filter, setFilter] = useState("All");
  const list = projects.filter((project) => matches(project, filter));

  const choose = (next: string) => {
    setFilter(next);
    requestAnimationFrame(() => ScrollTrigger.refresh());
  };

  return (
    <section id="work" data-nav="solid" aria-labelledby="work-title" className="pt-24 sm:pt-36">
      <div className="gutter">
        <header className="mb-8 grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <SectionReveal>
              <p className="label mb-3 text-ember">01 / Selected work</p>
            </SectionReveal>
            <div id="work-title">
              <TextReveal lines={["Frames that", "speak."]} accent={1} className="display type-section" />
            </div>
          </div>
          <div role="group" aria-label="Filter projects" className="flex flex-wrap gap-x-6 lg:col-span-5 lg:justify-end">
            {FILTERS.map((name) => (
              <button key={name} type="button" aria-pressed={filter === name} aria-current={filter === name ? "true" : undefined} onClick={() => choose(name)} className={`sweep label py-3 transition-colors duration-200 lg:py-1 ${filter === name ? "text-ember" : "hover:text-paper"}`}>
                {name}
              </button>
            ))}
          </div>
        </header>

        <p className="sr-only" role="status">
          Showing {list.length} {list.length === 1 ? "project" : "projects"}
        </p>

        <ul className="grid gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((project) => (
            <li key={project.id} className="work-card">
              <TransitionLink href={`/work/${project.slug}`} morphSrc={optimizedUrl(project.hero.src, 2048)} className="zoom-host group block">
                <span className="relative block aspect-[4/3] overflow-hidden bg-surface">
                  <span className="zoom-img absolute inset-0 block">
                    <Frame image={project.hero} sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" quality={85} />
                  </span>
                  <span className="absolute inset-0 border border-transparent transition-colors duration-200 group-hover:border-ember group-focus-visible:border-ember" aria-hidden />
                  <span className="label absolute bottom-3 right-3 bg-ember px-2 py-1 text-black opacity-100 transition-opacity duration-200 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-visible:opacity-100" aria-hidden>
                    View project <span className="arrow">→</span>
                  </span>
                </span>
                <span className="mt-3 flex items-start gap-3">
                  <span className="display text-[clamp(2.25rem,3.4vw,3.25rem)] leading-none text-ember">{project.id}</span>
                  <span className="min-w-0">
                    <span className="display block text-[clamp(1.5rem,2.2vw,2.125rem)] leading-none transition-colors duration-200 group-hover:text-ember">{project.title}</span>
                    <span className="label mt-1 block">
                      {project.category} / {project.year}
                    </span>
                  </span>
                </span>
              </TransitionLink>
            </li>
          ))}
        </ul>
      </div>

      <div className="marquee mt-16 border-y border-line py-4" aria-hidden>
        <div className="marquee-track">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0">
              {photoCategories.map((name) => (
                <span key={name} className="display flex items-center gap-10 pr-10 text-[clamp(1.75rem,3.4vw,3.25rem)] text-paper/25">
                  {name}
                  <span className="h-2 w-2 rounded-full bg-ember" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
