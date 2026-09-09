import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month"); // format: YYYY-MM
  const category = searchParams.get("category");
  const paidBy = searchParams.get("paidBy");
  const paymentMethod = searchParams.get("paymentMethod");
  const search = searchParams.get("search");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  const conditions: string[] = [];
  const params: any[] = [];

  if (month) {
    params.push(`${month}-01`);
    conditions.push(
      `date >= $${params.length}::date AND date < ($${params.length}::date + INTERVAL '1 month')`
    );
  }
  if (dateFrom) {
    params.push(dateFrom);
    conditions.push(`date >= $${params.length}::date`);
  }
  if (dateTo) {
    params.push(dateTo);
    conditions.push(`date <= $${params.length}::date`);
  }
  if (category && category !== "all") {
    params.push(category);
    conditions.push(`c.name = $${params.length}`);
  }
  if (paidBy && paidBy !== "all") {
    params.push(paidBy);
    conditions.push(`e.paid_by = $${params.length}`);
  }
  if (paymentMethod && paymentMethod !== "all") {
    params.push(paymentMethod);
    conditions.push(`e.payment_method = $${params.length}`);
  }
  if (search) {
    params.push(`%${search}%`);
    conditions.push(`e.description ILIKE $${params.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const rows = await query(
    `SELECT e.id, e.date, e.description, e.amount, e.payment_method, e.paid_by,
            c.name AS category, c.icon AS category_icon
     FROM expenses e
     JOIN categories c ON c.id = e.category_id
     ${whereClause}
     ORDER BY e.date DESC, e.id DESC`,
    params
  );

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { date, description, categoryId, amount, paymentMethod } = await req.json();

  if (!date || !categoryId || !amount || !paymentMethod) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (typeof amount !== "number" || amount <= 0) {
    return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
  }

  const rows = await query(
    `INSERT INTO expenses (date, description, category_id, amount, payment_method, paid_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, date, description, amount, payment_method, paid_by`,
    [date, description || "", categoryId, amount, paymentMethod, session.name]
  );

  return NextResponse.json(rows[0], { status: 201 });
}
