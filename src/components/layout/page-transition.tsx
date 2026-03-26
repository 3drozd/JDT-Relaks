"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const prevPathname = useRef(pathname);

  useEffect(() => {
    // Only animate on navigation, not on first mount
    if (prevPathname.current === pathname) return;
    prevPathname.current = pathname;

    setVisible(false);

    // Double rAF ensures the browser paints opacity:0 before transitioning to 1
    const frame1 = requestAnimationFrame(() => {
      const frame2 = requestAnimationFrame(() => {
        setVisible(true);
      });
      return () => cancelAnimationFrame(frame2);
    });

    return () => cancelAnimationFrame(frame1);
  }, [pathname]);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(12px)",
        transition: visible
          ? "opacity 500ms ease-out, transform 500ms ease-out"
          : "none",
      }}
    >
      {children}
    </div>
  );
}
