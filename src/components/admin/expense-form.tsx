"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import type { AccountingExpense } from "@/types";

export function ExpenseForm({ expense }: { expense?: AccountingExpense }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState(expense?.receipt_url ?? "");
  const [form, setForm] = useState({
    date: expense?.date ?? new Date().toISOString().slice(0, 10),
    description: expense?.description ?? "",
    amount: expense ? (expense.amount_grosz / 100).toFixed(2) : "",
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.url) setReceiptUrl(data.url);
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const amount_grosz = Math.round(parseFloat(form.amount) * 100);
    const body = { date: form.date, description: form.description, amount_grosz, receipt_url: receiptUrl || undefined };

    if (expense) {
      await fetch(`/api/admin/accounting/expenses/${expense.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      await fetch("/api/admin/accounting/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    router.push("/admin/accounting");
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input id="date" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Opis</Label>
            <Input id="description" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="np. Zakup pałeczek" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Kwota (PLN)</Label>
            <Input id="amount" type="number" step="0.01" min="0" value={form.amount} onChange={(e) => set("amount", e.target.value)} placeholder="0.00" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="receipt">Paragon / zdjęcie (opcjonalnie)</Label>
            <Input id="receipt" type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} />
            {uploading && <p className="text-sm text-muted-foreground">Przesyłanie...</p>}
            {receiptUrl && (
              <a href={receiptUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary underline">
                Podgląd paragonu
              </a>
            )}
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={loading || uploading}>
              {loading ? "Zapisywanie..." : expense ? "Zapisz zmiany" : "Dodaj koszt"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Anuluj
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
