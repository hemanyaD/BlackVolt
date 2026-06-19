/**
 * Server-side session helpers for customer auth. Import only from route
 * handlers / server components — it reads the cookie store and the DB.
 *
 * A session is an opaque random token stored in an httpOnly cookie and looked
 * up in the `sessions` table. `currentUser()` resolves the signed-in user (or
 * null); the route handlers set/clear the cookie on their NextResponse.
 */
import { cookies } from "next/headers";
import { getSessionUser } from "@/lib/db";
import type { User } from "@/types";

export const SESSION_COOKIE = "blackvolt_session";
/** Cookie lifetime in seconds (30 days), matching the DB session TTL. */
export const SESSION_MAX_AGE = 30 * 24 * 60 * 60;

/** Cookie options for the session token. httpOnly so JS can't read it. */
export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE,
  secure: process.env.NODE_ENV === "production",
};

/** The signed-in user for the current request, or null. */
export async function currentUser(): Promise<User | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return getSessionUser(token);
}
