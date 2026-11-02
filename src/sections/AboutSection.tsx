import { Frame } from "@/components/Frame";
import { ImageReveal, SectionReveal, TextReveal } from "@/components/Reveal";
import { services } from "@/data/services";
import { site } from "@/data/site";

export function AboutSection() {
  const { about } = site;
  const skills = services.find((group) => group.title === "Creative")?.items ?? [];

  return (
    <section id="about" data-nav="solid" aria-labelledby="about-title" className="gutter grid gap-x-6 gap-y-10 pt-24 sm:pt-40 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <SectionReveal>
          <p className="label mb-3 text-ember">05 / Behind the frames</p>
        </SectionReveal>
        <div id="about-title">
          <TextReveal lines={site.statement} accent={1} className="display type-section" />
        </div>
        <SectionReveal delay={120} className="mt-8 max-w-xl">
          <p className="text-[clamp(1.0625rem,1.5vw,1.3125rem)] leading-snug">{about.lead}</p>
          <p className="mt-3 text-ash">{about.details.join(" ")}</p>
          <p className="mt-3 text-ash">{about.close}</p>
          <p className="mt-3 text-ash">{about.practice}</p>
        </SectionReveal>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <SectionReveal>
            <h3 className="label mb-3 text-paper">I am a</h3>
            <ul className="space-y-1 text-ash">
              {about.roles.map((role) => (
                <li key={role}>{role}</li>
              ))}
            </ul>
          </SectionReveal>
          <SectionReveal delay={80}>
            <h3 className="label mb-3 text-paper">Craft</h3>
            <ul className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <li key={skill} className="label border border-line px-2.5 py-1.5 text-paper">
                  {skill}
                </li>
              ))}
            </ul>
          </SectionReveal>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
        <ImageReveal dir="up">
          <div className="relative aspect-[4/5] overflow-hidden bg-surface lg:aspect-[5/6]">
            <Frame image={about.portrait} sizes="(min-width: 1024px) 40vw, (min-width: 640px) 50vw, 100vw" />
          </div>
        </ImageReveal>
        <SectionReveal className="flex flex-col justify-between gap-6 bg-wine p-6">
          <span className="display text-5xl leading-none text-paper/50" aria-hidden>
            “
          </span>
          <blockquote className="display text-[clamp(1.5rem,2.4vw,2.25rem)] leading-[1.05]">{site.philosophyLine}</blockquote>
          <p className="label text-paper/80">Chinmoy</p>
        </SectionReveal>
      </div>
    </section>
  );
}
