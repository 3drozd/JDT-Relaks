"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RegistrationDialog } from "@/components/sections/registration-form";
import type { EventWithSeats } from "@/types";

interface StickyCTAProps {
  event: EventWithSeats;
}

export function StickyCTA({ event }: StickyCTAProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const scrollPosRef = useRef(0);

  const handleOpenChange = useCallback((open: boolean) => {
    if (open) {
      scrollPosRef.current = window.scrollY;
    }
    setDialogOpen(open);
    if (!open) {
      const pos = scrollPosRef.current;
      // Restore after Radix finishes its cleanup (~200ms animation)
      setTimeout(() => window.scrollTo(0, pos), 0);
      setTimeout(() => window.scrollTo(0, pos), 50);
      setTimeout(() => window.scrollTo(0, pos), 250);
    }
  }, []);

  const isFull =
    event.seat_limit !== null &&
    event.seats_remaining !== null &&
    event.seats_remaining <= 0;
  const isActive = event.status === "active" && !isFull;

  if (!isActive) return null;

  return (
    <>
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur p-3 shadow-lg transition-opacity ${
          dialogOpen ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <div className="container mx-auto flex items-center justify-center">
          <Button
            size="lg"
            className="w-full max-w-sm"
            onClick={() => handleOpenChange(true)}
          >
            Zapisz się na wydarzenie
          </Button>
        </div>
      </div>
      <RegistrationDialog
        event={event}
        open={dialogOpen}
        onOpenChange={handleOpenChange}
      />
    </>
  );
}
