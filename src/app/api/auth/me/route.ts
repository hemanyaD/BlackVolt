import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/auth/me — the signed-in user, or { user: null }. */
export async function GET() {
  const user = await currentUser();
  return NextResponse.json({ user });
}
