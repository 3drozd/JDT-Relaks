import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createCalendarEvent } from "@/lib/google-calendar";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-webhook-secret");
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid body" }, { status: 400 });
  }

  const { type, table, record } = body;

  // Revalidate pages
  revalidatePath("/");
  if (record?.slug) {
    revalidatePath(`/events/${record.slug}`);
  }

  // Sync new events to Google Calendar
  if (
    type === "INSERT" &&
    table === "events" &&
    record &&
    !record.google_calendar_event_id
  ) {
    try {
      const calendarEventId = await createCalendarEvent({
        name: record.name,
        description: record.description,
        location: record.location,
        date: record.date,
        end_date: record.end_date,
      });

      if (calendarEventId) {
        const supabase = createServerClient();
        await supabase
          .from("events")
          .update({ google_calendar_event_id: calendarEventId })
          .eq("id", record.id);
      }
    } catch (error) {
      console.error("Google Calendar sync error:", error);
    }
  }

  return NextResponse.json({ revalidated: true });
}
