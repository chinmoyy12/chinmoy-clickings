"use client";

import { useMemo } from "react";
import { LightRays } from "@/components/LightRays";
import { PhotoWallet, type WalletItem } from "@/components/PhotoWallet";
import { SectionReveal, TextReveal } from "@/components/Reveal";
import { photoCategories, photos } from "@/data/photos";
import { duration, films } from "@/data/videos";
import { pad } from "@/utils/media";

export function WalletShowcase() {
  const reels = useMemo<WalletItem[]>(() => films.map((film) => ({ id: film.id, title: film.title, meta: duration(film.seconds), image: film.poster, href: `/watch/${film.id}`, action: "Play film" })), []);
  const stills = useMemo<WalletItem[]>(
    () =>
      photoCategories.map((category) => {
        const set = photos.filter((photo) => photo.category === category);
        return { id: category, title: category, meta: `${set.length} stills`, image: set[0], href: `/stills/${category.toLowerCase()}`, action: "View stills" };
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
        <PhotoWallet label="Films" total={`${pad(films.length)} films`} items={reels} />
        <PhotoWallet label="Photography" total={`${pad(photos.length)} stills`} items={stills} />
      </div>
    </section>
  );
}
