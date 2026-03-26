import { Hero } from "@/components/sections/hero";
import { AboutConcerts } from "@/components/sections/about-concerts";
import { EventList } from "@/components/sections/event-list";
import { TankDrum } from "@/components/sections/tank-drum";
import { getActiveEvents } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const events = await getActiveEvents();

  return (
    <>
      <Hero />
      <AboutConcerts />
      <TankDrum />
      <EventList events={events} />
    </>
  );
}
