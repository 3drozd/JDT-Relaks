import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createExpense, getExpensesForPeriod } from "@/lib/supabase/accounting-queries";

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start") ?? new Date().toISOString().slice(0, 7) + "-01";
  const end = searchParams.get("end") ?? new Date().toISOString().slice(0, 10);
  const data = await getExpensesForPeriod(start, end);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const { date, description, amount_grosz, receipt_url } = body;
  if (!date || !description || !amount_grosz) {
    return NextResponse.json({ error: "Brakuje wymaganych pól" }, { status: 400 });
  }
  const expense = await createExpense({ date, description, amount_grosz, receipt_url });
  return NextResponse.json(expense, { status: 201 });
}
