import { createServerClient, isSupabaseConfigured } from "./server";
import type { Event, EventWithSeats } from "@/types";

export async function getActiveEvents(): Promise<EventWithSeats[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("events_with_seats")
    .select("*")
    .in("status", ["active"])
    .order("date", { ascending: true });

  if (error) {
    console.error("Failed to fetch events:", error);
    return [];
  }
  return data as EventWithSeats[];
}

export async function getEventBySlug(
  slug: string
): Promise<EventWithSeats | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("events_with_seats")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data as EventWithSeats;
}

export async function getAllEventSlugs(): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("events")
    .select("slug")
    .in("status", ["active", "ended"]);

  if (error) {
    console.error("Failed to fetch event slugs:", error);
    return [];
  }
  return (data as Pick<Event, "slug">[]).map((e) => e.slug);
}
