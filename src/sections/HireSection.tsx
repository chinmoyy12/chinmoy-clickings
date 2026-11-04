"use client";

import { useRef, useState } from "react";
import { Halftone } from "@/components/Halftone";
import { Magnetic } from "@/components/MagneticButton";
import { SectionReveal, TextReveal } from "@/components/Reveal";
import { BlurHeading } from "@/components/Type";
import { site } from "@/data/site";
import { social } from "@/data/social";

type Status = "idle" | "sending" | "sent" | "failed";

const FIELDS = ["name", "email", "phone", "service", "date", "location", "budget", "requirements"] as const;

/** The request as an email, used when the form cannot reach the inbox on its own. */
function mailtoFor(form: HTMLFormElement | null) {
  const data = form ? new FormData(form) : new FormData();
  const value = (key: string) => String(data.get(key) ?? "").trim();
  const lines = FIELDS.map((key) => `${key[0].toUpperCase()}${key.slice(1)}: ${value(key) || "-"}`);
  const subject = `Booking request: ${value("service") || "Shoot"}${value("name") ? ` from ${value("name")}` : ""}`;
  return `mailto:${social.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Hi Chinmoy,\n\n${lines.join("\n")}\n`)}`;
}

function Field({ label, name, type = "text", required, placeholder, autoComplete }: { label: string; name: string; type?: string; required?: boolean; placeholder?: string; autoComplete?: string }) {
  return (
    <label className="field">
      <span className="label">
        {label}
        {required && <span className="text-ember"> *</span>}
      </span>
      <input name={name} type={type} required={required} placeholder={placeholder} autoComplete={autoComplete} className="field-input" />
    </label>
  );
}

/** Rates, direct links and a booking form whose requests arrive in Chinmoy's inbox. */
export function HireSection() {
  const form = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const { hire } = site;

  const openForm = () => {
    form.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => form.current?.querySelector<HTMLInputElement>("input[name=name]")?.focus({ preventScroll: true }), 650);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const element = event.currentTarget;
    const data = new FormData(element);
    // Bots fill the hidden field; people never see it.
    if (data.get("bot-field")) return setStatus("sent");
    setStatus("sending");
    const timeout = new AbortController();
    const timer = window.setTimeout(() => timeout.abort(), 12000);
    try {
      const body = new URLSearchParams();
      body.set("form-name", "booking");
      for (const [key, value] of data) body.set(key, String(value));
      const response = await fetch("/__forms.html", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body.toString(), signal: timeout.signal });
      if (!response.ok) throw new Error(String(response.status));
      setStatus("sent");
      element.reset();
    } catch {
      // The request must never be lost: hand it to the visitor's email app, already written.
      setStatus("failed");
      window.location.href = mailtoFor(element);
    } finally {
      window.clearTimeout(timer);
    }
  };

  return (
    <section id="hire" data-nav="solid" aria-labelledby="hire-title" className="relative isolate overflow-hidden pb-24 pt-24 sm:pb-32 sm:pt-40">
      <Halftone className="-z-10" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_20%_30%,rgb(8_9_13/0.92),rgb(8_9_13/0.45)_60%,rgb(8_9_13/0.8))]" aria-hidden />

      <div className="gutter grid gap-10 lg:grid-cols-12 lg:gap-6">
        <header className="lg:col-span-6">
          <SectionReveal>
            <p className="label mb-3 text-ember">08 / Let&apos;s work together</p>
          </SectionReveal>
          <div id="hire-title">
            <TextReveal lines={["Hire", "me."]} accent={1} className="display type-section" />
          </div>
          <SectionReveal delay={100}>
            <p className="mt-5 max-w-md text-[clamp(1.0625rem,1.5vw,1.3125rem)] text-paper">{hire.line}</p>
          </SectionReveal>
          <SectionReveal delay={160} className="mt-8 flex flex-wrap gap-3">
            <Magnetic>
              <a href={social.instagram.url} target="_blank" rel="noreferrer" className="pill">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
                </svg>
                Instagram
              </a>
            </Magnetic>
            <Magnetic>
              <a href={`mailto:${social.email}?subject=${encodeURIComponent("Working together")}`} className="pill">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3.5 6.5 8.5 7 8.5-7" />
                </svg>
                Email me
              </a>
            </Magnetic>
            <Magnetic>
              <button type="button" onClick={openForm} className="pill pill-solid">
                Book a shoot <span className="arrow" aria-hidden>→</span>
              </button>
            </Magnetic>
          </SectionReveal>
        </header>

        <div className="grid gap-3 sm:grid-cols-3 lg:col-span-12 lg:mt-6">
          {hire.rates.map((rate, i) => (
            <SectionReveal key={rate.service} delay={i * 90} className="rate-card">
              <BlurHeading text={rate.service} className="text-[clamp(1.75rem,3vw,2.75rem)] hover:text-ember" />
              <p className="display mt-6 text-[clamp(2.25rem,4vw,3.5rem)] leading-none text-ember">{rate.price}</p>
              <p className="label mt-2 text-paper">{rate.unit}</p>
              <p className="mt-4 text-ash">{rate.note}</p>
            </SectionReveal>
          ))}
        </div>

        <form ref={form} name="booking" method="POST" onSubmit={submit} className="booking grid gap-x-4 gap-y-5 p-6 sm:grid-cols-2 sm:p-8 lg:col-span-8 lg:col-start-3 lg:mt-6" aria-describedby="booking-note">
          <input type="hidden" name="form-name" value="booking" />
          <p className="hidden">
            <label>
              Leave this empty <input name="bot-field" tabIndex={-1} autoComplete="off" />
            </label>
          </p>
          <div className="sm:col-span-2">
            <BlurHeading text="Send a booking request" className="text-[clamp(1.5rem,2.6vw,2.25rem)]" />
            <p id="booking-note" className="mt-2 text-ash">
              Tell me about the shoot. Your request comes straight to my inbox and I&apos;ll reply by email.
            </p>
          </div>
          <Field label="Your name" name="name" required autoComplete="name" />
          <Field label="Email" name="email" type="email" required autoComplete="email" />
          <Field label="Phone or WhatsApp" name="phone" type="tel" autoComplete="tel" placeholder="Optional" />
          <Field label="Date" name="date" type="date" />
          <fieldset className="sm:col-span-2">
            <legend className="label mb-2">
              What do you need<span className="text-ember"> *</span>
            </legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {hire.services.map((service, i) => (
                <label key={service} className="choice">
                  <input type="radio" name="service" value={service} required className="sr-only" />
                  <span className="text-[1.0625rem] font-semibold leading-tight">{service}</span>
                  <span className="label mt-1 text-ash">{hire.rates[i] ? `${hire.rates[i].price}` : "Tell me below"}</span>
                  <span className="choice-dot" aria-hidden />
                </label>
              ))}
            </div>
          </fieldset>
          <Field label="Location" name="location" placeholder="City or venue" autoComplete="address-level2" />
          <Field label="Budget" name="budget" placeholder="In rupees, optional" />
          <label className="field sm:col-span-2">
            <span className="label">
              Requirements<span className="text-ember"> *</span>
            </span>
            <textarea name="requirements" required rows={4} placeholder="What's the occasion, how many reels or photos, the look you're after…" className="field-input resize-y" />
          </label>

          <div className="flex flex-wrap items-center justify-between gap-4 sm:col-span-2" aria-live="polite">
            <button type="submit" disabled={status === "sending"} className="pill pill-solid disabled:opacity-60">
              {status === "sending" ? "Sending…" : "Send booking request"} <span className="arrow" aria-hidden>→</span>
            </button>
            {status === "sent" && <p className="text-paper">Thank you. Your request is in my inbox, and I&apos;ll get back to you soon.</p>}
            {status === "failed" && (
              <p className="max-w-md text-paper">
                Your email app is opening with the request already written. Just press send.{" "}
                <a href={mailtoFor(form.current)} className="sweep text-ember">
                  Open it again
                </a>
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
