import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { listOrdersByUser } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/my-orders — the signed-in user's order history. */
export async function GET() {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  return NextResponse.json({ orders: listOrdersByUser(user.id) });
}
