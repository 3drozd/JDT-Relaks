import { requireAdmin } from "@/lib/admin-auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { ExpenseForm } from "@/components/admin/expense-form";

export default async function NewExpensePage() {
  await requireAdmin();
  return (
    <div className="min-h-screen bg-muted/30">
      <AdminHeader />
      <div className="mx-auto max-w-xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">Dodaj koszt</h1>
        <ExpenseForm />
      </div>
    </div>
  );
}
