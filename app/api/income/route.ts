import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = Number(searchParams.get("year"));
  const month = Number(searchParams.get("month")); // 1-12

  if (!year || !month) {
    return NextResponse.json({ error: "year and month query params are required" }, { status: 400 });
  }

  const rows = await query<{ id: number; amount: string; updated_at: string }>(
    "SELECT id, amount, updated_at FROM income WHERE year = $1 AND month = $2 LIMIT 1",
    [year, month]
  );
  return NextResponse.json(rows[0] || { amount: 0 });
}

export async function PUT(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (session?.role !== "primary") {
    return NextResponse.json(
      { error: "Only the primary account can edit income" },
      { status: 403 }
    );
  }

  const { year, month, amount } = await req.json();
  if (!year || !month) {
    return NextResponse.json({ error: "year and month are required" }, { status: 400 });
  }
  if (typeof amount !== "number" || amount < 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const row = await query(
    `INSERT INTO income (year, month, amount, updated_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (year, month)
     DO UPDATE SET amount = $3, updated_at = NOW()
     RETURNING id, amount, updated_at`,
    [year, month, amount]
  );

  return NextResponse.json(row[0]);
}
