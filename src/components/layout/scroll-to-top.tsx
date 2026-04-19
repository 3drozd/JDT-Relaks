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

  // JS-based snap replaces CSS scroll-snap-type to avoid Chromium bug where
  // mandatory snap ignores wheel events after snapping without cursor movement.
  // After scrolling stops (150ms debounce), snaps to the nearest section.
  useEffect(() => {
    const container = document.querySelector<HTMLElement>("[data-scroll-container]");
    if (!container) return;

    let snapTimer: ReturnType<typeof setTimeout> | null = null;
    let isSnapping = false;

    const snap = () => {
      const sections = Array.from(
        document.querySelectorAll<HTMLElement>("[data-section], [data-snap]")
      );
      if (sections.length === 0) return;

      const containerRect = container.getBoundingClientRect();
      const scrollTop = container.scrollTop;
      const tops = sections.map(
        (s) => s.getBoundingClientRect().top - containerRect.top + scrollTop
      );

      let nearestIdx = 0;
      let minDist = Infinity;
      tops.forEach((top, i) => {
        const dist = Math.abs(top - scrollTop);
        if (dist < minDist) { minDist = dist; nearestIdx = i; }
      });

      const target = tops[nearestIdx];
      if (Math.abs(target - scrollTop) > 2) {
        isSnapping = true;
        container.scrollTo({ top: target, behavior: "smooth" });
        setTimeout(() => { isSnapping = false; }, 800);
      }
    };

    const onScroll = () => {
      if (isSnapping) return;
      if (snapTimer) clearTimeout(snapTimer);
      snapTimer = setTimeout(snap, 150);
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", onScroll);
      if (snapTimer) clearTimeout(snapTimer);
    };
  }, []);

  return null;
}
