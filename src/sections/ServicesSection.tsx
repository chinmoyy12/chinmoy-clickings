import { SectionReveal } from "@/components/Reveal";
import { services } from "@/data/services";

export function ServicesSection() {
  return (
    <section data-nav="solid" aria-labelledby="services-title" className="gutter pt-28 sm:pt-44">
      <SectionReveal>
        <h2 id="services-title" className="label mb-10 text-ember sm:mb-14">
          06 / What I do
        </h2>
      </SectionReveal>
      <div className="grid gap-12 sm:grid-cols-3 sm:gap-6">
        {services.map((group, i) => (
          <SectionReveal key={group.title} delay={i * 90}>
            <h3 className="display border-b border-line pb-3 text-[clamp(2rem,3.4vw,3.25rem)]">{group.title}</h3>
            <ul className="mt-3">
              {group.items.map((item) => (
                <li key={item} className="py-1.5 text-ash transition-[color,transform] duration-500 ease-cine hover:translate-x-2 hover:text-paper">
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
