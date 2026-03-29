"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { TankDrumViewer } from "@/components/3d/tank-drum-viewer";
import { GlowCard } from "@/components/ui/glow-card";
import { queueAutoPlayNote } from "@/components/3d/tank-drum-scene";

const ShaderBackground = dynamic(() => import("@/components/ui/shader-background"), { ssr: false });

// ── Demo songs ───────────────────────────────────────────────────────
interface SongNote { note: string; gap: number }
interface Song { id: string; title: string; notes: SongNote[] }

const SONGS: Song[] = [
  {
    id: "twinkle",
    title: "Świeć, gwiazdeczko",
    notes: [
      {note:"C",gap:0},{note:"C",gap:450},{note:"G",gap:450},{note:"G",gap:450},
      {note:"A",gap:450},{note:"A",gap:450},{note:"G",gap:450},
      {note:"F",gap:900},{note:"F",gap:450},{note:"E",gap:450},{note:"E",gap:450},
      {note:"D",gap:450},{note:"D",gap:450},{note:"C",gap:450},
      {note:"G",gap:900},{note:"G",gap:450},{note:"F",gap:450},{note:"F",gap:450},
      {note:"E",gap:450},{note:"E",gap:450},{note:"D",gap:450},
      {note:"G",gap:900},{note:"G",gap:450},{note:"F",gap:450},{note:"F",gap:450},
      {note:"E",gap:450},{note:"E",gap:450},{note:"D",gap:450},
      {note:"C",gap:900},{note:"C",gap:450},{note:"G",gap:450},{note:"G",gap:450},
      {note:"A",gap:450},{note:"A",gap:450},{note:"G",gap:450},
      {note:"F",gap:900},{note:"F",gap:450},{note:"E",gap:450},{note:"E",gap:450},
      {note:"D",gap:450},{note:"D",gap:450},{note:"C",gap:450},
    ],
  },
  {
    id: "ode",
    title: "Oda do Radości",
    notes: [
      {note:"E",gap:0},{note:"E",gap:550},{note:"F",gap:550},{note:"G",gap:550},
      {note:"G",gap:550},{note:"F",gap:550},{note:"E",gap:550},{note:"D",gap:550},
      {note:"C",gap:550},{note:"C",gap:550},{note:"D",gap:550},{note:"E",gap:550},
      {note:"E",gap:550},{note:"D",gap:825},{note:"D",gap:275},
      {note:"E",gap:1100},{note:"E",gap:550},{note:"F",gap:550},{note:"G",gap:550},
      {note:"G",gap:550},{note:"F",gap:550},{note:"E",gap:550},{note:"D",gap:550},
      {note:"C",gap:550},{note:"C",gap:550},{note:"D",gap:550},{note:"E",gap:550},
      {note:"D",gap:550},{note:"C",gap:825},{note:"C",gap:275},
    ],
  },
  {
    id: "meditation",
    title: "Medytacja",
    notes: [
      {note:"C",gap:0},{note:"E",gap:900},{note:"G",gap:900},{note:"A",gap:900},
      {note:"G",gap:1400},{note:"E",gap:900},{note:"D",gap:900},{note:"C",gap:900},
      {note:"D",gap:1800},{note:"F",gap:900},{note:"G",gap:900},{note:"A",gap:900},
      {note:"G",gap:1400},{note:"F",gap:900},{note:"E",gap:900},{note:"D",gap:900},
      {note:"C",gap:1800},{note:"E",gap:900},{note:"G",gap:900},{note:"H",gap:900},
      {note:"A",gap:1400},{note:"G",gap:900},{note:"E",gap:900},{note:"C1",gap:900},
      {note:"A",gap:1800},{note:"G",gap:900},{note:"E",gap:900},{note:"D",gap:900},
      {note:"C",gap:1400},
    ],
  },
];

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

