import Image from "next/image";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site.config";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-24 md:py-40">
      <Image
        src="/images/hero-bg.png"
        alt=""
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[oklch(0.97_0.005_85)] to-transparent" />
      <div className="relative container mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white md:text-6xl">
          {siteConfig.name}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80 md:text-xl">
          {siteConfig.description}
        </p>
        <div className="mt-8">
          <Button asChild size="lg" className="text-lg px-8">
            <a href="#wydarzenia">Zobacz wydarzenia</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
