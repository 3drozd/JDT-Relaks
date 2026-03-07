import { NextRequest, NextResponse } from "next/server";
import { createServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { generateIcsContent } from "@/lib/google-calendar";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ message: "Not configured" }, { status: 500 });
  }

  const supabase = createServerClient();
  const { data: event, error } = await supabase
    .from("events")
    .select("name, description, location, date, end_date")
    .eq("id", eventId)
    .single();

  if (error || !event) {
    return NextResponse.json({ message: "Event not found" }, { status: 404 });
  }

  const icsContent = generateIcsContent(event);

  return new NextResponse(icsContent, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${event.name}.ics"`,
    },
  });
}
