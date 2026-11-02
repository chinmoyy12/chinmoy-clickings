"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/animations/gsap";
import { Frame } from "@/components/Frame";
import { SectionReveal, TextReveal } from "@/components/Reveal";
import { TransitionLink } from "@/components/TransitionLink";
import { photoCategories } from "@/data/photos";
import { projects } from "@/data/projects";
import type { Project } from "@/data/types";
import { hasFinePointer, isDesktop, prefersReducedMotion } from "@/utils/device";
import { optimizedUrl } from "@/utils/media";

const SCROLL_RATIO = 0.6;

function ProjectCard({ project }: { project: Project }) {
  const [hovered, setHovered] = useState(false);
  const clip = useRef<HTMLVideoElement>(null);

  const enter = () => {
    if (!project.video || !hasFinePointer() || prefersReducedMotion()) return;
    setHovered(true);
    void clip.current?.play().catch(() => undefined);
  };

  return (
    <li className="work-card shrink-0 snap-center">
      <TransitionLink
        href={`/work/${project.slug}`}
        morphSrc={optimizedUrl(project.hero.src, 2048)}
        data-cursor="View"
        aria-label={`${project.title}, view project`}
        onPointerEnter={enter}
        onPointerLeave={() => clip.current?.pause()}
        className="zoom-host group relative block aspect-[16/10] overflow-hidden bg-surface"
      >
        <div className="zoom-img absolute inset-0">
          <Frame image={project.hero} sizes="(min-width: 1024px) 44vw, 84vw" quality={85} />
          {hovered && project.video && <video ref={clip} src={project.video.srcMobile} muted loop playsInline autoPlay preload="none" className="absolute inset-0 h-full w-full object-cover" />}
        </div>
        <span className="absolute inset-0 border border-transparent transition-colors duration-500 group-hover:border-ember" aria-hidden />
      </TransitionLink>
      <div className="mt-3 flex items-start gap-4">
        <span className="display text-[clamp(2.5rem,4vw,4rem)] leading-none text-ember">{project.id}</span>
        <div className="min-w-0">
          <h3 className="display text-[clamp(1.5rem,2.2vw,2.25rem)] leading-none">{project.title}</h3>
          <p className="label mt-1">
            {project.category} / {project.year}
          </p>
        </div>
      </div>
    </li>
  );
}

export function WorkStrip() {
  const section = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const media = gsap.matchMedia();
    media.add("(min-width: 64rem)", () => {
      const run = () => (track.current ? Math.max(0, track.current.scrollWidth - window.innerWidth) : 0);
      const measure = () => {
        if (isDesktop()) section.current?.style.setProperty("--run", `${Math.round(run() * SCROLL_RATIO)}px`);
      };
      measure();
      const trigger = ScrollTrigger.create({
        trigger: stage.current,
        start: "top top",
        end: () => `+=${run() * SCROLL_RATIO}`,
        onRefreshInit: measure,
        onUpdate: (self) => gsap.set(track.current, { x: -run() * self.progress }),
      });
      return () => {
        trigger.kill();
        gsap.set(track.current, { clearProps: "transform" });
        section.current?.style.removeProperty("--run");
      };
    });
    return () => media.revert();
  }, []);

  return (
    <section id="work" data-nav="solid" aria-labelledby="work-title" className="relative pt-24 sm:pt-36">
      <div ref={section} className="lg:h-[calc(100svh+var(--run,0px))]">
        <div ref={stage} className="overflow-hidden lg:sticky lg:top-0 lg:flex lg:h-svh lg:flex-col lg:justify-center lg:pt-14">
          <header className="gutter mb-8 flex items-end justify-between gap-6 lg:mb-[4vh]">
            <div>
              <SectionReveal>
                <p className="label mb-3 text-ember">01 / Selected work</p>
              </SectionReveal>
              <div id="work-title">
                <TextReveal lines={["Frames that", "speak."]} accent={1} className="display type-section" />
              </div>
            </div>
            <p className="label max-sm:hidden">Scroll to move / Hover to play</p>
          </header>
          <div className="snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] lg:snap-none lg:overflow-visible">
            <ul ref={track} className="flex w-max gap-4 px-[var(--gutter)] will-change-transform max-lg:!transform-none lg:gap-6">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="marquee mt-16 border-y border-line py-4 lg:mt-0" aria-hidden>
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
