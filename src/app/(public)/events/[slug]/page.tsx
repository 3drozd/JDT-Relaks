import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { EventDescription } from "@/components/sections/event-description";
import { PaymentToast } from "@/components/payment-toast";
import { Schedule } from "@/components/sections/schedule";
import { OrgInfo } from "@/components/sections/org-info";
import { Faq } from "@/components/sections/faq";
import { DetailedDescription } from "@/components/sections/detailed-description";
import { StickyCTA } from "@/components/sections/sticky-cta";
import { getEventBySlug, getAllEventSlugs } from "@/lib/supabase/queries";
import { siteConfig } from "@/config/site.config";
import { formatShortDate } from "@/lib/format";

export const revalidate = 3600;

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllEventSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: "Wydarzenie nie znalezione" };

  return {
    title: event.name,
    description: `${event.name} - ${event.location}, ${formatShortDate(event.date)}`,
    openGraph: {
      title: event.name,
      description: event.description?.slice(0, 160) || undefined,
      images: [
        {
          url: event.og_image || `${siteConfig.url}${siteConfig.ogImage}`,
        },
      ],
      type: "article",
    },
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const faqItems = event.faq || siteConfig.faq;

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    startDate: event.date,
    endDate: event.end_date || undefined,
    location: {
      "@type": "Place",
      name: event.location,
    },
    description: event.description || undefined,
    organizer: {
      "@type": "Organization",
      name: siteConfig.name,
    },
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  };

  return (
    <>
      <Suspense>
        <PaymentToast />
      </Suspense>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="pb-20">
        <EventDescription event={event} />
        {event.detailed_description && (
          <DetailedDescription text={event.detailed_description} />
        )}
        <Schedule schedule={event.schedule} />
        <OrgInfo event={event} />
        <Faq items={faqItems} />
      </div>
      <StickyCTA event={event} />
    </>
  );
}
