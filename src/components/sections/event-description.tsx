import { CalendarDays, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";
import { MediaGallery } from "@/components/sections/media-gallery";
import type { EventWithSeats } from "@/types";

interface EventDescriptionProps {
  event: EventWithSeats;
}

export function EventDescription({ event }: EventDescriptionProps) {
  const sortedMedia = (event.media || []).sort((a, b) => a.order - b.order);
  const hasMedia = sortedMedia.length > 0;

  return (
    <section className="py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className={hasMedia ? "grid gap-8 lg:grid-cols-2" : "max-w-3xl mx-auto"}>
          {/* Left column: info */}
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {event.price ? (
                <Badge variant="secondary" className="text-sm">
                  {event.price}
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-sm">
                  Bezpłatne
                </Badge>
              )}
              {event.status === "ended" && (
                <Badge variant="destructive">Zakończone</Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold md:text-4xl mb-6">{event.name}</h1>

            <div className="flex flex-col gap-3 mb-8 text-muted-foreground">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 shrink-0" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 shrink-0" />
                <span>{event.location}</span>
              </div>
            </div>

            {event.description && (
              <div className="prose prose-neutral max-w-none">
                {event.description.split("\n").map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            )}
          </div>

          {/* Right column: media gallery */}
          {hasMedia && <MediaGallery media={sortedMedia} />}
        </div>
      </div>
    </section>
  );
}
