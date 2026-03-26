"use client";

import { Suspense } from "react";
import { TankDrumScene } from "@/components/3d/tank-drum-scene";

export function TankDrumViewer({ onKeyClick, playMode }: { onKeyClick?: (note: string) => void; playMode?: boolean } = {}) {
  return (
    <div className="w-full h-full">
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-muted-foreground text-sm animate-pulse">
              Ładowanie modelu 3D...
            </p>
          </div>
        }
      >
        <TankDrumScene onKeyClick={onKeyClick} playMode={playMode} />
      </Suspense>
    </div>
  );
}
