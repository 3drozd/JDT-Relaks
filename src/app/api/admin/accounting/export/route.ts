import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getStripeSalesForPeriod, getManualSalesForPeriod } from "@/lib/supabase/accounting-queries";

function getQuarterRange(year: number, quarter: number) {
  const startMonth = (quarter - 1) * 3 + 1;
  const endMonth = startMonth + 2;
  const start = `${year}-${String(startMonth).padStart(2, "0")}-01`;
  const lastDay = new Date(year, endMonth, 0).getDate();
  const end = `${year}-${String(endMonth).padStart(2, "0")}-${lastDay}`;
  return { start, end };
}

export async function GET(req: NextRequest) {
  if (!(await isAdminAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()));
  const quarter = parseInt(searchParams.get("quarter") ?? String(Math.ceil((new Date().getMonth() + 1) / 3)));

  const { start, end } = getQuarterRange(year, quarter);
  const [stripe, manual] = await Promise.all([
    getStripeSalesForPeriod(start, end),
    getManualSalesForPeriod(start, end),
  ]);

  const allSales = [
    ...stripe.map((s) => ({ ...s, source: "Stripe (online)" })),
    ...manual.map((s) => ({ ...s, source: "Ręczna" })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  const header = "Data,Opis,Klient,Email,Kwota (PLN),Źródło\n";
  const rows = allSales
    .map((s) => {
      const amount = (s.amount_grosz / 100).toFixed(2).replace(".", ",");
      const email = ("client_email" in s ? s.client_email : "") ?? "";
      return [s.date, `"${s.description}"`, `"${s.client_name}"`, email, amount, s.source].join(",");
    })
    .join("\n");

  // UTF-8 BOM for Excel
  const bom = "\uFEFF";
  const csv = bom + header + rows;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="sprzedaz_${year}_Q${quarter}.csv"`,
    },
  });
}
