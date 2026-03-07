import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { eventSchema } from "@/lib/validators";
import { createEvent } from "@/lib/supabase/admin-queries";

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ message: "Brak autoryzacji." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = eventSchema.safeParse(body);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message || "Nieprawidłowe dane";
    return NextResponse.json({ message: firstError }, { status: 400 });
  }

  try {
    const event = await createEvent(parsed.data);
    revalidatePath("/");
    revalidatePath(`/events/${event.slug}`);
    return NextResponse.json(event, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Nie udało się utworzyć wydarzenia.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
