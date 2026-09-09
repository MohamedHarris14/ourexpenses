import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

// Only the "paid" checkbox is stored here now — the actual amount spent is
// always computed live from the expenses table (see the GET route).
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const fixedExpenseId = Number(params.id);
  const { year, month, checked } = await req.json();

  if (!Number.isInteger(fixedExpenseId) || !year || !month || typeof checked !== "boolean") {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const rows = await query(
    `INSERT INTO fixed_expense_status (fixed_expense_id, year, month, checked)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (fixed_expense_id, year, month)
     DO UPDATE SET checked = $4
     RETURNING fixed_expense_id, year, month, checked`,
    [fixedExpenseId, year, month, checked]
  );

  return NextResponse.json(rows[0]);
}
