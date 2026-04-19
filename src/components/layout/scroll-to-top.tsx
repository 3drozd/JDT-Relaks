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
  // events and programmatically scroll to the next/previous snap target.
  useEffect(() => {
    const container = document.querySelector<HTMLElement>("[data-scroll-container]");
    if (!container) return;

    let busy = false;

    const onWheel = (e: WheelEvent) => {
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>("[data-section], [data-snap]")
      );
      if (sections.length === 0) return;

      e.preventDefault();
      if (busy) return;

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

      const direction = e.deltaY > 0 ? 1 : -1;
      const nextIdx = Math.max(0, Math.min(sections.length - 1, currentIdx + direction));
      if (nextIdx === currentIdx) return;

      busy = true;
      container.scrollTo({ top: tops[nextIdx], behavior: "smooth" });
      setTimeout(() => { busy = false; }, 900);
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, []);

  return null;
}
