"use client";

import { useState } from "react";
import { SectionReveal, TextReveal } from "@/components/Reveal";
import { services } from "@/data/services";
import { pad } from "@/utils/media";

export function ServicesSection() {
  const [open, setOpen] = useState(0);

  return (
    <section id="services" data-nav="solid" aria-labelledby="services-title" className="gutter pt-24 sm:pt-40">
      <div className="text-right">
        <SectionReveal>
          <p className="label mb-3 text-ember">02 / Services</p>
        </SectionReveal>
        <div id="services-title" className="mb-10">
          <TextReveal lines={["What I", "can do."]} accent={1} className="display type-section" />
        </div>
      </div>
      <ul className="border-t border-line">
        {services.map((group, i) => {
          const expanded = open === i;
          return (
            <li key={group.title} className="border-b border-line">
              <h3>
                <button type="button" aria-expanded={expanded} aria-controls={`service-${i}`} onClick={() => setOpen(expanded ? -1 : i)} className={`group flex w-full items-center gap-6 px-3 py-5 text-left transition-colors duration-200 hover:bg-paper hover:text-ink ${expanded ? "bg-surface" : ""}`}>
                  <span className="label text-inherit">{pad(i + 1)}</span>
                  <span className="display flex-1 text-[clamp(1.25rem,2.6vw,2.25rem)] leading-none">{group.title}</span>
                  <span className={`text-xl transition-transform duration-300 ease-cine ${expanded ? "rotate-90" : ""}`} aria-hidden>
                    ↘
                  </span>
                </button>
              </h3>
              <div id={`service-${i}`} className={`grid transition-[grid-template-rows] duration-500 ease-cine ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="min-h-0 overflow-hidden" inert={!expanded}>
                  <ul className="flex flex-wrap gap-2 px-3 pb-5 pt-2">
                    {group.items.map((item) => (
                      <li key={item} className="label rounded-full border border-line px-4 py-2 text-paper">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
