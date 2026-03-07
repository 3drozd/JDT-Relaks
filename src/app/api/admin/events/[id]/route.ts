import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { eventSchema } from "@/lib/validators";
import { updateEvent, deleteEvent } from "@/lib/supabase/admin-queries";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ message: "Brak autoryzacji." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = eventSchema.partial().safeParse(body);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message || "Nieprawidłowe dane";
    return NextResponse.json({ message: firstError }, { status: 400 });
  }

  try {
    const event = await updateEvent(id, parsed.data);
    revalidatePath("/");
    revalidatePath(`/events/${event.slug}`);
    return NextResponse.json(event);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Nie udało się zaktualizować wydarzenia.";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ message: "Brak autoryzacji." }, { status: 401 });
  }

  const { id } = await params;

  try {
    await deleteEvent(id);
    revalidatePath("/");
    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Nie udało się usunąć wydarzenia.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
