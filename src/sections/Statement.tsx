import { SectionReveal, TextReveal } from "@/components/Reveal";
import { site } from "@/data/site";

export function Statement() {
  return (
    <section data-nav="solid" className="gutter grid grid-cols-4 gap-x-4 pb-24 pt-32 sm:grid-cols-8 sm:pb-40 sm:pt-52 lg:grid-cols-12">
      <SectionReveal className="col-span-4 mb-10 sm:col-span-2 lg:col-span-3">
        <p className="label">{site.location}</p>
      </SectionReveal>
      <TextReveal as="p" lines={site.statement} className="display type-section col-span-4 sm:col-span-6 lg:col-span-9" />
    </section>
  );
}
