import { NextResponse } from "next/server";
import { listInventory } from "@/lib/db";
import { isAdminRequest } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/inventory — list stock for every SKU (admin only). */
export function GET(req: Request) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ inventory: listInventory() });
}
