import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const rows = await query("SELECT id, name, icon FROM categories ORDER BY name ASC");
  return NextResponse.json(rows);
}
