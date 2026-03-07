import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { EventForm } from "@/components/admin/event-form";

export default async function NewEventPage() {
  await requireAdmin();

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
          <h1 className="mt-2 text-2xl font-bold">Nowe wydarzenie</h1>
        </div>
        <EventForm />
      </div>
    </div>
  );
}
