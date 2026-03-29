import { createServerClient } from "./server";
import type { AccountingSale, AccountingExpense, StripeSale, AccountingSummary } from "@/types";

const QUARTER_LIMIT_GROSZ = 1_080_000; // 10 800 zł

function getQuarterRange(year: number, quarter: number): { start: string; end: string } {
  const startMonth = (quarter - 1) * 3 + 1;
  const endMonth = startMonth + 2;
  const start = `${year}-${String(startMonth).padStart(2, "0")}-01`;
  const lastDay = new Date(year, endMonth, 0).getDate();
  const end = `${year}-${String(endMonth).padStart(2, "0")}-${lastDay}`;
  return { start, end };
}

function getMonthRange(year: number, month: number): { start: string; end: string } {
  const lastDay = new Date(year, month, 0).getDate();
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const end = `${year}-${String(month).padStart(2, "0")}-${lastDay}`;
  return { start, end };
}

export async function getStripeSalesForPeriod(startDate: string, endDate: string): Promise<StripeSale[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("registrations")
    .select("id, paid_at, name, email, seats, event_id, events(name, price_amount)")
    .eq("payment_status", "paid")
    .gte("paid_at", startDate)
    .lte("paid_at", endDate + "T23:59:59")
    .order("paid_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((r) => {
    const event = (Array.isArray(r.events) ? r.events[0] : r.events) as { name: string; price_amount: number | null } | null;
    return {
      id: r.id,
      date: r.paid_at!.slice(0, 10),
      description: event?.name ?? "Koncert",
      client_name: r.name,
      client_email: r.email,
      amount_grosz: (event?.price_amount ?? 0) * r.seats,
      source: "stripe" as const,
    };
  });
}

export async function getManualSalesForPeriod(startDate: string, endDate: string): Promise<AccountingSale[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("accounting_sales")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false });

  if (error) throw error;
  return (data as AccountingSale[]) || [];
}

export async function getExpensesForPeriod(startDate: string, endDate: string): Promise<AccountingExpense[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("accounting_expenses")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false });

  if (error) throw error;
  return (data as AccountingExpense[]) || [];
}

export async function getAccountingSummary(year: number, quarter: number): Promise<AccountingSummary> {
  const { start, end } = getQuarterRange(year, quarter);

  const [stripeSales, manualSales] = await Promise.all([
    getStripeSalesForPeriod(start, end),
    getManualSalesForPeriod(start, end),
  ]);

  const startMonth = (quarter - 1) * 3 + 1;
  const monthly = await Promise.all(
    [0, 1, 2].map(async (i) => {
      const month = startMonth + i;
      const range = getMonthRange(year, month);
      const [ms, mm, exp] = await Promise.all([
        getStripeSalesForPeriod(range.start, range.end),
        getManualSalesForPeriod(range.start, range.end),
        getExpensesForPeriod(range.start, range.end),
      ]);
      return {
        month,
        income_grosz: ms.reduce((s, r) => s + r.amount_grosz, 0) + mm.reduce((s, r) => s + r.amount_grosz, 0),
        expenses_grosz: exp.reduce((s, r) => s + r.amount_grosz, 0),
      };
    })
  );

  const income_grosz =
    stripeSales.reduce((s, r) => s + r.amount_grosz, 0) +
    manualSales.reduce((s, r) => s + r.amount_grosz, 0);

  return { quarter, year, income_grosz, limit_grosz: QUARTER_LIMIT_GROSZ, monthly };
}

export async function createManualSale(input: {
  date: string;
  description: string;
  client_name: string;
  client_email?: string;
  amount_grosz: number;
}): Promise<AccountingSale> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("accounting_sales")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as AccountingSale;
}

export async function deleteManualSale(id: string): Promise<void> {
  const supabase = createServerClient();
  const { error } = await supabase.from("accounting_sales").delete().eq("id", id);
  if (error) throw error;
}

export async function createExpense(input: {
  date: string;
  description: string;
  amount_grosz: number;
  receipt_url?: string;
}): Promise<AccountingExpense> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("accounting_expenses")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as AccountingExpense;
}

export async function updateExpense(id: string, input: {
  date?: string;
  description?: string;
  amount_grosz?: number;
  receipt_url?: string | null;
}): Promise<AccountingExpense> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("accounting_expenses")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as AccountingExpense;
}

export async function deleteExpense(id: string): Promise<void> {
  const supabase = createServerClient();
  const { error } = await supabase.from("accounting_expenses").delete().eq("id", id);
  if (error) throw error;
}

export async function getExpenseById(id: string): Promise<AccountingExpense> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("accounting_expenses")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as AccountingExpense;
}
