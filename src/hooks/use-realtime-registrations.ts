"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

interface RealtimeRegistration {
  eventId: string;
  seats: number;
  timestamp: number;
}

interface UseRealtimeRegistrationsOptions {
  eventId?: string;
}

export function useRealtimeRegistrations(
  options: UseRealtimeRegistrationsOptions = {}
) {
  const [lastRegistration, setLastRegistration] =
    useState<RealtimeRegistration | null>(null);
  const [seatsDelta, setSeatsDelta] = useState<Record<string, number>>({});
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    const supabase = supabaseRef.current;

    const channel = supabase
      .channel("registrations-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "registrations",
          ...(options.eventId
            ? { filter: `event_id=eq.${options.eventId}` }
            : {}),
        },
        (payload) => {
          const row = payload.new as { event_id: string; seats: number };
          const registration: RealtimeRegistration = {
            eventId: row.event_id,
            seats: row.seats,
            timestamp: Date.now(),
          };
          setLastRegistration(registration);
          setSeatsDelta((prev) => ({
            ...prev,
            [row.event_id]: (prev[row.event_id] || 0) + row.seats,
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [options.eventId]);

  return { lastRegistration, seatsDelta };
}
