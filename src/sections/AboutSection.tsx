import { Frame } from "@/components/Frame";
import { ImageReveal, SectionReveal, TextReveal } from "@/components/Reveal";
import { site } from "@/data/site";

export function AboutSection() {
  const { about } = site;
  return (
    <section id="about" data-nav="solid" aria-labelledby="about-title" className="gutter grid grid-cols-4 gap-x-4 pt-28 sm:grid-cols-8 sm:pt-52 lg:grid-cols-12">
      <SectionReveal className="col-span-4 sm:col-span-8 lg:col-span-12">
        <p className="label mb-5 text-ember">05 / About</p>
      </SectionReveal>
      <div id="about-title" className="col-span-4 sm:col-span-8 lg:col-span-12">
        <TextReveal lines={about.headline} className="display type-section" />
      </div>

      <div className="col-span-4 mt-14 sm:col-span-4 sm:mt-24 lg:col-span-4">
        <ImageReveal dir="up">
          <div className="relative aspect-[4/5] overflow-hidden bg-surface">
            <Frame image={about.portrait} sizes="(min-width: 1024px) 34vw, (min-width: 640px) 50vw, 100vw" />
          </div>
        </ImageReveal>
      </div>

      <div className="col-span-4 mt-12 flex flex-col justify-end sm:col-span-4 sm:mt-24 lg:col-span-6 lg:col-start-7">
        <SectionReveal>
          <p className="text-[clamp(1.125rem,1.7vw,1.5rem)] leading-snug">{about.lead}</p>
        </SectionReveal>
        <SectionReveal delay={120} className="mt-6">
          {about.details.map((line) => (
            <p key={line} className="display text-[clamp(1.75rem,3vw,3rem)] leading-[1.12] text-ash">
              {line}
            </p>
          ))}
        </SectionReveal>
        <SectionReveal delay={200} className="mt-6 max-w-lg space-y-4 text-ash">
          <p>{about.close}</p>
          <p>{about.practice}</p>
        </SectionReveal>
        <SectionReveal delay={260} as="ul" className="mt-10 flex flex-wrap gap-x-6 gap-y-1 border-t border-line pt-4">
          {about.roles.map((role) => (
            <li key={role} className="label text-paper">
              {role}
            </li>
          ))}
        </SectionReveal>
      </div>
    </section>
  );
}
