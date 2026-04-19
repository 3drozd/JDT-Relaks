"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import { GlowCard } from "@/components/ui/glow-card";
import { queueAutoPlayNote } from "@/components/3d/auto-play-queue";
import { useLanguage } from "@/contexts/language-context";

const TankDrumViewer = dynamic(
  () => import("@/components/3d/tank-drum-viewer").then((m) => ({ default: m.TankDrumViewer })),
  { ssr: false, loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <p className="text-muted-foreground text-sm animate-pulse">Ładowanie modelu 3D...</p>
    </div>
  )}
);

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => { setMobile(window.innerWidth < 768); }, []);
  return mobile;
}

const SCALE = ["C", "D", "E", "F", "G", "A", "H", "C1"];
const NOTE_GAP_S = 1.25;

// ── Demo songs ───────────────────────────────────────────────────────
interface SongNote { note: string; gap: number }
interface Song { id: string; title: string; notes: SongNote[] }

const SONG_NOTES: Omit<Song, "title">[] = [
  {
    id: "twinkle",
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

const gallerySrcs = [
  "/images/1 wzór artystyczny (górski krajobraz).jpg",
  "/images/2 wzór artystyczny (górski krajobraz) - widok z góry.jpg",
  "/images/3 wzór artystyczny (koń).jpg",
  "/images/4 wzory metaliczne.jpg",
  "/images/5 wzór metaliczny widok z góry.jpg",
  "/images/6 wzór artystyczny - mandala.jpg",
];

export function TankDrum() {
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  const td = t.drum;
  const SONGS: Song[] = SONG_NOTES.map((s, i) => ({ ...s, title: td.songs[i] }));
  const sectionRef = useRef<HTMLElement>(null);
  const desktopVideoRef = useRef<HTMLVideoElement>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);
  const isVideoPlayingRef = useRef(false);
  const lastNoteIdxRef = useRef(-1);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [videoOpacity, setVideoOpacity] = useState(0);

  const [loadedFull, setLoadedFull] = useState(false);
  const [playMode, setPlayMode] = useState(false);
  const [detailMode, setDetailMode] = useState(false);
  const [lastNote, setLastNote] = useState<string | null>(null);
  const [selectedSongId, setSelectedSongId] = useState<string>(SONGS[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const playbackTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const playNote = useCallback((note: string) => {
    try {
      const audio = new Audio(`/sounds/${note}_key.mp3`);
      audio.volume = 0.7;
      audio.play().catch(() => {});
    } catch {}
  }, []);

  const startPlayback = useCallback(() => {
    if (isVideoPlayingRef.current) return;
    if (stopTimerRef.current) { clearTimeout(stopTimerRef.current); stopTimerRef.current = null; }
    isVideoPlayingRef.current = true;
    lastNoteIdxRef.current = -1;
    desktopVideoRef.current?.play().catch(() => {});
    mobileVideoRef.current?.play().catch(() => {});
    setVideoOpacity(1);
  }, []);

  const stopPlayback = useCallback(() => {
    if (!isVideoPlayingRef.current) return;
    isVideoPlayingRef.current = false;
    setVideoOpacity(0);
    stopTimerRef.current = setTimeout(() => {
      desktopVideoRef.current?.pause();
      mobileVideoRef.current?.pause();
      if (desktopVideoRef.current) desktopVideoRef.current.currentTime = 0;
      if (mobileVideoRef.current) mobileVideoRef.current.currentTime = 0;
      lastNoteIdxRef.current = -1;
    }, 500);
  }, []);

  const handleTimeUpdate = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    if (!isVideoPlayingRef.current) return;
    const t = e.currentTarget.currentTime;
    const idx = Math.floor(t / NOTE_GAP_S) % SCALE.length;
    if (idx !== lastNoteIdxRef.current) {
      lastNoteIdxRef.current = idx;
      playNote(SCALE[idx]);
    }
  }, [playNote]);

  const handleEnded = useCallback(() => {
    if (!isVideoPlayingRef.current) return;
    setVideoOpacity(0.2);
    setTimeout(() => {
      if (!isVideoPlayingRef.current) return;
      if (desktopVideoRef.current) desktopVideoRef.current.currentTime = 0;
      if (mobileVideoRef.current) mobileVideoRef.current.currentTime = 0;
      lastNoteIdxRef.current = -1;
      desktopVideoRef.current?.play().catch(() => {});
      mobileVideoRef.current?.play().catch(() => {});
      setVideoOpacity(1);
    }, 200);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) {
        stopPlayback();
      } else {
        startPlayback();
      }
    }, { threshold: 0.3 });
    observer.observe(section);
    return () => { observer.disconnect(); stopPlayback(); };
  }, [startPlayback, stopPlayback]);


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
    if (isPlaying) { stopAutoPlay(); return; }
  }, [isPlaying, stopAutoPlay]);

  return (
    <section
      ref={sectionRef}
      id="tank-drum"
      className="relative min-h-svh flex flex-col pt-20 pb-8 overflow-x-hidden overflow-y-auto md:overflow-hidden bg-[oklch(0.05_0.04_260)] text-white"
      data-section
      onMouseEnter={() => { if (window.innerWidth >= 768) startPlayback(); }}
      onMouseLeave={() => { if (window.innerWidth >= 768) stopPlayback(); }}
    >
      {/* Desktop video — absolute background */}
      <video
        ref={desktopVideoRef}
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-contain z-0 pointer-events-none transition-opacity duration-200 hidden md:block"
        style={{ opacity: playMode || detailMode ? 0 : videoOpacity }}
        src="/videos/tank-drum-desktop.mp4"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      {/* Title — desktop only */}
      <div
        className={`relative z-10 container mx-auto px-4 mb-0 transition-opacity duration-700 ${
          playMode || detailMode ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <p className="text-sm font-medium tracking-widest uppercase text-[#D4A843] text-center mb-4">
          {td.label}
        </p>
        <h2 className="text-4xl md:text-5xl font-bold text-center">
          {td.heading} <span className="text-[#D4A843]">JDT</span>
        </h2>
      </div>

      {/* Mobile video — in flow, above features */}
      <video
        ref={mobileVideoRef}
        muted
        playsInline
        className={`block md:hidden w-full aspect-square object-contain pointer-events-none transition-opacity duration-200 relative z-10 ${
          playMode || detailMode ? "hidden" : ""
        }`}
        style={{ opacity: videoOpacity }}
        src="/videos/tank-drum-mobile.mp4"
      />

      <div
        className={`relative z-10 md:flex-1 grid grid-cols-1 md:grid-cols-2 items-start gap-0 transition-opacity duration-700 ${
          detailMode ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        {/* Left column: 3D model in play mode only */}
        <div
          className={`relative aspect-square transition-all duration-700 ease-in-out md:w-[160%] md:-ml-[30%] md:mx-0 md:-mt-4 ${
            playMode
              ? "w-full translate-y-[15%] md:translate-y-0 md:translate-x-[30%]"
              : "hidden md:block pointer-events-none"
          }`}
          onTouchStart={playMode ? (e) => e.stopPropagation() : undefined}
          onTouchMove={playMode ? (e) => e.stopPropagation() : undefined}
        >
          {playMode && loadedFull && (
            <TankDrumViewer onKeyClick={handleKeyClick} onModelClick={handleModelClick} playMode={playMode} />
          )}

          {playMode && lastNote && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
              <span className="text-3xl font-bold text-[#D4A843] animate-pulse">{lastNote}</span>
            </div>
          )}

          {/* Song selector — mobile */}
          <div className={`absolute -bottom-16 left-1/2 -translate-x-1/2 z-10 flex gap-2.5 flex-wrap justify-center transition-opacity duration-500 w-full px-4 md:hidden ${playMode ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            {SONGS.map(song => {
              const isThisPlaying = isPlaying && selectedSongId === song.id;
              return (
                <button key={song.id} onClick={() => {
                  if (isThisPlaying) { stopAutoPlay(); } else {
                    setSelectedSongId(song.id); stopAutoPlay();
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
                }} className={`px-5 py-2 rounded-full text-base backdrop-blur-sm transition-all duration-300 ${
                  isThisPlaying ? "bg-[#D4A843]/20 border border-[#D4A843] text-[#D4A843]"
                  : selectedSongId === song.id && !isPlaying ? "bg-[#D4A843]/10 border border-[#D4A843]/60 text-[#D4A843]/80"
                  : "border border-white/20 text-white/50 hover:text-white/80 hover:border-white/40"
                }`}>
                  <span className="inline-flex items-center gap-2">
                    {isThisPlaying
                      ? <svg width="11" height="11" viewBox="0 0 10 10" fill="currentColor"><rect width="10" height="10" rx="1"/></svg>
                      : <svg width="11" height="11" viewBox="0 0 10 10" fill="currentColor"><polygon points="1,0 10,5 1,10"/></svg>}
                    {song.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Info */}
        <div className={`px-6 md:px-12 py-4 md:py-0 md:self-center transition-opacity duration-700 ${
          playMode ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}>
          <div className="space-y-8 max-w-md">
            {td.features.map((feature, index) => (
              <AnimateOnScroll key={feature.title} variant="fade-left" delay={index * 150}>
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
                    <p className="text-sm" style={{ opacity: 0.6 }}>{feature.description}</p>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3 justify-center md:justify-start">
              <button
                onClick={() => { stopPlayback(); setPlayMode(true); setLoadedFull(true); }}
                className="inline-block px-8 py-3 rounded-full border border-[#D4A843] text-[#D4A843] font-medium tracking-wide hover:bg-[#D4A843] hover:text-[#0f1218] transition-colors duration-300"
              >
                {td.playBtn}
              </button>
              <button
                onClick={() => {
                  setDetailMode(true);
                  const container = document.querySelector("[data-scroll-container]");
                  const section = document.getElementById("tank-drum");
                  if (container && section) container.scrollTo({ top: section.offsetTop, behavior: "smooth" });
                  const detail = document.querySelector("[data-detail-view]");
                  if (detail) detail.scrollTop = 0;
                }}
                className="inline-block px-8 py-3 rounded-full border border-[#D4A843] text-[#D4A843] font-medium tracking-wide hover:bg-[#D4A843] hover:text-[#0f1218] transition-colors duration-300"
              >
                {td.learnBtn}
              </button>
            </div>
        </div>
      </div>

      {/* Detail view */}
      <div
        data-detail-view
        className={`fixed inset-0 z-[200] pt-20 pb-8 overflow-y-auto scrollbar-none transition-opacity duration-700 bg-[oklch(0.05_0.04_260)] ${
          detailMode ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="container mx-auto px-4">
          <p className="text-sm font-medium tracking-widest uppercase text-[#D4A843] text-center mb-4">{td.detail.label}</p>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Tank Drum <span className="text-[#D4A843]">JDT</span> {td.detail.titleSuffix}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto mb-16">
            {td.detail.info.map((item) => (
              <GlowCard key={item.title}>
                <h3 className="font-semibold text-lg text-[#D4A843] mb-2">{item.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{item.description}</p>
              </GlowCard>
            ))}
          </div>
          <h3 className="text-2xl font-bold text-center mb-8">{td.detail.gallery}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-12">
            {gallerySrcs.map((src, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden border border-white/10 relative group">
                <img src={src} alt={td.detail.galleryLabels[i]} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end">
                  <span className="w-full text-xs text-white/0 group-hover:text-white/80 transition-colors duration-300 text-center pb-3 px-2">{td.detail.galleryLabels[i]}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8 mb-12">
            <p className="text-white/40 text-sm mb-3">{td.detail.orders}</p>
            <a href="https://www.facebook.com/tankdrumJDT" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#D4A843] hover:text-[#D4A843]/80 transition-colors duration-300 text-sm font-medium">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              facebook.com/tankdrumJDT
            </a>
          </div>
          <div className="text-center pb-32">
            <button onClick={() => { setDetailMode(false); document.getElementById("tank-drum")?.scrollIntoView({ behavior: "smooth" }); }}
              className="inline-block px-8 py-3 rounded-full border border-white/20 text-white/60 font-medium tracking-wide hover:bg-white/10 hover:text-white transition-colors duration-300">
              {td.backBtn}
            </button>
          </div>
        </div>
      </div>

      {/* Play mode controls */}
      <div className={`absolute bottom-24 md:bottom-16 inset-x-0 z-50 flex flex-col items-center gap-8 px-4 transition-opacity duration-500 ${playMode ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div className="hidden md:flex gap-2 flex-wrap justify-center">
          {SONGS.map(song => {
            const isThisPlaying = isPlaying && selectedSongId === song.id;
            return (
              <button key={song.id} onClick={() => {
                if (isThisPlaying) { stopAutoPlay(); } else {
                  setSelectedSongId(song.id); stopAutoPlay();
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
              }} className={`px-5 py-2 rounded-full text-base backdrop-blur-sm transition-all duration-300 ${
                isThisPlaying ? "bg-[#D4A843]/20 border border-[#D4A843] text-[#D4A843]"
                : selectedSongId === song.id && !isPlaying ? "bg-[#D4A843]/10 border border-[#D4A843]/60 text-[#D4A843]/80"
                : "border border-white/20 text-white/50 hover:text-white/80 hover:border-white/40"
              }`}>
                <span className="inline-flex items-center gap-2">
                  {isThisPlaying
                    ? <svg width="11" height="11" viewBox="0 0 10 10" fill="currentColor"><rect width="10" height="10" rx="1"/></svg>
                    : <svg width="11" height="11" viewBox="0 0 10 10" fill="currentColor"><polygon points="1,0 10,5 1,10"/></svg>}
                  {song.title}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex gap-3">
          <button onClick={() => {
            stopAutoPlay(); setDetailMode(true); setPlayMode(false);
            const container = document.querySelector("[data-scroll-container]");
            const section = document.getElementById("tank-drum");
            if (container && section) container.scrollTo({ top: section.offsetTop, behavior: "smooth" });
            const detail = document.querySelector("[data-detail-view]");
            if (detail) detail.scrollTop = 0;
          }} className="px-7 py-2.5 rounded-full border border-[#D4A843]/60 text-[#D4A843] font-medium backdrop-blur-sm hover:bg-[#D4A843]/15 transition-all duration-300">
            {td.learnBtn}
          </button>
          <button onClick={() => { stopAutoPlay(); setPlayMode(false); setLoadedFull(false); startPlayback(); }}
            className="px-7 py-2.5 rounded-full bg-white/5 border border-white/30 text-white font-medium backdrop-blur-sm hover:bg-white/15 transition-all duration-300">
            ← Wróć
          </button>
        </div>
      </div>
    </section>
  );
}
