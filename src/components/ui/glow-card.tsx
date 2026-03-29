"use client";

import React, { useEffect, useRef, ReactNode } from "react";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
}

const glowStyles = `
  [data-glow]::before,
  [data-glow]::after {
    pointer-events: none;
    content: "";
    position: absolute;
    inset: calc(var(--border-size) * -1);
    border: var(--border-size) solid transparent;
    border-radius: calc(var(--radius) * 1px);
    background-attachment: fixed;
    background-size: calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)));
    background-repeat: no-repeat;
    background-position: 50% 50%;
    mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
    mask-clip: padding-box, border-box;
    mask-composite: intersect;
  }

  [data-glow]::before {
    background-image: radial-gradient(
      calc(var(--spotlight-size) * 0.75) calc(var(--spotlight-size) * 0.75) at
      calc(var(--x, 0) * 1px)
      calc(var(--y, 0) * 1px),
      hsl(45 80% 60% / 0.4), transparent 100%
    );
    filter: brightness(1.2);
  }

  [data-glow]::after {
    background-image: radial-gradient(
      calc(var(--spotlight-size) * 0.5) calc(var(--spotlight-size) * 0.5) at
      calc(var(--x, 0) * 1px)
      calc(var(--y, 0) * 1px),
      hsl(0 0% 100% / 0.3), transparent 100%
    );
  }

  [data-glow] [data-glow] {
    position: absolute;
    inset: 0;
    will-change: filter;
    opacity: var(--outer, 1);
    border-radius: calc(var(--radius) * 1px);
    border-width: calc(var(--border-size) * 20);
    filter: blur(calc(var(--border-size) * 10));
    background: none;
    pointer-events: none;
    border: none;
  }

  [data-glow] > [data-glow]::before {
    inset: -10px;
    border-width: 10px;
  }
`;

let stylesInjected = false;

export function GlowCard({ children, className = "" }: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!stylesInjected) {
      const style = document.createElement("style");
      style.textContent = glowStyles;
      document.head.appendChild(style);
      stylesInjected = true;
    }

    const syncPointer = (e: PointerEvent) => {
      if (cardRef.current) {
        cardRef.current.style.setProperty("--x", e.clientX.toFixed(2));
        cardRef.current.style.setProperty("--xp", (e.clientX / window.innerWidth).toFixed(2));
        cardRef.current.style.setProperty("--y", e.clientY.toFixed(2));
        cardRef.current.style.setProperty("--yp", (e.clientY / window.innerHeight).toFixed(2));
      }
    };

    document.addEventListener("pointermove", syncPointer);
    return () => document.removeEventListener("pointermove", syncPointer);
  }, []);

  return (
    <div
      ref={cardRef}
      data-glow
      className={`relative p-6 ${className}`}
      style={{
        "--radius": "16",
        "--border": "1.5",
        "--backdrop": "oklch(0.08 0.03 260 / 0.85)",
        "--backup-border": "rgba(212, 168, 67, 0.15)",
        "--size": "250",
        "--outer": "1",
        "--border-size": "calc(var(--border, 2) * 1px)",
        "--spotlight-size": "calc(var(--size, 150) * 1px)",
        backgroundColor: "var(--backdrop, transparent)",
        backgroundImage: `radial-gradient(
          var(--spotlight-size) var(--spotlight-size) at
          calc(var(--x, 0) * 1px)
          calc(var(--y, 0) * 1px),
          hsl(45 80% 60% / 0.06), transparent
        )`,
        backgroundSize: "calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))",
        backgroundPosition: "50% 50%",
        backgroundAttachment: "fixed",
        border: "var(--border-size) solid var(--backup-border)",
        touchAction: "none",
        borderRadius: "calc(var(--radius) * 1px)",
      } as React.CSSProperties}
    >
      <div ref={innerRef} data-glow />
      {children}
    </div>
  );
}
