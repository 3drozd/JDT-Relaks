"use client";

import Link from "next/link";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";
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
import { AnimateOnScroll } from "@/components/ui/animate-on-scroll";
import type { EventWithSeats } from "@/types";

interface EventListProps {
  events: EventWithSeats[];
}

export function EventList({ events }: EventListProps) {
  const { lastRegistration, seatsDelta } = useRealtimeRegistrations();

  if (events.length === 0) {
    return (
      <section id="wydarzenia" className="min-h-svh flex flex-col justify-center py-16" data-section>
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
    <section id="wydarzenia" className="min-h-svh flex flex-col justify-center py-16 overflow-hidden" data-section>
      <div className="container mx-auto px-4">
        <AnimateOnScroll variant="fade-in">
          <h2 className="text-3xl font-bold text-center mb-10">
            Nadchodzące wydarzenia
          </h2>
        </AnimateOnScroll>
        <AnimateOnScroll variant="fade-in">
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin md:scrollbar-normal">
            {events.map((event) => {
              const delta = seatsDelta[event.id] || 0;
              const trigger =
                lastRegistration?.eventId === event.id
                  ? lastRegistration.timestamp
                  : null;
              return (
                <div key={event.id} className="w-[320px] shrink-0 snap-start">
                  <EventCard
                    event={event}
                    seatsDelta={delta}
                    registrationTrigger={trigger}
                  />
                </div>
              );
            })}
          </div>
        </AnimateOnScroll>
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

  function getDaysLabel() {
    const now = new Date();
    const eventDate = new Date(event.date);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    const diffDays = Math.round((eventDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffMs = eventDate.getTime() - now.getTime();
      if (diffMs <= 0) return "Trwa teraz!";
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      if (hours > 0) return `Za ${hours}h ${minutes}min`;
      return `Za ${minutes} min`;
    }
    if (diffDays === 1) return "Już jutro!";
    if (diffDays < 7) return `Za ${diffDays} dni`;
    if (diffDays < 14) return "Za tydzień";
    if (diffDays < 30) return `Za ${Math.floor(diffDays / 7)} tygodnie`;
    return `Za ${Math.floor(diffDays / 30)} mies.`;
  }

  const now = new Date();
  const eventDay = new Date(new Date(event.date).getFullYear(), new Date(event.date).getMonth(), new Date(event.date).getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daysUntil = Math.round((eventDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Card className="flex flex-col h-full transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {event.price ? (
              <Badge variant="secondary">{event.price}</Badge>
            ) : (
              <Badge variant="secondary">Bezpłatne</Badge>
            )}
          </div>
          <Badge variant={daysUntil <= 3 ? "destructive" : "outline"} className="text-xs">
            {getDaysLabel(daysUntil)}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
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
          <Clock className="h-4 w-4 shrink-0" />
          <span>Rozpoczęcie {new Date(event.date).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}</span>
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
