import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireAdmin(): Promise<void> {
  const session = await auth();
  if (!session) {
    redirect("/admin/login");
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const session = await auth();
  return !!session;
}
