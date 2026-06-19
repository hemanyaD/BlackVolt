import { NextResponse } from "next/server";
import { updateInventory } from "@/lib/db";
import { isAdminRequest } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** PATCH /api/inventory/[slug] — set stock / threshold (admin only). */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!isAdminRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { slug } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const b = body as Record<string, unknown>;

  const patch: { stock?: number; lowStockThreshold?: number } = {};
  if (b.stock !== undefined) {
    const n = Number(b.stock);
    if (!Number.isFinite(n)) {
      return NextResponse.json({ error: "Invalid stock" }, { status: 400 });
    }
    patch.stock = n;
  }
  if (b.lowStockThreshold !== undefined) {
    const n = Number(b.lowStockThreshold);
    if (!Number.isFinite(n)) {
      return NextResponse.json({ error: "Invalid threshold" }, { status: 400 });
    }
    patch.lowStockThreshold = n;
  }

  const updated = updateInventory(slug, patch);
  if (!updated) {
    return NextResponse.json({ error: "SKU not found" }, { status: 404 });
  }
  return NextResponse.json({ item: updated });
}
