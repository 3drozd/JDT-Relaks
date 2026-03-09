"use client";

import { useState } from "react";
import Image from "next/image";
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
  const active = sorted[activeIndex];

  if (sorted.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Main display */}
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
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
    </div>
  );
}
