"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AdminHeader() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin/login");
  }

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:p-4">
        <span className="text-base sm:text-lg font-semibold">Panel administracyjny</span>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Wyloguj
        </Button>
      </div>
    </header>
  );
}
