"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { MediaItem } from "@/types";

interface MediaGalleryProps {
  media: MediaItem[];
}

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return match?.[1] || null;
}

export function MediaGallery({ media }: MediaGalleryProps) {
  const sorted = [...media].sort((a, b) => a.order - b.order);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const active = sorted[activeIndex];

  if (sorted.length === 0) return null;

  const openLightbox = () => {
    if (active.type === "image") setLightboxOpen(true);
  };

  return (
    <div className="space-y-3">
      {/* Main display */}
      <div
        className={`relative aspect-video w-full overflow-hidden rounded-lg bg-muted ${active.type === "image" ? "cursor-zoom-in" : ""}`}
        onClick={openLightbox}
      >
        {active.type === "image" ? (
          <Image
            src={active.url}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <iframe
            src={`https://www.youtube.com/embed/${getYouTubeId(active.url)}`}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>

      {/* Thumbnails */}
      {sorted.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sorted.map((item, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded border-2 transition-colors ${
                i === activeIndex
                  ? "border-primary"
                  : "border-transparent hover:border-muted-foreground/30"
              }`}
            >
              {item.type === "image" ? (
                <Image
                  src={item.url}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground">
                  ▶ Video
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          images={sorted.filter((m) => m.type === "image")}
          initialIndex={sorted.filter((m, i) => m.type === "image" && i <= activeIndex).length - 1}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}

function Lightbox({
  images,
  initialIndex,
  onClose,
}: {
  images: MediaItem[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(Math.max(0, initialIndex));

  const prev = useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : images.length - 1));
  }, [images.length]);

  const next = useCallback(() => {
    setIndex((i) => (i < images.length - 1 ? i + 1 : 0));
  }, [images.length]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose, prev, next]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
      >
        <X className="h-6 w-6" />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-4 z-10 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        </>
      )}

      <div
        className="relative max-h-[90vh] max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={images[index].url}
          alt=""
          width={1920}
          height={1080}
          className="max-h-[90vh] w-auto object-contain"
          sizes="90vw"
        />
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-4 text-white/60 text-sm">
          {index + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
