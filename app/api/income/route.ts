import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET() {
  const rows = await query<{ id: number; amount: string; updated_at: string }>(
    "SELECT id, amount, updated_at FROM income ORDER BY id ASC LIMIT 1"
  );
  return NextResponse.json(rows[0] || { amount: 0 });
}

export async function PUT(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (session?.role !== "primary") {
    return NextResponse.json(
      { error: "Only the primary account can edit income" },
      { status: 403 }
    );
  }

  const { amount } = await req.json();
  if (typeof amount !== "number" || amount < 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const existing = await query<{ id: number }>("SELECT id FROM income ORDER BY id ASC LIMIT 1");

  let row;
  if (existing.length > 0) {
    row = await query(
      "UPDATE income SET amount = $1, updated_at = NOW() WHERE id = $2 RETURNING id, amount, updated_at",
      [amount, existing[0].id]
    );
  } else {
    row = await query(
      "INSERT INTO income (amount) VALUES ($1) RETURNING id, amount, updated_at",
      [amount]
    );
  }

  return NextResponse.json(row[0]);
}
