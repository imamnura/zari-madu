"use client";

import { useEffect } from "react";

/** Setelah navigasi client ke `/#section`, scroll ke elemen (browser tidak selalu melakukannya). */
export function HomeHashScroll() {
  useEffect(() => {
    const hash = window.location.hash?.slice(1);
    if (!hash) return;

    const scroll = () => {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
    };

    const raf = requestAnimationFrame(scroll);
    const t2 = setTimeout(scroll, 350);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t2);
    };
  }, []);

  return null;
}
