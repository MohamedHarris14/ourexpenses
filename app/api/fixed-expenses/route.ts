import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const year = Number(searchParams.get("year"));
  const month = Number(searchParams.get("month")); // 1-12

  if (!year || !month) {
    return NextResponse.json({ error: "year and month query params are required" }, { status: 400 });
  }

  const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;

  // actual_amount is computed live from the expenses actually logged for this
  // category in this month, rather than typed in manually — so it always
  // matches what's in the Entries table below.
  const rows = await query(
    `SELECT fe.id, fe.section, fe.budget_amount, fe.sort_order,
            c.name AS category, c.icon AS category_icon,
            COALESCE(fes.checked, FALSE) AS checked,
            COALESCE(spent.total, 0) AS actual_amount
     FROM fixed_expenses fe
     JOIN categories c ON c.id = fe.category_id
     LEFT JOIN fixed_expense_status fes
       ON fes.fixed_expense_id = fe.id AND fes.year = $2 AND fes.month = $3
     LEFT JOIN (
       SELECT category_id, SUM(amount) AS total
       FROM expenses
       WHERE date >= $1::date AND date < ($1::date + INTERVAL '1 month')
       GROUP BY category_id
     ) spent ON spent.category_id = fe.category_id
     ORDER BY fe.sort_order ASC`,
    [monthStart, year, month]
  );

  return NextResponse.json(rows);
}
