import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  return NextResponse.json({ name: session.name, role: session.role });
}
