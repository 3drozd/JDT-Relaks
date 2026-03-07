import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { getAllEvents } from "@/lib/supabase/admin-queries";
import { formatShortDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AdminHeader } from "@/components/admin/admin-header";
import { DeleteEventButton } from "@/components/admin/delete-event-button";

const statusLabels: Record<string, string> = {
  active: "Aktywne",
  draft: "Szkic",
  ended: "Zakończone",
};

const statusVariants: Record<string, "default" | "secondary" | "outline"> = {
  active: "default",
  draft: "secondary",
  ended: "outline",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireAdmin();
  const events = await getAllEvents();

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader />
      <div className="mx-auto max-w-6xl p-4 sm:p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold">Wydarzenia</h1>
          <Button asChild>
            <Link href="/admin/events/new">Dodaj wydarzenie</Link>
          </Button>
        </div>

        {events.length === 0 ? (
          <p className="text-muted-foreground">Brak wydarzeń.</p>
        ) : (
          <div className="rounded-lg border bg-card overflow-x-auto">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Nazwa</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Lokalizacja</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uczestnicy</TableHead>
                  <TableHead className="text-right">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.name}</TableCell>
                    <TableCell>{formatShortDate(event.date)}</TableCell>
                    <TableCell>{event.location}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariants[event.status] || "outline"}>
                        {statusLabels[event.status] || event.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {event.seats_taken}
                      {event.seat_limit ? ` / ${event.seat_limit}` : ""}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/events/${event.id}/registrations`}>
                            Uczestnicy
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/events/${event.id}`}>
                            Edytuj
                          </Link>
                        </Button>
                        <DeleteEventButton
                          eventId={event.id}
                          eventName={event.name}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
