"use client";

import { useMemo } from "react";
import { LightRays } from "@/components/LightRays";
import { PhotoWallet, type WalletItem } from "@/components/PhotoWallet";
import { SectionReveal, TextReveal } from "@/components/Reveal";
import { photoCategories, photos } from "@/data/photos";
import { projects } from "@/data/projects";
import { pad } from "@/utils/media";
import { scrollToTarget } from "@/utils/scroll";

const openCategory = (category: string) => {
  window.dispatchEvent(new CustomEvent("cc:filter", { detail: category }));
  // Scroll once the gallery has re-measured, or the refresh cancels the journey.
  window.setTimeout(() => scrollToTarget("#photo"), 800);
};

export function WalletShowcase() {
  const work = useMemo<WalletItem[]>(() => projects.map((project) => ({ id: project.id, title: project.title, meta: project.year, image: project.hero, href: `/work/${project.slug}`, action: "View project" })), []);
  const stills = useMemo<WalletItem[]>(
    () =>
      photoCategories.map((category) => {
        const set = photos.filter((photo) => photo.category === category);
        return { id: category, title: category, meta: `${set.length} stills`, image: set[0], onOpen: () => openCategory(category), action: "See them" };
      }),
    [],
  );

  return (
    <section id="work" data-nav="solid" aria-labelledby="work-title" className="gutter relative overflow-hidden pb-6 pt-24 sm:pt-36">
      <LightRays color="#ff8a5c" spread={0.8} reach={1.3} className="opacity-25 mix-blend-screen" />
      <header className="relative mb-4 text-center">
        <SectionReveal>
          <p className="label mb-3 text-ember">03 / Selected work</p>
        </SectionReveal>
        <div id="work-title">
          <TextReveal lines={["Open the", "wallet."]} accent={1} className="display type-section" />
        </div>
        <SectionReveal delay={100}>
          <p className="mx-auto mt-4 max-w-md text-ash">Everything I carry. Hover to fan the cards, then pull one out.</p>
        </SectionReveal>
      </header>
      <div className="relative grid gap-x-8 gap-y-6 lg:grid-cols-2">
        <PhotoWallet label="Projects" total={`${pad(projects.length)} films`} items={work} />
        <PhotoWallet label="Photography" total={`${pad(photos.length)} stills`} items={stills} />
      </div>
    </section>
  );
}
