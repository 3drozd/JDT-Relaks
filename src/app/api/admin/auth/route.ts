import { NextResponse } from "next/server";
import { signOut } from "@/auth";

export async function DELETE() {
  await signOut();
  return NextResponse.json({ success: true });
}
