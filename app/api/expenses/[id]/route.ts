import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  await query("DELETE FROM expenses WHERE id = $1", [id]);
  return NextResponse.json({ ok: true });
}
