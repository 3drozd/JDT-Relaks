import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import {
  getEventById,
  getRegistrationsByEventId,
} from "@/lib/supabase/admin-queries";
import { AdminHeader } from "@/components/admin/admin-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function RegistrationsPage({
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

  const registrations = await getRegistrationsByEventId(id);
  const totalSeats = registrations.reduce((sum, r) => sum + r.seats, 0);

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader />
      <div className="mx-auto max-w-6xl p-4 sm:p-6">
        <div className="mb-6">
          <Link
            href="/admin"
            className="text-sm text-muted-foreground hover:underline"
          >
            &larr; Powrót do listy
          </Link>
          <h1 className="mt-2 text-xl sm:text-2xl font-bold">
            Uczestnicy: {event.name}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Łącznie: {registrations.length} rejestracji ({totalSeats} miejsc)
          </p>
        </div>

        {registrations.length === 0 ? (
          <p className="text-muted-foreground">Brak rejestracji.</p>
        ) : (
          <div className="rounded-lg border bg-card overflow-x-auto">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Imię i nazwisko</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Miejsca</TableHead>
                  <TableHead>Płatność</TableHead>
                  <TableHead>Data rejestracji</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {registrations.map((reg) => (
                  <TableRow key={reg.id}>
                    <TableCell className="font-medium">{reg.name}</TableCell>
                    <TableCell>{reg.email}</TableCell>
                    <TableCell>{reg.phone || "—"}</TableCell>
                    <TableCell>{reg.seats}</TableCell>
                    <TableCell>
                      <PaymentBadge status={reg.payment_status} />
                    </TableCell>
                    <TableCell>
                      {new Date(reg.created_at).toLocaleDateString("pl-PL", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
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

function PaymentBadge({ status }: { status: string }) {
  switch (status) {
    case "paid":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Opłacone</Badge>;
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Oczekuje</Badge>;
    case "failed":
      return <Badge variant="destructive">Nieudane</Badge>;
    default:
      return <span className="text-muted-foreground">—</span>;
  }
}
