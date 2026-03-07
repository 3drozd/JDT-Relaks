"use client";

import { MapPin, Ticket, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { RegistrationPulse } from "@/components/ui/registration-pulse";
import { useRealtimeRegistrations } from "@/hooks/use-realtime-registrations";
import type { EventWithSeats } from "@/types";

interface OrgInfoProps {
  event: EventWithSeats;
}

export function OrgInfo({ event }: OrgInfoProps) {
  const { lastRegistration, seatsDelta } = useRealtimeRegistrations({
    eventId: event.id,
  });

  const delta = seatsDelta[event.id] || 0;
  const currentRemaining =
    event.seats_remaining !== null
      ? Math.max(0, event.seats_remaining - delta)
      : null;
  const trigger = lastRegistration?.timestamp ?? null;

  return (
    <section className="py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-2xl font-bold mb-6">Informacje organizacyjne</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent className="flex items-start gap-3 pt-6">
              <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Lokalizacja</p>
                <p className="text-sm text-muted-foreground">
                  {event.location}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-start gap-3 pt-6">
              <Ticket className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Cena</p>
                <p className="text-sm text-muted-foreground">
                  {event.price || "Bezpłatne"}
                </p>
              </div>
            </CardContent>
          </Card>

          {event.seat_limit !== null && (
            <Card>
              <CardContent className="flex items-start gap-3 pt-6">
                <Users className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Dostępne miejsca</p>
                  <p className="text-sm text-muted-foreground">
                    {currentRemaining !== null ? (
                      <>
                        <AnimatedNumber value={currentRemaining} /> z{" "}
                        {event.seat_limit}
                      </>
                    ) : (
                      `${event.seat_limit}`
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        <RegistrationPulse trigger={trigger} className="mt-4" />
      </div>
    </section>
  );
}
