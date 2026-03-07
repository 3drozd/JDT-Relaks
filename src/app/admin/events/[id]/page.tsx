import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getEventById } from "@/lib/supabase/admin-queries";
import { AdminHeader } from "@/components/admin/admin-header";
import { EventForm } from "@/components/admin/event-form";

export const dynamic = "force-dynamic";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  let event;
  try {
    event = await getEventById(id);
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader />
      <div className="mx-auto max-w-3xl p-4 sm:p-6">
        <div className="mb-6">
          <Link
            href="/admin"
            className="text-sm text-muted-foreground hover:underline"
          >
            &larr; Powrót do listy
          </Link>
          <h1 className="mt-2 text-2xl font-bold">Edytuj: {event.name}</h1>
        </div>
        <EventForm event={event} />
      </div>
    </div>
  );
}
