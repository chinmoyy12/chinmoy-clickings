"use client";

import { AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/animations/gsap";
import { Frame } from "@/components/Frame";
import { Footer } from "@/components/Footer";
import { Magnetic } from "@/components/MagneticButton";
import { ImageReveal, SectionReveal, TextReveal } from "@/components/Reveal";
import { TransitionLink } from "@/components/TransitionLink";
import { VideoPlayer } from "@/components/VideoPlayer";
import type { Project } from "@/data/types";
import { optimizedUrl } from "@/utils/media";

export function ProjectDetail({ project, next }: { project: Project; next: Project }) {
  const [playing, setPlaying] = useState(false);
  const hero = useRef<HTMLDivElement>(null);
  const [wide, ...sequence] = [...project.images].sort((a, b) => b.width / b.height - a.width / a.height);

  useEffect(() => {
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.to(hero.current, { yPercent: 8, scale: 1.05, ease: "none", scrollTrigger: { trigger: hero.current, start: "top top", end: "bottom top", scrub: true } });
    });
    return () => media.revert();
  }, []);

  return (
    <>
      <main id="main">
        <article>
          <header data-nav="image" className="relative h-svh min-h-[32rem] overflow-hidden bg-black">
            <div ref={hero} data-project-hero className="absolute inset-0">
              <Frame image={project.hero} sizes="100vw" priority quality={85} />
            </div>
            <div className="vignette" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 to-transparent" />
            <div className="gutter absolute inset-x-0 bottom-0 pb-8">
              <TextReveal as="h1" delay={350} lines={[project.title]} className="display type-section" />
              <SectionReveal delay={650}>
                <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-1">
                  {[
                    ["Year", project.year],
                    ["Category", project.category],
                    ["Role", project.role],
                    ["Location", project.location],
                  ].map(([term, value]) => (
                    <div key={term} className="flex gap-2">
                      <dt className="label text-paper/60">{term}</dt>
                      <dd className="label text-paper">{value}</dd>
                    </div>
                  ))}
                </dl>
              </SectionReveal>
            </div>
          </header>

          <section data-nav="solid" className="gutter grid grid-cols-4 gap-x-4 py-24 sm:grid-cols-8 sm:py-44 lg:grid-cols-12">
            <SectionReveal className="col-span-4 mb-6 sm:col-span-2 lg:col-span-3">
              <TransitionLink href="/" className="label sweep">
                <span className="arrow rotate-180" aria-hidden>→</span> Back to the work
              </TransitionLink>
            </SectionReveal>
            <div className="col-span-4 sm:col-span-6 lg:col-span-8 lg:col-start-5">
              <TextReveal as="p" lines={[project.tagline]} className="display text-[clamp(2rem,4.4vw,4.75rem)]" />
              <SectionReveal delay={150}>
                <p className="mt-6 max-w-xl text-[1.0625rem] text-ash">{project.description}</p>
              </SectionReveal>
            </div>
          </section>

          <ImageReveal className="relative" dir="up">
            <div className="relative aspect-[4/5] overflow-hidden bg-surface sm:aspect-video">
              <Frame image={wide} sizes="100vw" quality={85} />
            </div>
          </ImageReveal>

          {project.video && (
            <section data-nav="solid" aria-label="Film" className="gutter pt-24 sm:pt-44">
              <div className="ml-auto lg:w-10/12">
                <ImageReveal>
                  <button type="button" onClick={() => setPlaying(true)} aria-label={`Play ${project.video.title}`} className="zoom-host relative block aspect-video w-full overflow-hidden bg-surface">
                    <div className="zoom-img absolute inset-0">
                      <Frame image={project.video.poster} sizes="(min-width: 1024px) 80vw, 100vw" />
                    </div>
                    <div className="vignette" />
                    <span className="label absolute bottom-4 left-4 flex items-center gap-3 text-paper">
                      <span className="h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-paper" aria-hidden />
                      Play film
                    </span>
                  </button>
                </ImageReveal>
              </div>
            </section>
          )}

          <section data-nav="solid" aria-label="Image sequence" className="gutter grid grid-cols-4 gap-x-3 gap-y-3 pt-24 sm:grid-cols-8 sm:pt-44 lg:grid-cols-12 lg:gap-x-6">
            {sequence.map((image, i) => (
              <div key={image.src} className={i === 0 ? "col-span-4 lg:col-span-5" : "col-span-4 lg:col-span-5 lg:col-start-8 lg:mt-40"}>
                <ImageReveal dir={i ? "up" : "left"}>
                  <div className="relative overflow-hidden bg-surface" style={{ aspectRatio: `${image.width} / ${image.height}` }}>
                    <Frame image={image} sizes="(min-width: 1024px) 42vw, (min-width: 640px) 50vw, 100vw" />
                  </div>
                </ImageReveal>
              </div>
            ))}
          </section>

          <section data-nav="solid" aria-labelledby="bts-title" className="gutter grid grid-cols-4 gap-x-4 pt-24 sm:grid-cols-8 sm:pt-44 lg:grid-cols-12">
            <div className="col-span-4 mb-6 sm:col-span-2 lg:col-span-3">
              <h2 id="bts-title" className="label text-ember">
                Behind the scenes
              </h2>
            </div>
            <div className="col-span-4 sm:col-span-6 lg:col-span-7">
              {project.bts.map((image) => (
                <ImageReveal key={image.src}>
                  <div className="relative overflow-hidden bg-surface" style={{ aspectRatio: `${image.width} / ${image.height}` }}>
                    <Frame image={image} sizes="(min-width: 1024px) 58vw, 100vw" />
                  </div>
                </ImageReveal>
              ))}
            </div>
          </section>

          <section data-nav="solid" aria-labelledby="credits-title" className="gutter grid grid-cols-4 gap-x-4 py-24 sm:grid-cols-8 sm:py-44 lg:grid-cols-12">
            <div className="col-span-4 mb-6 sm:col-span-2 lg:col-span-3">
              <h2 id="credits-title" className="label text-ember">
                Credits
              </h2>
            </div>
            <dl className="col-span-4 sm:col-span-6 lg:col-span-5">
              {project.credits.map((credit) => (
                <div key={credit.role} className="flex justify-between gap-6 border-t border-line py-2.5 last:border-b">
                  <dt className="text-ash">{credit.role}</dt>
                  <dd>{credit.name}</dd>
                </div>
              ))}
            </dl>
          </section>
        </article>

        <TransitionLink
          href={`/work/${next.slug}`}
          morphSrc={optimizedUrl(next.hero.src, 2048)}
          strip
          data-nav="image"
          className="zoom-host relative block h-[86svh] overflow-hidden bg-black"
        >
          <div className="zoom-img absolute inset-0">
            <Frame image={next.hero} sizes="100vw" decorative />
          </div>
          <div className="absolute inset-0 bg-black/40" />
          <div className="vignette" />
          <div className="gutter absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 pb-8">
            <div>
              <p className="label mb-3 text-paper/80">Next project</p>
              <Magnetic>
                <p className="display type-section">{next.title}</p>
              </Magnetic>
            </div>
            <span className="arrow text-3xl" aria-hidden>→</span>
          </div>
        </TransitionLink>
      </main>
      <Footer />
      <AnimatePresence>{playing && project.video && <VideoPlayer film={project.video} onClose={() => setPlaying(false)} />}</AnimatePresence>
    </>
  );
}
