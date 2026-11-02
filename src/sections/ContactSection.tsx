"use client";

import { useEffect, useRef, useState } from "react";
import { FlowBackground } from "@/components/FlowBackground";
import { Magnetic } from "@/components/MagneticButton";
import { TextReveal } from "@/components/Reveal";
import { site } from "@/data/site";
import { social } from "@/data/social";
import { prefersReducedMotion } from "@/utils/device";

/** Drifting dust, only drawn while the card is on screen. */
function useDust(canvas: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const element = canvas.current;
    const context = element?.getContext("2d");
    if (!element || !context) return;
    const dots = Array.from({ length: 70 }, () => ({ x: Math.random(), y: Math.random(), r: 0.5 + Math.random() * 1.6, v: 0.0004 + Math.random() * 0.001 }));
    let frame = 0;
    const size = () => {
      element.width = element.clientWidth;
      element.height = element.clientHeight;
    };
    const draw = () => {
      context.clearRect(0, 0, element.width, element.height);
      context.fillStyle = "rgba(232,38,45,0.6)";
      for (const dot of dots) {
        dot.y = (dot.y - dot.v + 1) % 1;
        context.beginPath();
        context.arc(dot.x * element.width, dot.y * element.height, dot.r, 0, 6.3);
        context.fill();
      }
    };
    const loop = () => {
      draw();
      frame = requestAnimationFrame(loop);
    };
    size();
    draw();
    const reduced = prefersReducedMotion();
    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frame);
      if (entry.isIntersecting && !reduced) loop();
    });
    io.observe(element);
    window.addEventListener("resize", size);
    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      window.removeEventListener("resize", size);
    };
  }, [canvas]);
}

export function ContactSection() {
  const dust = useRef<HTMLCanvasElement>(null);
  const [topic, setTopic] = useState(site.contact.availability[0]);
  const [copied, setCopied] = useState("");
  useDust(dust);

  const message = `Hi Chinmoy, I'd like to talk about ${topic.toLowerCase()}.`;
  const mailto = `mailto:${social.email}?subject=${encodeURIComponent(topic)}&body=${encodeURIComponent(message)}`;

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(social.email);
      setCopied("Copied");
    } catch {
      setCopied("Press and hold the address to copy");
    }
    window.setTimeout(() => setCopied(""), 2500);
  };

  return (
    <section id="contact" data-nav="solid" aria-labelledby="contact-title" className="gutter relative mt-24 grid gap-10 overflow-hidden pb-10 pt-24 sm:mt-40 sm:pt-32 lg:grid-cols-12 lg:gap-6">
      <FlowBackground />
      <div className="relative lg:col-span-7">
        <p className="label mb-3 text-ember">09 / Contact</p>
        <div id="contact-title">
          <TextReveal lines={site.contact.headline} accent={1} className="display type-section" />
        </div>
        <p className="mt-5 text-[clamp(1.0625rem,1.5vw,1.3125rem)] text-paper">{site.contact.line}</p>
        <fieldset className="mt-8">
          <legend className="label mb-3 text-paper/80">I'm available for</legend>
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            {site.contact.availability.map((item) => (
              <label key={item} className={`cursor-pointer py-1 text-[0.9375rem] transition-colors duration-500 has-[:focus-visible]:outline has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-offset-2 ${topic === item ? "text-paper" : "text-ash hover:text-paper"}`}>
                <input type="radio" name="topic" value={item} checked={topic === item} onChange={() => setTopic(item)} className="sr-only" />
                <span className={`mr-2 inline-block h-1 w-1 translate-y-[-2px] rounded-full bg-ember transition-opacity duration-500 ${topic === item ? "opacity-100" : "opacity-0"}`} aria-hidden />
                {item}
              </label>
            ))}
          </div>
        </fieldset>
        <ul className="mt-8 max-w-xl">
          <li className="border-t border-line py-3">
            <div className="flex items-center justify-between gap-4">
              <span className="label">Email</span>
              <button type="button" onClick={copyEmail} className="label sweep text-paper" aria-live="polite">
                {copied || "Copy"}
              </button>
            </div>
            <a href={mailto} className="mt-1 block break-all text-[clamp(0.9375rem,1.5vw,1.25rem)] transition-colors duration-500 hover:text-ember">
              {social.email} <span className="arrow" aria-hidden>→</span>
            </a>
          </li>
          <li className="border-y border-line">
            <Magnetic className="w-full">
              <a href={social.instagram.url} target="_blank" rel="noreferrer" className="flex items-baseline justify-between gap-4 py-3 transition-colors duration-500 hover:text-ember">
                <span className="label">Instagram</span>
                <span className="text-[0.9375rem]">
                  {social.instagram.handle} <span className="arrow" aria-hidden>→</span>
                </span>
              </a>
            </Magnetic>
          </li>
        </ul>
      </div>

      <a href={mailto} className="glass group relative flex min-h-[20rem] flex-col justify-between overflow-hidden p-6 transition-colors duration-300 hover:border-ember focus-visible:border-ember lg:col-span-4 lg:col-start-9">
        <canvas ref={dust} className="absolute inset-0 h-full w-full" aria-hidden />
        <span className="label relative">Start something</span>
        <span className="display relative text-[clamp(3rem,5.5vw,5.5rem)] leading-[0.95]">
          Make it
          <br />
          <span className="red whitespace-nowrap text-[0.72em]">feel real.</span>
        </span>
      </a>
    </section>
  );
}
