"use client";

import { Music, Heart, Leaf } from "lucide-react";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";

const features = [
  {
    icon: Music,
    title: "Żywe brzmienie",
    description:
      "Koncerty na żywo z użyciem instrumentów relaksacyjnych.",
  },
  {
    icon: Heart,
    title: "Głęboki relaks",
    description:
      "Niskie częstotliwości obniżają stres i wyciszają umysł.",
  },
  {
    icon: Leaf,
    title: "Chwila dla siebie",
    description:
      "Czas na oddech, wyciszenie i regenerację w kameralnej atmosferze.",
  },
];

export function AboutConcerts() {
  return (
    <section className="relative min-h-svh flex flex-col justify-center py-16 bg-[oklch(0.05_0.04_260)] text-primary-foreground overflow-hidden" data-section>
      <div className="aurora-bg" aria-hidden="true" />
      <div className="aurora-vignette" aria-hidden="true" />
      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center mb-12">
            {/* Left — text */}
            <AnimateOnScroll variant="fade-right">
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold mb-4">
                  Koncerty, które czujesz
                </h2>
                <p className="text-lg text-primary-foreground/70 leading-relaxed">
                  To nie zwykły koncert. To doświadczenie, które pozwala Ci się
                  zatrzymać, odetchnąć i poczuć harmonię dźwięku. Każde spotkanie
                  to chwila tylko dla Ciebie — bez pośpiechu, bez hałasu, bez
                  oczekiwań.
                </p>
              </div>
            </AnimateOnScroll>

            {/* Right — video + button */}
            <AnimateOnScroll variant="fade-left" delay={200}>
              <div className="flex flex-col items-center gap-6">
                {/* Video placeholder */}
                <div className="w-full aspect-video rounded-2xl bg-primary-foreground/5 border border-primary-foreground/10 flex items-center justify-center">
                  <span className="text-sm text-primary-foreground/30">Video</span>
                </div>
              </div>
            </AnimateOnScroll>
          </div>

          <div className="grid grid-cols-3 gap-4 md:gap-8">
            {features.map((feature, index) => (
              <AnimateOnScroll
                key={feature.title}
                variant="fade-up"
                delay={index * 150}
              >
                <div className="text-center md:text-left space-y-2">
                  <div className="mx-auto md:mx-0 w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-sm md:text-base">{feature.title}</h3>
                  <p className="text-xs md:text-sm text-primary-foreground/70 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
