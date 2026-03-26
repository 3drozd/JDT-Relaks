"use client";

import Image from "next/image";
import { siteConfig } from "@/config/site.config";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";

export function Hero() {
  return (
    <section className="relative overflow-hidden min-h-svh flex flex-col justify-center" data-section>
      <Image
        src="/images/hero-bg.png"
        alt=""
        fill
        className="object-cover object-[center_45%]"
        priority
      />
      <div className="absolute inset-0 bg-black/55" />

      {/* Ripple reveal — blurred duplicate image that fades away in a circle */}
      <div className="absolute inset-0 hero-blur-layer">
        <Image
          src="/images/hero-bg.png"
          alt=""
          fill
          className="object-cover object-[center_45%]"
        />
        <div className="absolute inset-0 bg-black/55" />
      </div>


      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[oklch(0.05_0.04_260)] to-transparent" />
      <div className="relative container mx-auto px-4 text-center">
        <AnimateOnScroll variant="fade-up" delay={200}>
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl">
            {siteConfig.name}
          </h1>
        </AnimateOnScroll>
        <AnimateOnScroll variant="fade-up" delay={400}>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80 md:text-xl">
            {siteConfig.description}
          </p>
        </AnimateOnScroll>
        <AnimateOnScroll variant="fade-up" delay={600}>
          <div className="mt-8">
            <a
              href="#wydarzenia"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById("wydarzenia")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="liquid-glass inline-block rounded-full px-8 py-3 text-lg font-semibold text-white transition-all duration-300 hover:scale-105"
            >
              Zobacz wydarzenia
            </a>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}
