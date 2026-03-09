import { createServerClient } from "./server";
import { slugify } from "@/lib/utils";
import type { EventWithSeats, Registration } from "@/types";

export async function getAllEvents(): Promise<EventWithSeats[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("events_with_seats")
    .select("*")
    .order("date", { ascending: false });

  if (error) throw error;
  return (data as EventWithSeats[]) || [];
}

export async function getEventById(id: string) {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createEvent(input: {
  name: string;
  slug?: string;
  description?: string | null;
  detailed_description?: string | null;
  date: string;
  end_date?: string | null;
  location: string;
  price?: string | null;
  price_amount?: number | null;
  payment_type?: string;
  seat_limit?: number | null;
  status: string;
  schedule?: { time: string; title: string; description?: string }[] | null;
  faq?: { question: string; answer: string }[] | null;
  media?: { type: string; url: string; order: number }[] | null;
}) {
  const supabase = createServerClient();
  const slug = input.slug || slugify(input.name);

  const { data, error } = await supabase
    .from("events")
    .insert({
      name: input.name,
      slug,
      description: input.description || null,
      detailed_description: input.detailed_description || null,
      date: input.date,
      end_date: input.end_date || null,
      location: input.location,
      price: input.price || null,
      price_amount: input.price_amount || null,
      payment_type: input.payment_type || "free",
      seat_limit: input.seat_limit || null,
      status: input.status,
      schedule: input.schedule || null,
      faq: input.faq || null,
      media: input.media || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateEvent(
  id: string,
  input: {
    name?: string;
    slug?: string;
    description?: string | null;
    detailed_description?: string | null;
    date?: string;
    end_date?: string | null;
    location?: string;
    price?: string | null;
    price_amount?: number | null;
    payment_type?: string;
    seat_limit?: number | null;
    status?: string;
    schedule?: { time: string; title: string; description?: string }[] | null;
    faq?: { question: string; answer: string }[] | null;
    media?: { type: string; url: string; order: number }[] | null;
  }
) {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("events")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteEvent(id: string) {
  const supabase = createServerClient();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;
}

export async function getRegistrationsByEventId(
  eventId: string
): Promise<Registration[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("registrations")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as Registration[]) || [];
}
