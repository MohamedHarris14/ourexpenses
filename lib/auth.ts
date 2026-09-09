import crypto from "crypto";
import { NextRequest } from "next/server";

export const SESSION_COOKIE = "oe_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

type SessionPayload = {
  name: string; // display name, e.g. "Harris"
  role: "primary" | "partner"; // primary = income editor, partner = expenses only
  exp: number;
};

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET environment variable is not set. Set it to a long random string."
    );
  }
  return secret;
}

function base64url(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function sign(data: string) {
  return base64url(crypto.createHmac("sha256", getSecret()).update(data).digest());
}

export function createSessionToken(payload: Omit<SessionPayload, "exp">) {
  const full: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS
  };
  const body = base64url(JSON.stringify(full));
  const signature = sign(body);
  return `${body}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = sign(body);
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null;
  }
  try {
    const payload: SessionPayload = JSON.parse(
      Buffer.from(body.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString()
    );
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getSessionFromRequest(req: NextRequest): SessionPayload | null {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

// Two accounts are configured entirely through environment variables so no
// database seeding is required for auth. "primary" can edit income; "partner"
// can add expenses but not edit income.
export function checkCredentials(username: string, password: string) {
  const normalized = username.trim().toLowerCase();

  const primaryUser = (process.env.PRIMARY_USERNAME || "harris").toLowerCase();
  const primaryPass = process.env.PRIMARY_PASSWORD || "";
  const primaryName = process.env.PRIMARY_NAME || "Harris";

  const partnerUser = (process.env.PARTNER_USERNAME || "wife").toLowerCase();
  const partnerPass = process.env.PARTNER_PASSWORD || "";
  const partnerName = process.env.PARTNER_NAME || "Wife";

  if (normalized === primaryUser && password.length > 0 && password === primaryPass) {
    return { name: primaryName, role: "primary" as const };
  }
  if (normalized === partnerUser && password.length > 0 && password === partnerPass) {
    return { name: partnerName, role: "partner" as const };
  }
  return null;
}

export const SESSION_COOKIE_MAX_AGE = SESSION_MAX_AGE_SECONDS;
