import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  // Vercel cron authorization
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServerClient();
  const now = new Date().toISOString();

  // Mark as ended: active events where end_date < now, or (no end_date and date < now)
  const { data, error } = await supabase
    .from("events")
    .update({ status: "ended" })
    .eq("status", "active")
    .or(`end_date.lt.${now},and(end_date.is.null,date.lt.${now})`)
    .select("id, name");

  if (error) {
    console.error("auto-end-events error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ended: data?.length ?? 0, events: data });
}
