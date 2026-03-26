"use client";

import { useInView } from "@/hooks/use-in-view";

type Variant = "fade-up" | "fade-in" | "fade-left" | "fade-right";

interface AnimateOnScrollProps {
  children: React.ReactNode;
  variant?: Variant;
  delay?: number;
  duration?: number;
  className?: string;
}

const transforms: Record<Variant, string> = {
  "fade-up": "translateY(24px)",
  "fade-in": "none",
  "fade-left": "translateX(-24px)",
  "fade-right": "translateX(24px)",
};

export function AnimateOnScroll({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 700,
  className,
}: AnimateOnScrollProps) {
  const { ref, isInView } = useInView({ threshold: 0.1, once: true });

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? "none" : transforms[variant],
        transition: `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
