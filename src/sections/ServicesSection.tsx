"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/animations/gsap";
import { SectionReveal, TextReveal } from "@/components/Reveal";
import { photos } from "@/data/photos";
import { projects } from "@/data/projects";
import { services } from "@/data/services";
import { site } from "@/data/site";
import { devicePower, prefersReducedMotion } from "@/utils/device";
import { pad } from "@/utils/media";

const STARS = 7;

/** Tilt, magnetism, stars and a click ripple. Touch keeps the ripple; reduced motion keeps nothing. */
function BentoCard({ className, children }: { className: string; children: React.ReactNode }) {
  const card = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = card.current;
    if (!element) return;
    const onRipple = (event: PointerEvent) => {
      if (prefersReducedMotion()) return;
      const box = element.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "bento-ripple";
      ripple.style.left = `${event.clientX - box.left}px`;
      ripple.style.top = `${event.clientY - box.top}px`;
      element.append(ripple);
      gsap.fromTo(ripple, { scale: 0, opacity: 1 }, { scale: 46, opacity: 0, duration: 0.8, ease: "power2.out", onComplete: () => ripple.remove() });
    };
    element.addEventListener("pointerdown", onRipple);
    if (devicePower() !== "high") return () => element.removeEventListener("pointerdown", onRipple);

    let stars: HTMLElement[] = [];
    const onEnter = () => {
      const box = element.getBoundingClientRect();
      stars = Array.from({ length: STARS }, () => {
        const star = document.createElement("span");
        star.className = "bento-star";
        star.style.left = `${Math.random() * box.width}px`;
        star.style.top = `${Math.random() * box.height}px`;
        element.append(star);
        gsap.fromTo(star, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, delay: Math.random() * 0.5 });
        gsap.to(star, { x: (Math.random() - 0.5) * 90, y: (Math.random() - 0.5) * 90, duration: 2 + Math.random() * 2, ease: "none", repeat: -1, yoyo: true });
        return star;
      });
    };
    const onMove = (event: PointerEvent) => {
      const box = element.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - 0.5;
      const y = (event.clientY - box.top) / box.height - 0.5;
      gsap.to(element, { rotationY: x * 12, rotationX: -y * 12, x: x * 10, y: y * 10, transformPerspective: 1000, duration: 0.3, ease: "power2.out", overwrite: "auto" });
    };
    const onLeave = () => {
      gsap.to(element, { rotationX: 0, rotationY: 0, x: 0, y: 0, duration: 0.4, ease: "power2.out", overwrite: "auto" });
      for (const star of stars) {
        gsap.killTweensOf(star);
        gsap.to(star, { scale: 0, opacity: 0, duration: 0.25, onComplete: () => star.remove() });
      }
      stars = [];
    };
    element.addEventListener("pointerenter", onEnter);
    element.addEventListener("pointermove", onMove);
    element.addEventListener("pointerleave", onLeave);
    return () => {
      element.removeEventListener("pointerdown", onRipple);
      element.removeEventListener("pointerenter", onEnter);
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", onLeave);
      stars.forEach((star) => star.remove());
    };
  }, []);

  return (
    <div ref={card} className={`bento-card ${className}`}>
      <span className="bento-spot" aria-hidden />
      <span className="bento-edge" aria-hidden />
      {children}
    </div>
  );
}

function Service({ index, className }: { index: number; className: string }) {
  const group = services[index];
  return (
    <BentoCard className={className}>
      <p className="label text-ember">{pad(index + 1)} / Service</p>
      <div className="relative mt-auto">
        <h3 className="display text-[clamp(1.75rem,3vw,2.75rem)] leading-none">{group.title}</h3>
        <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[0.875rem] text-ash">
          {group.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </BentoCard>
  );
}

function Stat({ value, label, className }: { value: string; label: string; className: string }) {
  return (
    <BentoCard className={className}>
      <p className="label">{label}</p>
      <p className="display relative mt-auto text-[clamp(2.75rem,5vw,4.5rem)] leading-none text-ember">{value}</p>
    </BentoCard>
  );
}

export function ServicesSection() {
  const grid = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (devicePower() !== "high") return;
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        grid.current?.querySelectorAll<HTMLElement>(".bento-card").forEach((card) => {
          const box = card.getBoundingClientRect();
          card.style.setProperty("--mx", `${event.clientX - box.left}px`);
          card.style.setProperty("--my", `${event.clientY - box.top}px`);
        });
      });
    };
    const element = grid.current;
    element?.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      element?.removeEventListener("pointermove", onMove);
    };
  }, []);

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
      <div ref={grid} className="bento-grid">
        <Service index={0} className="bento-wide" />
        <Stat value={pad(projects.length)} label="Selected projects" className="" />
        <Service index={2} className="bento-tall" />
        <Stat value={pad(photos.length)} label="Stills in the gallery" className="" />
        <Service index={1} className="bento-wide" />
        <Stat value="2024–26" label={site.location} className="" />
      </div>
    </section>
  );
}
