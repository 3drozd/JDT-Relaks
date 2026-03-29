import { requireAdmin } from "@/lib/admin-auth";
import { AdminHeader } from "@/components/admin/admin-header";
import {
  getAccountingSummary,
  getStripeSalesForPeriod,
  getManualSalesForPeriod,
  getExpensesForPeriod,
} from "@/lib/supabase/accounting-queries";
import { AccountingDashboard } from "@/components/admin/accounting-dashboard";

function getCurrentQuarter() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    quarter: Math.ceil((now.getMonth() + 1) / 3),
  };
}

function getQuarterRange(year: number, quarter: number) {
  const startMonth = (quarter - 1) * 3 + 1;
  const endMonth = startMonth + 2;
  const start = `${year}-${String(startMonth).padStart(2, "0")}-01`;
  const lastDay = new Date(year, endMonth, 0).getDate();
  const end = `${year}-${String(endMonth).padStart(2, "0")}-${lastDay}`;
  return { start, end };
}

export default async function AccountingPage() {
  await requireAdmin();

  const { year, quarter } = getCurrentQuarter();
  const { start, end } = getQuarterRange(year, quarter);

  const [summary, stripeSales, manualSales, expenses] = await Promise.all([
    getAccountingSummary(year, quarter),
    getStripeSalesForPeriod(start, end),
    getManualSalesForPeriod(start, end),
    getExpensesForPeriod(start, end),
  ]);

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Księgowość</h1>
            <p className="text-sm text-muted-foreground">Działalność nierejestrowana</p>
          </div>
        </div>
        <AccountingDashboard
          summary={summary}
          stripeSales={stripeSales}
          manualSales={manualSales}
          expenses={expenses}
          year={year}
          quarter={quarter}
        />
      </div>
    </div>
  );
}