const detailInfo = [
  {
    title: "Materiał i konstrukcja",
    description:
      "Wykonany z wysokogatunkowej stali, formowany i strojony ręcznie. Grubość i kształt każdego języczka wpływa na ton i sustain dźwięku.",
  },
  {
    title: "Strojenie i skale",
    description:
      "Dostępne w różnych skalach muzycznych — pentatonicznej, durowej, molowej i wielu innych. Każdy instrument jest precyzyjnie strojony chromatycznym tunerem.",
  },
  {
    title: "Wzory artystyczne",
    description:
      "Na zamówienie wykonujemy unikalne wzory — geometryczne, organiczne, mandale i inne. Każdy drum staje się dziełem sztuki, które można dowolnie spersonalizować.",
  },
  {
    title: "Zastosowania",
    description:
      "Idealny do medytacji, muzykoterapii, relaksu, występów scenicznych i nauki muzyki. Używany przez terapeutów, muzyków i entuzjastów na całym świecie.",
  },
];

const galleryItems = [
  { type: "photo" as const, src: "/images/1 wzór artystyczny (górski krajobraz).jpg", label: "Wzór artystyczny — górski krajobraz" },
  { type: "photo" as const, src: "/images/2 wzór artystyczny (górski krajobraz) - widok z góry.jpg", label: "Wzór górski — widok z góry" },
  { type: "photo" as const, src: "/images/3 wzór artystyczny (koń).jpg", label: "Wzór artystyczny — koń" },
  { type: "photo" as const, src: "/images/4 wzory metaliczne.jpg", label: "Wzory metaliczne" },
  { type: "photo" as const, src: "/images/5 wzór metaliczny widok z góry.jpg", label: "Wzór metaliczny — widok z góry" },
  { type: "photo" as const, src: "/images/6 wzór artystyczny - mandala.jpg", label: "Wzór artystyczny — mandala" },
];

