"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function PaymentToast() {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment === "success") {
      setOpen(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, [searchParams]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="sr-only">
          <DialogTitle>Płatność przyjęta</DialogTitle>
        </DialogHeader>
        <div className="py-6 text-center space-y-4">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
          <h2 className="text-xl font-bold">Dziękujemy za rejestrację!</h2>
          <p className="text-muted-foreground">
            Płatność została przyjęta. Potwierdzenie wraz z&nbsp;możliwością
            dodania wydarzenia do kalendarza wyślemy na Twój adres email.
          </p>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Zamknij
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
