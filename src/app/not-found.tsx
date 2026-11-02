import type { Metadata } from "next";
import { TransitionLink } from "@/components/TransitionLink";

export const metadata: Metadata = { title: "Lost frame" };

export default function NotFound() {
  return (
    <main id="main" data-nav="image" className="gutter flex min-h-svh flex-col items-start justify-end bg-ink pb-12">
      <p className="label mb-4 text-ember">404</p>
      <h1 className="display type-section mb-8">This frame was <span className="red">never shot.</span></h1>
      <TransitionLink href="/" className="sweep text-[0.9375rem]">
        Back to the work <span className="arrow" aria-hidden>→</span>
      </TransitionLink>
    </main>
  );
}
