"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { slugify } from "@/lib/utils";
import type { Event } from "@/types";

interface ScheduleItem {
  time: string;
  title: string;
  description?: string;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface EventFormProps {
  event?: Event;
}

export function EventForm({ event }: EventFormProps) {
  const router = useRouter();
  const isEditing = !!event;

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(event?.name || "");
  const [slug, setSlug] = useState(event?.slug || "");
  const [description, setDescription] = useState(event?.description || "");
  const [detailedDescription, setDetailedDescription] = useState(
    event?.detailed_description || ""
  );
  const [date, setDate] = useState(
    event?.date ? toDatetimeLocal(event.date) : ""
  );
  const [endDate, setEndDate] = useState(
    event?.end_date ? toDatetimeLocal(event.end_date) : ""
  );
  const [location, setLocation] = useState(event?.location || "");
  const [price, setPrice] = useState(event?.price || "");
  const [paymentType, setPaymentType] = useState(
    event?.payment_type || "free" as string
  );
  const [priceAmount, setPriceAmount] = useState(
    event?.price_amount ? (event.price_amount / 100).toString() : ""
  );
  const [seatLimit, setSeatLimit] = useState(
    event?.seat_limit?.toString() || ""
  );
  const [status, setStatus] = useState(event?.status || "draft" as string);
  const [schedule, setSchedule] = useState<ScheduleItem[]>(
    (event?.schedule as ScheduleItem[]) || []
  );
  const [faq, setFaq] = useState<FaqItem[]>(
    (event?.faq as FaqItem[]) || []
  );

  function handleNameChange(value: string) {
    setName(value);
    if (!isEditing) {
      setSlug(slugify(value));
    }
  }

  function addScheduleItem() {
    setSchedule([...schedule, { time: "", title: "", description: "" }]);
  }

  function removeScheduleItem(index: number) {
    setSchedule(schedule.filter((_, i) => i !== index));
  }

  function updateScheduleItem(
    index: number,
    field: keyof ScheduleItem,
    value: string
  ) {
    const updated = [...schedule];
    updated[index] = { ...updated[index], [field]: value };
    setSchedule(updated);
  }

  function addFaqItem() {
    setFaq([...faq, { question: "", answer: "" }]);
  }

  function removeFaqItem(index: number) {
    setFaq(faq.filter((_, i) => i !== index));
  }

  function updateFaqItem(
    index: number,
    field: keyof FaqItem,
    value: string
  ) {
    const updated = [...faq];
    updated[index] = { ...updated[index], [field]: value };
    setFaq(updated);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const body = {
      name,
      slug,
      description: description || null,
      detailed_description: detailedDescription || null,
      date: new Date(date).toISOString(),
      end_date: endDate ? new Date(endDate).toISOString() : null,
      location,
      price: price || null,
      price_amount: priceAmount ? Math.round(parseFloat(priceAmount) * 100) : null,
      payment_type: paymentType,
      seat_limit: seatLimit ? parseInt(seatLimit, 10) : null,
      status,
      schedule: schedule.length > 0 ? schedule : null,
      faq: faq.length > 0 ? faq : null,
    };

    try {
      const url = isEditing
        ? `/api/admin/events/${event.id}`
        : "/api/admin/events";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(
          isEditing
            ? "Wydarzenie zostało zaktualizowane."
            : "Wydarzenie zostało utworzone."
        );
        router.push("/admin");
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.message || "Wystąpił błąd.");
      }
    } catch {
      toast.error("Wystąpił błąd.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dane podstawowe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nazwa wydarzenia *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="auto-generowany"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Opis (krótki)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Krótki opis widoczny na górze strony wydarzenia"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="detailed_description">Szczegółowy opis</Label>
            <Textarea
              id="detailed_description"
              value={detailedDescription}
              onChange={(e) => setDetailedDescription(e.target.value)}
              rows={8}
              placeholder="Rozszerzony opis — wyświetlany w osobnej sekcji pod informacjami organizacyjnymi"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Data rozpoczęcia *</Label>
              <Input
                id="date"
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">Data zakończenia</Label>
              <Input
                id="end_date"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="location">Lokalizacja *</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Cena</Label>
              <Input
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="np. 50 zł lub Bezpłatne"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seat_limit">Limit miejsc</Label>
              <Input
                id="seat_limit"
                type="number"
                min="1"
                value={seatLimit}
                onChange={(e) => setSeatLimit(e.target.value)}
                placeholder="Bez limitu"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="payment_type">Typ płatności</Label>
              <Select value={paymentType} onValueChange={setPaymentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Bezpłatne</SelectItem>
                  <SelectItem value="on_site">Płatność na miejscu</SelectItem>
                  <SelectItem value="online">Płatność online (Stripe)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {paymentType !== "free" && (
              <div className="space-y-2">
                <Label htmlFor="price_amount">Kwota (PLN) *</Label>
                <Input
                  id="price_amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={priceAmount}
                  onChange={(e) => setPriceAmount(e.target.value)}
                  placeholder="np. 50.00"
                  required
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Szkic</SelectItem>
                <SelectItem value="active">Aktywne</SelectItem>
                <SelectItem value="ended">Zakończone</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Harmonogram</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {schedule.map((item, index) => (
            <div key={index} className="space-y-2 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Punkt {index + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => removeScheduleItem(index)}
                >
                  Usuń
                </Button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  placeholder="Godzina (np. 10:00)"
                  value={item.time}
                  onChange={(e) =>
                    updateScheduleItem(index, "time", e.target.value)
                  }
                />
                <Input
                  placeholder="Tytuł"
                  value={item.title}
                  onChange={(e) =>
                    updateScheduleItem(index, "title", e.target.value)
                  }
                />
              </div>
              <Input
                placeholder="Opis (opcjonalnie)"
                value={item.description || ""}
                onChange={(e) =>
                  updateScheduleItem(index, "description", e.target.value)
                }
              />
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addScheduleItem}>
            Dodaj punkt harmonogramu
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>FAQ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {faq.map((item, index) => (
            <div key={index} className="space-y-2 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Pytanie {index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => removeFaqItem(index)}
                >
                  Usuń
                </Button>
              </div>
              <Input
                placeholder="Pytanie"
                value={item.question}
                onChange={(e) =>
                  updateFaqItem(index, "question", e.target.value)
                }
              />
              <Textarea
                placeholder="Odpowiedź"
                value={item.answer}
                onChange={(e) =>
                  updateFaqItem(index, "answer", e.target.value)
                }
                rows={2}
              />
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addFaqItem}>
            Dodaj pytanie FAQ
          </Button>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading
            ? "Zapisywanie..."
            : isEditing
              ? "Zapisz zmiany"
              : "Utwórz wydarzenie"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin")}
        >
          Anuluj
        </Button>
      </div>
    </form>
  );
}

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
