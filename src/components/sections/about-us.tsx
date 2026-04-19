"use client";

import Image from "next/image";
import { useLanguage } from "@/contexts/language-context";

export function AboutUs() {
  const { t } = useLanguage();
  return (
    <section id="o-nas" className="border-t bg-muted/50" data-snap>
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-2">{t.about.heading}</h2>
        <p className="text-center text-muted-foreground text-sm mb-12">{t.about.subtitle}</p>

        <div className="max-w-3xl mx-auto mb-14 space-y-4 text-muted-foreground text-sm leading-relaxed">
          <p>{t.about.p1}</p>
          <p>{t.about.p2}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-16">
          {[
            "/images/1772894121850.jpg",
            "/images/1772894121935.jpeg",
            "/images/1772906797440.jpg",
            "/images/1772909471977 (1).jpeg",
          ].map((src, i) => (
            <div key={i} className="aspect-square rounded-xl overflow-hidden border border-border relative">
              <Image src={src} alt={t.about.photo(i)} fill className="object-cover" />
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-10 items-start">
          <div className="w-full md:w-64 shrink-0 aspect-[3/4] rounded-2xl overflow-hidden border border-border relative">
            <Image src="/images/Justyna I Jarek.jpeg" alt={t.about.subtitle} fill className="object-cover" />
          </div>
          <div className="flex flex-col gap-10 flex-1">
            <div>
              <h3 className="text-xl font-semibold mb-3">Jarosław</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t.about.jarek}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">Justyna</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t.about.justyna}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
