"use client";

import { useEffect, useRef } from "react";

let observer: IntersectionObserver | null = null;

function shared() {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute("data-in", "");
        observer?.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
  );
  return observer;
}

/** Marks an element with data-in the first time it enters view; CSS does the rest. */
export function useReveal<T extends Element>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const io = shared();
    io.observe(element);
    return () => io.unobserve(element);
  }, []);
  return ref;
}
