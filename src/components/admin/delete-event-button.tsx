"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export function DeleteEventButton({
  eventId,
  eventName,
}: {
  eventId: string;
  eventName: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/events/${eventId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Wydarzenie zostało usunięte.");
        setOpen(false);
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.message || "Nie udało się usunąć wydarzenia.");
      }
    } catch {
      toast.error("Wystąpił błąd.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive">
          Usuń
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Usunąć wydarzenie?</DialogTitle>
          <DialogDescription>
            Czy na pewno chcesz usunąć wydarzenie &quot;{eventName}&quot;? Ta
            operacja usunie również wszystkich zarejestrowanych uczestników i nie
            może być cofnięta.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Anuluj
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Usuwanie..." : "Usuń"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