export function TankDrum() {
  const [playMode, setPlayMode] = useState(false);
  const [detailMode, setDetailMode] = useState(false);
  const [lastNote, setLastNote] = useState<string | null>(null);
  const [selectedSongId, setSelectedSongId] = useState<string>(SONGS[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const playbackTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const stopAutoPlay = useCallback(() => {
    playbackTimeoutsRef.current.forEach(clearTimeout);
    playbackTimeoutsRef.current = [];
    setIsPlaying(false);
  }, []);

const handleKeyClick = useCallback((note: string) => {
    setLastNote(note);
    setTimeout(() => setLastNote(null), 1200);
  }, []);

  const handleModelClick = useCallback(() => {
    if (isPlaying) {
      stopAutoPlay();
      return;
    }
    if (!playMode && !detailMode) setPlayMode(true);
  }, [playMode, detailMode, isPlaying, stopAutoPlay]);

  return (
    <section
      id="tank-drum"
      className="relative min-h-svh flex flex-col pt-20 pb-8 overflow-hidden bg-[oklch(0.05_0.04_260)] text-white"
      data-section
    >
      <ShaderBackground />
      <div
        className={`hidden md:block absolute inset-0 z-[1] pointer-events-none transition-opacity duration-700 ${
          playMode || detailMode ? "opacity-0" : "opacity-100"
        }`}
        style={{ background: "linear-gradient(to left, oklch(0.05 0.04 260) 0%, oklch(0.05 0.04 260) 35%, transparent 70%)" }}
      />

      {/* === Default view: title + model + features === */}
      <div
        className={`relative z-10 container mx-auto px-4 mb-0 transition-opacity duration-700 ${
          playMode || detailMode ? "opacity-0 pointer-events-none" : "opacity-100"
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

      <div
        className={`relative z-10 flex-1 grid grid-cols-1 md:grid-cols-2 items-start gap-0 transition-opacity duration-700 ${
          detailMode ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        {/* Model 3D */}
        <div
          className={`relative aspect-square transition-all duration-700 ease-in-out w-[125vw] -mx-[12.5vw] md:w-[160%] md:-ml-[30%] md:mx-0 md:-mt-4 ${
            playMode
              ? "translate-y-[15%] md:translate-y-0 md:translate-x-[30%]"
              : "mt-4 translate-y-0 md:mt-0 md:translate-x-0"
          }`}
          onTouchStart={playMode ? (e) => e.stopPropagation() : undefined}
          onTouchMove={playMode ? (e) => e.stopPropagation() : undefined}
        >
          <TankDrumViewer onKeyClick={handleKeyClick} onModelClick={handleModelClick} playMode={playMode} />

          {playMode && lastNote && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
              <span className="text-3xl font-bold text-[#D4A843] animate-pulse">
                {lastNote}
              </span>
            </div>
          )}

          {/* Song selector — under model */}
          <div className={`absolute -bottom-16 left-1/2 -translate-x-1/2 z-10 flex gap-2.5 flex-wrap justify-center transition-opacity duration-500 w-full px-4 md:hidden ${playMode ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            {SONGS.map(song => {
              const isThisPlaying = isPlaying && selectedSongId === song.id;
              return (
                <button
                  key={song.id}
                  onClick={() => {
                    if (isThisPlaying) {
                      stopAutoPlay();
                    } else {
                      setSelectedSongId(song.id);
                      stopAutoPlay();
                      playbackTimeoutsRef.current = [];
                      setIsPlaying(true);
                      let cumulative = 0;
                      const timeouts: ReturnType<typeof setTimeout>[] = [];
                      for (const { note, gap } of song.notes) {
                        cumulative += gap;
                        timeouts.push(setTimeout(() => queueAutoPlayNote(note), cumulative));
                      }
                      timeouts.push(setTimeout(() => setIsPlaying(false), cumulative + 1000));
                      playbackTimeoutsRef.current = timeouts;
                    }
                  }}
                  className={`px-5 py-2 rounded-full text-base backdrop-blur-sm transition-all duration-300 ${
                    isThisPlaying
                      ? "bg-[#D4A843]/20 border border-[#D4A843] text-[#D4A843]"
                      : selectedSongId === song.id && !isPlaying
                      ? "bg-[#D4A843]/10 border border-[#D4A843]/60 text-[#D4A843]/80"
                      : "border border-white/20 text-white/50 hover:text-white/80 hover:border-white/40"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    {isThisPlaying ? (
                      <svg width="11" height="11" viewBox="0 0 10 10" fill="currentColor"><rect width="10" height="10" rx="1"/></svg>
                    ) : (
                      <svg width="11" height="11" viewBox="0 0 10 10" fill="currentColor"><polygon points="1,0 10,5 1,10"/></svg>
                    )}
                    {song.title}
                  </span>
                </button>
              );
            })}
          </div>
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
                  <svg width="40" height="40" viewBox="0 0 40 40" className="shrink-0 mt-0.5">
                    <circle cx="20" cy="20" r="18" fill="none" stroke="#D4A843" strokeWidth="1.5" />
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
              <button
                onClick={() => {
                  setDetailMode(true);
                  const container = document.querySelector("[data-scroll-container]");
                  const section = document.getElementById("tank-drum");
                  if (container && section) {
                    container.scrollTo({ top: section.offsetTop, behavior: "smooth" });
                  }
                  const detail = document.querySelector("[data-detail-view]");
                  if (detail) detail.scrollTop = 0;
                }}
                className="inline-block px-8 py-3 rounded-full border border-[#D4A843] text-[#D4A843] font-medium tracking-wide hover:bg-[#D4A843] hover:text-[#0f1218] transition-colors duration-300"
              >
                Dowiedz się więcej
              </button>
            </div>
          </AnimateOnScroll>
        </div>
      </div>

      {/* === Detail view === */}
      <div
        data-detail-view
        className={`absolute inset-0 z-20 pt-20 pb-8 overflow-y-auto scrollbar-none transition-opacity duration-700 ${
          detailMode ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="container mx-auto px-4">
          <p className="text-sm font-medium tracking-widest uppercase text-[#D4A843] text-center mb-4">
            Szczegóły
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Tank Drum <span className="text-[#D4A843]">JDT</span> — bliżej
          </h2>

          {/* Detail info grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto mb-16">
            {detailInfo.map((item) => (
              <GlowCard key={item.title}>
                <h3 className="font-semibold text-lg text-[#D4A843] mb-2">{item.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{item.description}</p>
              </GlowCard>
            ))}
          </div>

          {/* Gallery */}
          <h3 className="text-2xl font-bold text-center mb-8">Galeria</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12">
            {galleryItems.map((item, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden border border-white/10 relative group">
                <img
                  src={item.src}
                  alt={item.label}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end">
                  <span className="w-full text-xs text-white/0 group-hover:text-white/80 transition-colors duration-300 text-center pb-3 px-2">
                    {item.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 mb-12">
            <p className="text-white/40 text-sm mb-3">Zrealizowane zamówienia</p>
            <a
              href="https://www.facebook.com/tankdrumJDT"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#D4A843] hover:text-[#D4A843]/80 transition-colors duration-300 text-sm font-medium"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              facebook.com/tankdrumJDT
            </a>
          </div>

          <div className="text-center pb-32">
            <button
              onClick={() => {
                setDetailMode(false);
                document.getElementById("tank-drum")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-block px-8 py-3 rounded-full border border-white/20 text-white/60 font-medium tracking-wide hover:bg-white/10 hover:text-white transition-colors duration-300"
            >
              ← Wróć
            </button>
          </div>
        </div>
      </div>

      {/* Play mode controls — absolute within section so they scroll away with it */}
      <div className={`absolute bottom-16 inset-x-0 z-50 flex flex-col items-center gap-8 px-4 transition-opacity duration-500 ${playMode ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        {/* Song selector — desktop only (mobile is placed under model) */}
        <div className="hidden md:flex gap-2 flex-wrap justify-center">
          {SONGS.map(song => {
            const isThisPlaying = isPlaying && selectedSongId === song.id;
            return (
              <button
                key={song.id}
                onClick={() => {
                  if (isThisPlaying) {
                    stopAutoPlay();
                  } else {
                    setSelectedSongId(song.id);
                    stopAutoPlay();
                    playbackTimeoutsRef.current = [];
                    setIsPlaying(true);
                    let cumulative = 0;
                    const timeouts: ReturnType<typeof setTimeout>[] = [];
                    for (const { note, gap } of song.notes) {
                      cumulative += gap;
                      timeouts.push(setTimeout(() => queueAutoPlayNote(note), cumulative));
                    }
                    timeouts.push(setTimeout(() => setIsPlaying(false), cumulative + 1000));
                    playbackTimeoutsRef.current = timeouts;
                  }
                }}
                className={`px-5 py-2 rounded-full text-base backdrop-blur-sm transition-all duration-300 ${
                  isThisPlaying
                    ? "bg-[#D4A843]/20 border border-[#D4A843] text-[#D4A843]"
                    : selectedSongId === song.id && !isPlaying
                    ? "bg-[#D4A843]/10 border border-[#D4A843]/60 text-[#D4A843]/80"
                    : "border border-white/20 text-white/50 hover:text-white/80 hover:border-white/40"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  {isThisPlaying ? (
                    <svg width="11" height="11" viewBox="0 0 10 10" fill="currentColor"><rect width="10" height="10" rx="1"/></svg>
                  ) : (
                    <svg width="11" height="11" viewBox="0 0 10 10" fill="currentColor"><polygon points="1,0 10,5 1,10"/></svg>
                  )}
                  {song.title}
                </span>
              </button>
            );
          })}
        </div>

        {/* Back buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              stopAutoPlay();
              setDetailMode(true);
              setPlayMode(false);
              const container = document.querySelector("[data-scroll-container]");
              const section = document.getElementById("tank-drum");
              if (container && section) container.scrollTo({ top: section.offsetTop, behavior: "smooth" });
              const detail = document.querySelector("[data-detail-view]");
              if (detail) detail.scrollTop = 0;
            }}
            className="px-7 py-2.5 rounded-full border border-[#D4A843]/60 text-[#D4A843] font-medium backdrop-blur-sm hover:bg-[#D4A843]/15 transition-all duration-300"
          >
            Dowiedz się więcej
          </button>
          <button
            onClick={() => { stopAutoPlay(); setPlayMode(false); }}
            className="px-7 py-2.5 rounded-full bg-white/5 border border-white/30 text-white font-medium backdrop-blur-sm hover:bg-white/15 transition-all duration-300"
          >
            ← Wróć
          </button>
        </div>
      </div>
    </section>
  );
}
