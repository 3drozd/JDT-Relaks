"use client";

import { useRef, useEffect, useState } from "react";
import { Music, Heart, Leaf } from "lucide-react";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { useLanguage } from "@/contexts/language-context";

const VIDEO_DESKTOP = "/videos/concerts-desktop.mp4";
const VIDEO_MOBILE  = "/videos/concerts-mobile.mp4";

const icons = [Music, Heart, Leaf];

export function AboutConcerts() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-svh flex flex-col justify-center py-16 bg-[oklch(0.05_0.04_260)] text-primary-foreground overflow-hidden" data-section>

      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-60"
        src={isMobile ? VIDEO_MOBILE : VIDEO_DESKTOP}
      />
      <div className="aurora-vignette" aria-hidden="true" />

      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center mb-12">
            <AnimateOnScroll variant="fade-right">
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold mb-4">{t.concerts.heading}</h2>
                <p className="text-lg text-primary-foreground/70 leading-relaxed">{t.concerts.body}</p>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll variant="fade-left" delay={200}>
              <div className="flex flex-col items-center gap-6">
                <div className="w-full aspect-video rounded-2xl bg-primary-foreground/5 border border-primary-foreground/10 flex items-center justify-center">
                  <span className="text-sm text-primary-foreground/30">Video</span>
                </div>
              </div>
            </AnimateOnScroll>
          </div>

          <div className="grid grid-cols-3 gap-4 md:gap-8">
            {t.concerts.features.map((feature, index) => {
              const Icon = icons[index];
              return (
                <AnimateOnScroll key={feature.title} variant="fade-up" delay={index * 150}>
                  <div className="text-center md:text-left space-y-2">
                    <div className="mx-auto md:mx-0 w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <h3 className="font-semibold text-sm md:text-base">{feature.title}</h3>
                    <p className="text-xs md:text-sm text-primary-foreground/70 leading-relaxed">{feature.description}</p>
                  </div>
                </AnimateOnScroll>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
