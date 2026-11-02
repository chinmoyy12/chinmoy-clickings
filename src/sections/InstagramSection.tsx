import { Frame } from "@/components/Frame";
import { Magnetic } from "@/components/MagneticButton";
import { ImageReveal, SectionReveal, TextReveal } from "@/components/Reveal";
import { social } from "@/data/social";

// Offsets keep the row reading like a contact sheet pinned up, not a social grid.
const OFFSETS = ["lg:mt-0", "lg:mt-24", "lg:mt-8", "lg:mt-36", "lg:mt-4", "lg:mt-20"];

export function InstagramSection() {
  return (
    <section data-nav="solid" aria-labelledby="process-title" className="pt-28 sm:pt-44">
      <header className="gutter mb-10 flex flex-col justify-between gap-6 sm:mb-16 sm:flex-row sm:items-end">
        <TextReveal lines={["Follow the", "process."]} className="display type-section" />
        <SectionReveal>
          <Magnetic>
            <a href={social.instagram.url} target="_blank" rel="noreferrer" data-cursor="Open" className="sweep text-[0.9375rem]">
              {social.instagram.handle} <span className="arrow" aria-hidden>→</span>
            </a>
          </Magnetic>
        </SectionReveal>
      </header>
      <ul className="gutter grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-2">
        {social.process.map((photo, i) => (
          <li key={photo.id} className={OFFSETS[i]}>
            <ImageReveal dir="up" delay={i * 60}>
              <a href={social.instagram.url} target="_blank" rel="noreferrer" data-cursor="Open" aria-label={`${photo.title} on Instagram`} className="zoom-host relative block aspect-[4/5] overflow-hidden bg-surface">
                <div className="zoom-img tone absolute inset-0">
                  <Frame image={photo} sizes="(min-width: 1024px) 17vw, (min-width: 640px) 33vw, 50vw" quality={70} />
                </div>
              </a>
            </ImageReveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
