"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { registrationSchema, type RegistrationInput } from "@/lib/validators";
import type { EventWithSeats } from "@/types";

interface RegistrationDialogProps {
  event: EventWithSeats;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function RegistrationDialog({
  event,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: RegistrationDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const isFull =
    event.seat_limit !== null &&
    event.seats_remaining !== null &&
    event.seats_remaining <= 0;
  const isDisabled = event.status !== "active" || isFull;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      eventId: event.id,
      name: "",
      email: "",
      phone: "",
      seats: 1,
      rodoConsent: false as unknown as true,
    },
  });

  const rodoConsent = watch("rodoConsent");

  async function onSubmit(data: RegistrationInput) {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.message || "Wystąpił błąd podczas rejestracji");
        return;
      }

      // Online payment: redirect to Stripe Checkout
      if (result.paymentUrl) {
        setIsRedirecting(true);
        window.location.href = result.paymentUrl;
        return;
      }

      toast.success("Rejestracja przebiegła pomyślnie!");
      setIsSuccess(true);
    } catch {
      toast.error("Wystąpił błąd połączenia. Spróbuj ponownie.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleOpenChange(newOpen: boolean) {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset form when closing
      setTimeout(() => {
        setIsSuccess(false);
        reset();
      }, 200);
    }
  }

  const defaultTrigger = (
    <Button size="lg" disabled={isDisabled}>
      {isFull ? "Brak miejsc" : "Zapisz się"}
    </Button>
  );

  const isControlled = controlledOpen !== undefined;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!isControlled && (
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        {isRedirecting ? (
          <div className="py-8 text-center space-y-4">
            <DialogHeader className="sr-only">
              <DialogTitle>Przekierowanie do płatności</DialogTitle>
            </DialogHeader>
            <CreditCard className="mx-auto h-16 w-16 text-primary animate-pulse" />
            <h2 className="text-xl font-bold">Przekierowanie do płatności...</h2>
            <p className="text-muted-foreground">
              Za chwilę zostaniesz przekierowany na stronę płatności.
            </p>
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : isSuccess ? (
          <div className="py-8 text-center space-y-4">
            <DialogHeader className="sr-only">
              <DialogTitle>Rejestracja zakończona</DialogTitle>
            </DialogHeader>
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="text-xl font-bold">Dziękujemy za rejestrację!</h2>
            <p className="text-muted-foreground">
              Na Twój adres email wysłaliśmy potwierdzenie z możliwością
              dodania wydarzenia do kalendarza.
            </p>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Zamknij
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Zapisz się na wydarzenie</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-name">Imię i nazwisko *</Label>
                <Input
                  id="reg-name"
                  placeholder="Jan Kowalski"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-email">Email *</Label>
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="jan@example.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-phone">Telefon (opcjonalnie)</Label>
                <Input
                  id="reg-phone"
                  type="tel"
                  placeholder="+48 123 456 789"
                  {...register("phone")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-seats">Liczba miejsc *</Label>
                <Input
                  id="reg-seats"
                  type="number"
                  min={1}
                  max={Math.min(10, event.seats_remaining ?? 10)}
                  {...register("seats", { valueAsNumber: true })}
                />
                {errors.seats && (
                  <p className="text-sm text-destructive">
                    {errors.seats.message}
                  </p>
                )}
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="reg-rodo"
                  checked={rodoConsent === true}
                  onCheckedChange={(checked) =>
                    setValue(
                      "rodoConsent",
                      checked === true ? true : (false as unknown as true),
                      { shouldValidate: true }
                    )
                  }
                />
                <div className="space-y-1">
                  <Label
                    htmlFor="reg-rodo"
                    className="text-sm font-normal leading-relaxed"
                  >
                    Wyrażam zgodę na przetwarzanie moich danych osobowych w celu
                    rejestracji na wydarzenie, zgodnie z RODO. *
                  </Label>
                  {errors.rodoConsent && (
                    <p className="text-sm text-destructive">
                      {errors.rodoConsent.message}
                    </p>
                  )}
                </div>
              </div>

              {event.payment_type === "on_site" && event.price && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  Płatność na miejscu: <strong>{event.price}</strong>
                </div>
              )}

              {event.payment_type === "online" && event.price && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
                  Do zapłaty: <strong>{event.price}</strong> — po kliknięciu
                  zostaniesz przekierowany do bezpiecznej płatności online.
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {event.payment_type === "online"
                      ? "Przygotowywanie płatności..."
                      : "Rejestrowanie..."}
                  </>
                ) : event.payment_type === "online" ? (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Zapisz się i zapłać
                  </>
                ) : (
                  "Zapisz się"
                )}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
