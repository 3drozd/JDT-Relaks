"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.history.scrollRestoration = "manual";
  }, []);

  useEffect(() => {
    const container = document.querySelector("[data-scroll-container]");
    if (container) {
      container.scrollTo(0, 0);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  // Workaround for Chromium bug: scroll-snap-type mandatory ignores wheel
  // events after snapping if the cursor hasn't moved. We intercept wheel
  // events, accumulate delta, and snap only after scrolling 25% of the
  // viewport height — so one tick doesn't immediately jump a full section.
  useEffect(() => {
    const container = document.querySelector<HTMLElement>("[data-scroll-container]");
    if (!container) return;

    let busy = false;
    let accumulated = 0;
    let resetTimer: ReturnType<typeof setTimeout> | null = null;

    const onWheel = (e: WheelEvent) => {
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>("[data-section], [data-snap]")
      );
      if (sections.length === 0) return;

      e.preventDefault();
      if (busy) return;

      // Reset accumulator when the user pauses scrolling
      if (resetTimer) clearTimeout(resetTimer);
      resetTimer = setTimeout(() => { accumulated = 0; }, 200);

      accumulated += e.deltaY;

      if (Math.abs(accumulated) < window.innerHeight * 0.25) return;

      const containerRect = container.getBoundingClientRect();
      const scrollTop = container.scrollTop;
      const tops = sections.map(
        (s) => s.getBoundingClientRect().top - containerRect.top + scrollTop
      );

      let currentIdx = 0;
      let minDist = Infinity;
      tops.forEach((top, i) => {
        const dist = Math.abs(top - scrollTop);
        if (dist < minDist) { minDist = dist; currentIdx = i; }
      });

      const direction = accumulated > 0 ? 1 : -1;
      accumulated = 0;

      const nextIdx = Math.max(0, Math.min(sections.length - 1, currentIdx + direction));
      if (nextIdx === currentIdx) return;

      busy = true;
      container.scrollTo({ top: tops[nextIdx], behavior: "smooth" });
      setTimeout(() => { busy = false; }, 900);
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", onWheel);
      if (resetTimer) clearTimeout(resetTimer);
    };
  }, []);

  return null;
}
