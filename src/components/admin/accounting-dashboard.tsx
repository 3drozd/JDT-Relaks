"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AccountingSale, AccountingExpense, StripeSale, AccountingSummary } from "@/types";

const MONTHS_PL = ["Styczeń","Luty","Marzec","Kwiecień","Maj","Czerwiec","Lipiec","Sierpień","Wrzesień","Październik","Listopad","Grudzień"];

function formatPLN(grosz: number) {
  return (grosz / 100).toLocaleString("pl-PL", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " zł";
}

function LimitGauge({ income, limit }: { income: number; limit: number }) {
  const pct = Math.min(100, (income / limit) * 100);
  const color = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-yellow-500" : "bg-green-500";

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-end justify-between mb-2">
          <div>
            <p className="text-sm text-muted-foreground">Przychód w kwartale</p>
            <p className="text-3xl font-bold">{formatPLN(income)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Limit</p>
            <p className="text-xl font-semibold">{formatPLN(limit)}</p>
          </div>
        </div>
        <div className="h-4 w-full rounded-full bg-muted overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
        </div>
        <div className="flex justify-between mt-1">
          <p className="text-xs text-muted-foreground">{pct.toFixed(1)}% wykorzystanego limitu</p>
          <p className="text-xs text-muted-foreground">pozostało {formatPLN(Math.max(0, limit - income))}</p>
        </div>
        {pct >= 80 && (
          <p className="mt-3 text-sm font-medium text-red-600">
            ⚠️ Uwaga: zbliżasz się do limitu kwartalnego!
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function AddSaleForm({ onAdded }: { onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), description: "", client_name: "", client_email: "", amount: "" });

  function set(f: string, v: string) { setForm((p) => ({ ...p, [f]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/admin/accounting/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount_grosz: Math.round(parseFloat(form.amount) * 100) }),
    });
    setLoading(false);
    setOpen(false);
    setForm({ date: new Date().toISOString().slice(0, 10), description: "", client_name: "", client_email: "", amount: "" });
    onAdded();
  }

  if (!open) return <Button size="sm" onClick={() => setOpen(true)}>+ Dodaj ręczną sprzedaż</Button>;

  return (
    <Card className="mt-3">
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Data</Label>
            <Input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label>Kwota (PLN)</Label>
            <Input type="number" step="0.01" value={form.amount} onChange={(e) => set("amount", e.target.value)} placeholder="0.00" required />
          </div>
          <div className="space-y-1 col-span-2">
            <Label>Opis</Label>
            <Input value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="np. Koncert prywatny" required />
          </div>
          <div className="space-y-1">
            <Label>Klient</Label>
            <Input value={form.client_name} onChange={(e) => set("client_name", e.target.value)} placeholder="Imię i nazwisko" required />
          </div>
          <div className="space-y-1">
            <Label>Email (opcjonalnie)</Label>
            <Input type="email" value={form.client_email} onChange={(e) => set("client_email", e.target.value)} placeholder="email@example.com" />
          </div>
          <div className="col-span-2 flex gap-2">
            <Button type="submit" size="sm" disabled={loading}>{loading ? "Dodawanie..." : "Dodaj"}</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setOpen(false)}>Anuluj</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

interface Props {
  summary: AccountingSummary;
  stripeSales: StripeSale[];
  manualSales: AccountingSale[];
  expenses: AccountingExpense[];
  year: number;
  quarter: number;
}

export function AccountingDashboard({ summary, stripeSales, manualSales, expenses, year, quarter }: Props) {
  const router = useRouter();
  const [localManual, setLocalManual] = useState(manualSales);
  const [localExpenses, setLocalExpenses] = useState(expenses);

  async function refreshManual() {
    const now = new Date();
    const q = Math.ceil((now.getMonth() + 1) / 3);
    const start = `${year}-${String((quarter - 1) * 3 + 1).padStart(2, "0")}-01`;
    const endMonth = quarter * 3;
    const end = `${year}-${String(endMonth).padStart(2, "0")}-${new Date(year, endMonth, 0).getDate()}`;
    const res = await fetch(`/api/admin/accounting/sales?start=${start}&end=${end}`);
    setLocalManual(await res.json());
    router.refresh();
  }

  async function deleteSale(id: string) {
    await fetch(`/api/admin/accounting/sales/${id}`, { method: "DELETE" });
    setLocalManual((p) => p.filter((s) => s.id !== id));
    router.refresh();
  }

  async function deleteExpense(id: string) {
    await fetch(`/api/admin/accounting/expenses/${id}`, { method: "DELETE" });
    setLocalExpenses((p) => p.filter((e) => e.id !== id));
    router.refresh();
  }

  const allSales = [
    ...stripeSales.map((s) => ({ ...s, source: "Stripe" as const })),
    ...localManual.map((s) => ({ ...s, source: "Ręczna" as const })),
  ].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6">
      {/* Limit gauge */}
      <LimitGauge income={summary.income_grosz} limit={summary.limit_grosz} />

      {/* Sales + Expenses side by side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sales */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Ewidencja sprzedaży — Q{quarter} {year}</CardTitle>
              <a
                href={`/api/admin/accounting/export?year=${year}&quarter=${quarter}`}
                className="text-xs text-primary underline"
              >
                Eksport CSV
              </a>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <AddSaleForm onAdded={refreshManual} />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="pb-2 text-left font-medium">Data</th>
                    <th className="pb-2 text-left font-medium">Klient</th>
                    <th className="pb-2 text-right font-medium">Kwota</th>
                    <th className="pb-2 text-center font-medium">Źródło</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {allSales.length === 0 && (
                    <tr><td colSpan={5} className="py-4 text-center text-muted-foreground text-xs">Brak sprzedaży w tym kwartale</td></tr>
                  )}
                  {allSales.map((s) => (
                    <tr key={s.id} className="border-b last:border-0">
                      <td className="py-2 text-xs text-muted-foreground">{s.date}</td>
                      <td className="py-2">
                        <div className="font-medium leading-none">{s.client_name}</div>
                        <div className="text-xs text-muted-foreground">{s.description}</div>
                      </td>
                      <td className="py-2 text-right font-medium">{formatPLN(s.amount_grosz)}</td>
                      <td className="py-2 text-center">
                        <span className={`rounded px-1.5 py-0.5 text-xs ${s.source === "Stripe" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
                          {s.source}
                        </span>
                      </td>
                      <td className="py-2 text-right">
                        {s.source === "Ręczna" && (
                          <button onClick={() => deleteSale(s.id)} className="text-xs text-destructive hover:underline">Usuń</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t">
                    <td colSpan={2} className="pt-2 text-sm font-semibold">Razem</td>
                    <td className="pt-2 text-right text-sm font-semibold">{formatPLN(allSales.reduce((s, r) => s + r.amount_grosz, 0))}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Koszty — Q{quarter} {year}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/accounting/expenses/new">
              <Button size="sm">+ Dodaj koszt</Button>
            </Link>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="pb-2 text-left font-medium">Data</th>
                    <th className="pb-2 text-left font-medium">Opis</th>
                    <th className="pb-2 text-right font-medium">Kwota</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {localExpenses.length === 0 && (
                    <tr><td colSpan={4} className="py-4 text-center text-muted-foreground text-xs">Brak kosztów w tym kwartale</td></tr>
                  )}
                  {localExpenses.map((e) => (
                    <tr key={e.id} className="border-b last:border-0">
                      <td className="py-2 text-xs text-muted-foreground">{e.date}</td>
                      <td className="py-2">
                        <div className="font-medium leading-none">{e.description}</div>
                        {e.receipt_url && (
                          <a href={e.receipt_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">paragon</a>
                        )}
                      </td>
                      <td className="py-2 text-right font-medium">{formatPLN(e.amount_grosz)}</td>
                      <td className="py-2 text-right flex gap-2 justify-end">
                        <Link href={`/admin/accounting/expenses/${e.id}/edit`} className="text-xs text-primary hover:underline">Edytuj</Link>
                        <button onClick={() => deleteExpense(e.id)} className="text-xs text-destructive hover:underline">Usuń</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t">
                    <td colSpan={2} className="pt-2 text-sm font-semibold">Razem</td>
                    <td className="pt-2 text-right text-sm font-semibold">{formatPLN(localExpenses.reduce((s, e) => s + e.amount_grosz, 0))}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Podsumowanie miesięczne — Q{quarter} {year}</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="pb-2 text-left font-medium">Miesiąc</th>
                <th className="pb-2 text-right font-medium">Przychód</th>
                <th className="pb-2 text-right font-medium">Koszty</th>
                <th className="pb-2 text-right font-medium">% limitu mies.</th>
              </tr>
            </thead>
            <tbody>
              {summary.monthly.map((m) => {
                const pct = Math.min(100, (m.income_grosz / 360_000) * 100);
                return (
                  <tr key={m.month} className="border-b last:border-0">
                    <td className="py-2 font-medium">{MONTHS_PL[m.month - 1]}</td>
                    <td className="py-2 text-right">{formatPLN(m.income_grosz)}</td>
                    <td className="py-2 text-right text-muted-foreground">{formatPLN(m.expenses_grosz)}</td>
                    <td className="py-2 text-right">
                      <span className={pct >= 90 ? "text-red-600 font-semibold" : pct >= 70 ? "text-yellow-600" : "text-green-600"}>
                        {pct.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
