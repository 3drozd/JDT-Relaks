import { Hero } from "@/components/sections/hero";
import { EventList } from "@/components/sections/event-list";
import { getActiveEvents } from "@/lib/supabase/queries";

export const revalidate = 3600;

export default async function HomePage() {
  const events = await getActiveEvents();

  return (
    <>
      <Hero />
      <EventList events={events} />
    </>
  );
}
