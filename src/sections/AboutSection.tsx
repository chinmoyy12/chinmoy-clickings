import { Frame } from "@/components/Frame";
import { ImageReveal, SectionReveal, TextReveal } from "@/components/Reveal";
import { ScrollWords } from "@/components/ScrollWords";
import { services } from "@/data/services";
import { site } from "@/data/site";

const SKILLS = [...new Set(services.flatMap((group) => group.items))];

function Marquee({ reverse }: { reverse?: boolean }) {
  return (
    <div className="marquee" aria-hidden>
      <div className={`marquee-track ${reverse ? "marquee-reverse" : ""}`}>
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 gap-2 pr-2">
            {SKILLS.map((skill) => (
              <span key={skill} className="label whitespace-nowrap rounded-full border border-line px-4 py-2 text-paper">
                {skill}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AboutSection() {
  const { about } = site;

  return (
    <section id="about" data-nav="solid" aria-labelledby="about-title" className="pt-24 sm:pt-40">
      <div className="gutter grid gap-x-6 gap-y-10 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <SectionReveal>
            <p className="label mb-3 text-ember">01 / About me</p>
          </SectionReveal>
          <div id="about-title">
            <TextReveal lines={["Intro"]} className="display type-section" />
          </div>
          <ImageReveal dir="up" className="mt-8">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-surface lg:aspect-square">
              <Frame image={about.portrait} sizes="(min-width: 1024px) 40vw, 100vw" />
            </div>
          </ImageReveal>
        </div>

        <div className="lg:col-span-6 lg:col-start-7 lg:self-end">
          <SectionReveal className="glass p-6 sm:p-8">
            <ScrollWords text={site.statement.join(" ")} className="display text-[clamp(1.75rem,3.2vw,3.25rem)] leading-[1.05]" />
            <p className="mt-5 text-[clamp(1.0625rem,1.4vw,1.25rem)] leading-snug">{about.lead}</p>
            <p className="mt-3 text-ash">{about.details.join(" ")}</p>
            <p className="mt-3 text-ash">{about.close}</p>
            <p className="mt-3 text-ash">{about.practice}</p>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-1 border-t border-line pt-4">
              {about.roles.map((role) => (
                <li key={role} className="label text-paper">
                  {role}
                </li>
              ))}
            </ul>
          </SectionReveal>
          <SectionReveal delay={100} className="glass mt-3 p-6">
            <blockquote className="quote text-[clamp(1.375rem,2.2vw,2rem)] leading-[1.15]">{site.philosophyLine}</blockquote>
            <p className="label mt-3 text-ember">Chinmoy</p>
          </SectionReveal>
        </div>
      </div>

      <div className="mt-14 space-y-2">
        <p className="label gutter mb-3 text-ember">The craft</p>
        <Marquee />
        <Marquee reverse />
      </div>
    </section>
  );
}
