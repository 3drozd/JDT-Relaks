"use client";

import Link from "next/link";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { RegistrationPulse } from "@/components/ui/registration-pulse";
import { useRealtimeRegistrations } from "@/hooks/use-realtime-registrations";
import { formatShortDate } from "@/lib/format";
import type { EventWithSeats } from "@/types";

interface EventListProps {
  events: EventWithSeats[];
}

export function EventList({ events }: EventListProps) {
  const { lastRegistration, seatsDelta } = useRealtimeRegistrations();

  if (events.length === 0) {
    return (
      <section id="wydarzenia" className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Nadchodzące wydarzenia</h2>
          <p className="text-muted-foreground">
            Aktualnie nie ma zaplanowanych wydarzeń. Sprawdź ponownie wkrótce!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="wydarzenia" className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-10">
          Nadchodzące wydarzenia
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const delta = seatsDelta[event.id] || 0;
            const trigger =
              lastRegistration?.eventId === event.id
                ? lastRegistration.timestamp
                : null;
            return (
              <EventCard
                key={event.id}
                event={event}
                seatsDelta={delta}
                registrationTrigger={trigger}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function EventCard({
  event,
  seatsDelta,
  registrationTrigger,
}: {
  event: EventWithSeats;
  seatsDelta: number;
  registrationTrigger: number | null;
}) {
  const currentRemaining =
    event.seats_remaining !== null
      ? Math.max(0, event.seats_remaining - seatsDelta)
      : null;
  const isFull =
    event.seat_limit !== null &&
    currentRemaining !== null &&
    currentRemaining <= 0;

  return (
    <Card className="flex flex-col transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          {event.price ? (
            <Badge variant="secondary">{event.price}</Badge>
          ) : (
            <Badge variant="secondary">Bezpłatne</Badge>
          )}
          {isFull && <Badge variant="destructive">Brak miejsc</Badge>}
        </div>
        <CardTitle className="text-xl">{event.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4 shrink-0" />
          <span>{formatShortDate(event.date)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0" />
          <span>{event.location}</span>
        </div>
        {event.seat_limit !== null && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4 shrink-0" />
            <span>
              {currentRemaining !== null ? (
                <>
                  <AnimatedNumber value={currentRemaining} /> /{" "}
                  {event.seat_limit} wolnych miejsc
                </>
              ) : (
                `${event.seat_limit} miejsc`
              )}
            </span>
          </div>
        )}
        <RegistrationPulse trigger={registrationTrigger} />
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" disabled={isFull}>
          <Link href={`/events/${event.slug}`}>
            {isFull ? "Brak miejsc" : "Zapisz się"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
