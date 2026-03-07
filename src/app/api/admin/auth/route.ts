import { NextRequest, NextResponse } from "next/server";
import { setAdminSession, clearAdminSession } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { message: "ADMIN_PASSWORD nie jest skonfigurowane." },
      { status: 500 }
    );
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { message: "Nieprawidłowe hasło." },
      { status: 401 }
    );
  }

  await setAdminSession();
  return NextResponse.json({ success: true });
}

export async function DELETE() {
  await clearAdminSession();
  return NextResponse.json({ success: true });
}
