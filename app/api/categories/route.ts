import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await query("SELECT id, name, icon FROM categories ORDER BY id ASC");
  return NextResponse.json(rows);
}
