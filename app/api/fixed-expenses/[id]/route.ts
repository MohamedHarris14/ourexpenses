import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const fixedExpenseId = Number(params.id);
  const { year, month, checked, actualAmount } = await req.json();

  if (!Number.isInteger(fixedExpenseId) || !year || !month) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const rows = await query(
    `INSERT INTO fixed_expense_status (fixed_expense_id, year, month, checked, actual_amount)
     VALUES ($1, $2, $3, COALESCE($4, FALSE), COALESCE($5, 0))
     ON CONFLICT (fixed_expense_id, year, month)
     DO UPDATE SET
       checked = COALESCE($4, fixed_expense_status.checked),
       actual_amount = COALESCE($5, fixed_expense_status.actual_amount)
     RETURNING fixed_expense_id, year, month, checked, actual_amount`,
    [fixedExpenseId, year, month, checked, actualAmount]
  );

  return NextResponse.json(rows[0]);
}
