import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { updateUserProfile } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** PATCH /api/me — update the signed-in user's profile / saved address. */
export async function PATCH(req: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const b = body as Record<string, unknown>;

  const patch: Record<string, string> = {};
  for (const key of ["name", "phone", "address", "city", "pincode"] as const) {
    if (b[key] !== undefined) patch[key] = String(b[key]);
  }

  const updated = updateUserProfile(user.id, patch);
  return NextResponse.json({ user: updated });
}
