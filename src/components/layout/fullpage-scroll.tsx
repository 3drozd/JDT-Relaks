"use client";

import { useEffect, useRef, useCallback } from "react";

const COOLDOWN = 800;

export function FullpageScroll() {
  const isAnimating = useRef(false);
  const accDelta = useRef(0);
  const lastWheelTime = useRef(0);
  const lastDirection = useRef(0);
  const touchStartY = useRef(0);

  const getSections = useCallback(() => {
    return Array.from(document.querySelectorAll<HTMLElement>("[data-section]"));
  }, []);

  const getCurrentIndex = useCallback(() => {
    const sections = getSections();
    const scrollY = window.scrollY + window.innerHeight / 3;
    for (let i = sections.length - 1; i >= 0; i--) {
      if (scrollY >= sections[i].offsetTop) return i;
    }
    return 0;
  }, [getSections]);

  const isNextSectionVisible = useCallback(
    (direction: number) => {
      const sections = getSections();
      const current = getCurrentIndex();
      const nextIndex = current + direction;
      if (nextIndex < 0 || nextIndex >= sections.length) return false;

      const next = sections[nextIndex];
      const viewportTop = window.scrollY;
      const viewportBottom = viewportTop + window.innerHeight;

      if (direction > 0) {
        // Scrolling down: next section top is visible
        return next.offsetTop < viewportBottom;
      } else {
        // Scrolling up: previous section bottom is visible
        return next.offsetTop + next.offsetHeight > viewportTop;
      }
    },
    [getSections, getCurrentIndex]
  );

  const scrollToSection = useCallback(
    (index: number) => {
      const sections = getSections();
      if (index < 0 || index >= sections.length) return;
      isAnimating.current = true;
      accDelta.current = 0;
      sections[index].scrollIntoView({ behavior: "smooth" });
      setTimeout(() => {
        isAnimating.current = false;
      }, COOLDOWN);
    },
    [getSections]
  );

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const now = Date.now();

      if (isAnimating.current) {
        e.preventDefault();
        return;
      }

      const direction = e.deltaY > 0 ? 1 : -1;

      // Reset accumulator on direction change or after 200ms gap (new gesture)
      if (direction !== lastDirection.current || now - lastWheelTime.current > 200) {
        accDelta.current = 0;
      }
      lastDirection.current = direction;
      lastWheelTime.current = now;
      accDelta.current += Math.abs(e.deltaY);

      // Require accumulated delta > 80 to trigger snap (filters momentum)
      if (accDelta.current < 80) return;

      const current = getCurrentIndex();
      const next = current + direction;
      const sections = getSections();

      if (next >= 0 && next < sections.length && isNextSectionVisible(direction)) {
        e.preventDefault();
        scrollToSection(next);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (isAnimating.current) return;
      const diff = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(diff) < 40) return;
      const direction = diff > 0 ? 1 : -1;
      const current = getCurrentIndex();

      if (isNextSectionVisible(direction)) {
        scrollToSection(current + direction);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (isAnimating.current) return;
      let direction = 0;
      if (e.key === "ArrowDown" || e.key === "PageDown") direction = 1;
      if (e.key === "ArrowUp" || e.key === "PageUp") direction = -1;
      if (direction !== 0 && isNextSectionVisible(direction)) {
        e.preventDefault();
        scrollToSection(getCurrentIndex() + direction);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [getCurrentIndex, getSections, scrollToSection, isNextSectionVisible]);

  return null;
}
