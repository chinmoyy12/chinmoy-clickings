import { SectionReveal, TextReveal } from "@/components/Reveal";
import { services } from "@/data/services";
import { pad } from "@/utils/media";

export function ServicesSection() {
  return (
    <section data-nav="solid" aria-labelledby="services-title" className="gutter pt-24 sm:pt-40">
      <SectionReveal>
        <p className="label mb-3 text-ember">07 / Services</p>
      </SectionReveal>
      <div id="services-title" className="mb-10 sm:mb-14">
        <TextReveal lines={["What I do."]} className="display type-section" />
      </div>
      <div className="grid gap-px bg-line sm:grid-cols-3">
        {services.map((group, i) => (
          <SectionReveal key={group.title} delay={i * 90} className="group bg-ink p-6 transition-colors duration-500 hover:bg-surface">
            <p className="label text-ember">{pad(i + 1)}</p>
            <h3 className="display mt-3 text-[clamp(2rem,3.4vw,3.25rem)] leading-none">{group.title}</h3>
            <ul className="mt-5">
              {group.items.map((item) => (
                <li key={item} className="py-1 text-ash transition-[color,transform] duration-500 ease-cine hover:translate-x-2 hover:text-paper">
                  {item}
                </li>
              ))}
            </ul>
          </SectionReveal>
        ))}
      </div>
    </section>
  );
}
