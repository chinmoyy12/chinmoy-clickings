"use client";

import { useEffect, useRef, useState } from "react";
import { FlowBackground } from "@/components/FlowBackground";
import { devicePower } from "@/utils/device";

interface TubesApp {
  tubes: { setColors: (colors: string[]) => void; setLightsColors: (colors: string[]) => void };
  dispose: () => void;
}

// Tasteful sets to cycle through on click, instead of pure random neon.
const PALETTES = [
  { tubes: ["#ff6a3d", "#ffb199", "#ece9e2"], lights: ["#ff6a3d", "#ffb199", "#ff3d6e", "#ffd9a0"] },
  { tubes: ["#d1d5db", "#ff6a3d", "#8d93a0"], lights: ["#ffffff", "#ff6a3d", "#8d93a0", "#ffb199"] },
  { tubes: ["#ff3d6e", "#ff6a3d", "#ffd9a0"], lights: ["#ff3d6e", "#ff9d5c", "#ffd9a0", "#ffffff"] },
];

/** Neon tubes that chase the cursor on capable desktops; warm smoke everywhere else. */
export function TubesBackdrop() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [tubes, setTubes] = useState(false);

  useEffect(() => {
    if (devicePower() === "high") setTubes(true);
  }, []);

  useEffect(() => {
    const element = canvas.current;
    if (!tubes || !element) return;
    const section = element.closest("section");
    let app: TubesApp | undefined;
    let palette = 0;
    let cancelled = false;
    let loading = false;

    // The tubes only exist while the section is on screen, so they cost nothing elsewhere.
    const library = () => import("threejs-components/build/cursors/tubes1.min.js");
    // Parse it while the visitor is idle after the intro, never mid-scroll on arrival.
    const early = window.setTimeout(() => void library().catch(() => undefined), 11000);
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !app && !loading) {
        loading = true;
        library()
          .then(({ default: TubesCursor }) => {
            loading = false;
            if (cancelled || !canvas.current) return;
            app = TubesCursor(canvas.current, { tubes: { colors: PALETTES[0].tubes, lights: { intensity: 200, colors: PALETTES[0].lights } } }) as TubesApp;
          })
          .catch(() => setTubes(false));
      }
    }, { rootMargin: "50% 0px" });
    io.observe(element);

    const onClick = (event: MouseEvent) => {
      if (!app || (event.target as Element).closest("a, button, label")) return;
      palette = (palette + 1) % PALETTES.length;
      app.tubes.setColors(PALETTES[palette].tubes);
      app.tubes.setLightsColors(PALETTES[palette].lights);
    };
    section?.addEventListener("click", onClick);
    return () => {
      cancelled = true;
      window.clearTimeout(early);
      io.disconnect();
      section?.removeEventListener("click", onClick);
      app?.dispose();
    };
  }, [tubes]);

  if (!tubes) return <FlowBackground />;
  return (
    <>
      <canvas ref={canvas} aria-hidden className="absolute inset-0 block h-full w-full" />
      <p className="label pointer-events-none absolute bottom-4 right-[var(--gutter)] flex animate-pulse items-center gap-2 text-paper/50" aria-hidden>
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M5 3l14 7-6 2-2 6z" strokeLinejoin="round" />
        </svg>
        Click to change the light
      </p>
    </>
  );
}
