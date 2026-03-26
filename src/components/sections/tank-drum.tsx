"use client";

import { useState, useCallback } from "react";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { TankDrumViewer } from "@/components/3d/tank-drum-viewer";

const features = [
  {
    title: "Ręczna produkcja",
    description:
      "Każdy instrument jest ręcznie strojony i wykańczany z dbałością o każdy detal.",
  },
  {
    title: "Relaksacyjny dźwięk",
    description:
      "Ciepłe, rezonujące tony pomagają się wyciszyć i odprężyć po ciężkim dniu.",
  },
  {
    title: "Dla każdego",
    description:
      "Nie wymaga doświadczenia muzycznego — wystarczy dotknąć, żeby zagrać.",
  },
];

export function TankDrum() {
  const [playMode, setPlayMode] = useState(false);
  const [lastNote, setLastNote] = useState<string | null>(null);

  const handleKeyClick = useCallback((note: string) => {
    setLastNote(note);
    if (!playMode) setPlayMode(true);
    // Clear note display after a moment
    setTimeout(() => setLastNote(null), 1200);
  }, [playMode]);

  return (
    <section
      id="tank-drum"
      className="min-h-svh flex flex-col pt-20 pb-8 overflow-hidden bg-[oklch(0.05_0.04_260)] text-white"
      data-section
    >
      {/* Tytuł — na górze, wycentrowany */}
      <div
        className={`container mx-auto px-4 mb-0 transition-opacity duration-700 ${
          playMode ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <AnimateOnScroll variant="fade-up">
          <p className="text-sm font-medium tracking-widest uppercase text-[#D4A843] text-center mb-4">
            Instrument premium
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-center">
            Poznaj Tank Drum <span className="text-[#D4A843]">JDT</span>
          </h2>
        </AnimateOnScroll>
      </div>

      {/* Model 3D + info */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 items-start gap-0">
        {/* Model 3D */}
        <div
          className={`relative aspect-square w-full md:-ml-[30%] md:w-[160%] mt-12 md:-mt-4 transition-all duration-700 ease-in-out ${
            playMode ? "scale-125 md:scale-100 md:translate-x-[30%]" : "scale-100 translate-x-0"
          }`}
        >

          {/* Hint — below model on mobile, above on desktop */}
          <div
            className={`absolute left-0 w-full z-10 text-center transition-opacity duration-500 -bottom-6 md:bottom-auto md:top-0 md:left-[19%] md:w-[62%] ${
              playMode ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            <span className="inline-flex items-center gap-2 text-base text-white/50 tracking-wide font-medium">
              Kliknij na Tank Drum aby zagrać
            </span>
          </div>

          <TankDrumViewer onKeyClick={handleKeyClick} playMode={playMode} />

          {/* Note display in play mode */}
          {playMode && lastNote && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
              <span className="text-3xl font-bold text-[#D4A843] animate-pulse">
                {lastNote}
              </span>
            </div>
          )}
        </div>

        {/* Info — fades in play mode */}
        <div
          className={`px-6 md:px-12 py-8 md:py-0 md:self-center transition-opacity duration-700 ${
            playMode ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
        >
          <div className="space-y-8 max-w-md">
            {features.map((feature, index) => (
              <AnimateOnScroll
                key={feature.title}
                variant="fade-left"
                delay={index * 150}
              >
                <div className="flex gap-4 items-start">
                  {/* Tank drum icon — circle with rectangular tongues in 8-point star */}
                  <svg width="40" height="40" viewBox="0 0 40 40" className="shrink-0 mt-0.5">
                    <circle cx="20" cy="20" r="18" fill="none" stroke="#D4A843" strokeWidth="1.5" />
                    {/* 8 rectangular tongues — alternating large/small */}
                    <rect x="18" y="5" width="4" height="10" rx="1" fill="#D4A843" opacity="0.7" />
                    <rect x="18.5" y="6" width="3.5" height="8.5" rx="1" fill="#D4A843" opacity="0.5" transform="rotate(45 20 20)" />
                    <rect x="18" y="5" width="4" height="10" rx="1" fill="#D4A843" opacity="0.7" transform="rotate(90 20 20)" />
                    <rect x="18.5" y="6" width="3.5" height="8.5" rx="1" fill="#D4A843" opacity="0.5" transform="rotate(135 20 20)" />
                    <rect x="18" y="5" width="4" height="10" rx="1" fill="#D4A843" opacity="0.7" transform="rotate(180 20 20)" />
                    <rect x="18.5" y="6" width="3.5" height="8.5" rx="1" fill="#D4A843" opacity="0.5" transform="rotate(225 20 20)" />
                    <rect x="18" y="5" width="4" height="10" rx="1" fill="#D4A843" opacity="0.7" transform="rotate(270 20 20)" />
                    <rect x="18.5" y="6" width="3.5" height="8.5" rx="1" fill="#D4A843" opacity="0.5" transform="rotate(315 20 20)" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-lg">{feature.title}</h3>
                    <p className="text-sm" style={{ opacity: 0.6 }}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>

          <AnimateOnScroll variant="fade-up" delay={500}>
            <div className="mt-10 text-center">
              <a
                href="#kontakt"
                className="inline-block px-8 py-3 rounded-full border border-[#D4A843] text-[#D4A843] font-medium tracking-wide hover:bg-[#D4A843] hover:text-[#0f1218] transition-colors duration-300"
              >
                Zapytaj o Tank Drum
              </a>
            </div>
          </AnimateOnScroll>
        </div>
      </div>

      {/* Back button in play mode */}
      {playMode && (
        <button
          onClick={() => setPlayMode(false)}
          className="fixed bottom-8 right-8 z-50 px-6 py-2 rounded-full border border-white/20 text-white/60 text-sm backdrop-blur-sm hover:bg-white/10 hover:text-white transition-all duration-300"
        >
          ← Wróć
        </button>
      )}
    </section>
  );
}
