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

  const rows = await query(
    `SELECT fe.id, fe.section, fe.budget_amount, fe.sort_order,
            c.name AS category, c.icon AS category_icon,
            COALESCE(fes.checked, FALSE) AS checked,
            COALESCE(fes.actual_amount, 0) AS actual_amount
     FROM fixed_expenses fe
     JOIN categories c ON c.id = fe.category_id
     LEFT JOIN fixed_expense_status fes
       ON fes.fixed_expense_id = fe.id AND fes.year = $1 AND fes.month = $2
     ORDER BY fe.sort_order ASC`,
    [year, month]
  );

  return NextResponse.json(rows);
}
