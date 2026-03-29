import { requireAdmin } from "@/lib/admin-auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { ExpenseForm } from "@/components/admin/expense-form";
import { getExpenseById } from "@/lib/supabase/accounting-queries";

export default async function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const expense = await getExpenseById(id);

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader />
      <div className="mx-auto max-w-xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">Edytuj koszt</h1>
        <ExpenseForm expense={expense} />
      </div>
    </div>
  );
}
