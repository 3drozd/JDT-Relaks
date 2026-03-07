import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";

const COOKIE_NAME = "admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours

function getSecret(): string {
  return process.env.ADMIN_PASSWORD || "";
}

function createToken(): string {
  const timestamp = Date.now().toString();
  const hmac = crypto
    .createHmac("sha256", getSecret())
    .update(timestamp)
    .digest("hex");
  return `${timestamp}.${hmac}`;
}

function verifyToken(token: string): boolean {
  const [timestamp, hmac] = token.split(".");
  if (!timestamp || !hmac) return false;
  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(timestamp)
    .digest("hex");
  if (hmac.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(expected));
}

export async function setAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, createToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function requireAdmin(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token || !verifyToken(token)) {
    redirect("/admin/login");
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return !!token && verifyToken(token);
}
