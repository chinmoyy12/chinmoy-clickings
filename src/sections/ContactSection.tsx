"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/animations/gsap";
import { Frame } from "@/components/Frame";
import { Magnetic } from "@/components/MagneticButton";
import { TextReveal } from "@/components/Reveal";
import { photos } from "@/data/photos";
import { site } from "@/data/site";
import { social } from "@/data/social";

const backdrop = photos.find((photo) => photo.id === "travel-01")!;

export function ContactSection() {
  const root = useRef<HTMLElement>(null);
  const drain = useRef<HTMLDivElement>(null);
  const fade = useRef<HTMLDivElement>(null);
  const [topic, setTopic] = useState(site.contact.availability[0]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // The scene slowly loses its colour, then its light, as the film ends.
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: true },
    });
    tl.fromTo(drain.current, { opacity: 0 }, { opacity: 1, duration: 1 }, 0).fromTo(fade.current, { opacity: 0.3 }, { opacity: 0.86, duration: 1 }, 0);
    return () => void tl.scrollTrigger?.kill();
  }, []);

  const message = `Hi Chinmoy, I'd like to talk about ${topic.toLowerCase()}.`;
  const mailto = `mailto:${social.email}?subject=${encodeURIComponent(topic)}&body=${encodeURIComponent(message)}`;

  const copyEmail = async () => {
    await navigator.clipboard.writeText(social.email);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section ref={root} id="contact" data-nav="image" aria-labelledby="contact-title" className="relative mt-28 h-[220svh] bg-black sm:mt-44">
      <div className="sticky top-0 h-svh min-h-[36rem] overflow-hidden">
        <Frame image={backdrop} sizes="100vw" decorative />
        <div ref={drain} className="absolute inset-0 bg-black mix-blend-saturation" aria-hidden />
        <div ref={fade} className="absolute inset-0 bg-black" aria-hidden />
        <div className="vignette" />

      <div className="gutter absolute inset-0 flex flex-col justify-center gap-8 pb-8 pt-20">
        <div id="contact-title">
          <TextReveal lines={site.contact.headline} className="display type-section" />
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-12">
          <fieldset className="lg:col-span-6">
            <legend className="label mb-3 text-paper/80">I'm available for</legend>
            <div className="flex flex-wrap gap-x-5 gap-y-1">
              {site.contact.availability.map((item) => (
                <label key={item} className={`cursor-pointer py-1 text-[0.9375rem] transition-colors duration-500 has-[:focus-visible]:outline has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-offset-2 ${topic === item ? "text-paper" : "text-paper/55 hover:text-paper"}`}>
                  <input type="radio" name="topic" value={item} checked={topic === item} onChange={() => setTopic(item)} className="sr-only" />
                  <span className={`mr-2 inline-block h-1 w-1 translate-y-[-2px] rounded-full bg-ember transition-opacity duration-500 ${topic === item ? "opacity-100" : "opacity-0"}`} aria-hidden />
                  {item}
                </label>
              ))}
            </div>
          </fieldset>
          <ul className="lg:col-span-5 lg:col-start-8">
            <li className="border-t border-line py-3">
              <div className="flex items-center justify-between gap-4">
                <span className="label text-paper/80">Email</span>
                <button type="button" onClick={copyEmail} className="label sweep" aria-live="polite">
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <a href={mailto} data-cursor="Write" className="mt-1 block break-all text-[clamp(0.9375rem,1.5vw,1.25rem)]">
                {social.email} <span className="arrow" aria-hidden>→</span>
              </a>
            </li>
            <li className="border-y border-line">
              <Magnetic className="w-full">
                <a href={social.instagram.url} target="_blank" rel="noreferrer" data-cursor="Open" className="flex items-baseline justify-between gap-4 py-3">
                  <span className="label text-paper/80">Instagram</span>
                  <span className="text-[0.9375rem]">
                    {social.instagram.handle} <span className="arrow" aria-hidden>→</span>
                  </span>
                </a>
              </Magnetic>
            </li>
          </ul>
        </div>
      </div>
      </div>
    </section>
  );
}
