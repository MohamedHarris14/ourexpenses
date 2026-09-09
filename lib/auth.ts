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

function toBase64Url(bytes: ArrayBuffer | Uint8Array) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (let i = 0; i < arr.length; i++) binary += String.fromCharCode(arr[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(input: string) {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function getHmacKey() {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function sign(data: string) {
  const key = await getHmacKey();
  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return toBase64Url(signature);
}

export async function createSessionToken(payload: Omit<SessionPayload, "exp">) {
  const full: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS
  };
  const body = toBase64Url(new TextEncoder().encode(JSON.stringify(full)));
  const signature = await sign(body);
  return `${body}.${signature}`;
}

export async function verifySessionToken(
  token: string | undefined | null
): Promise<SessionPayload | null> {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = await sign(body);
  if (expected.length !== signature.length) return null;

  // Constant-time-ish comparison
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  if (mismatch !== 0) return null;

  try {
    const payload: SessionPayload = JSON.parse(new TextDecoder().decode(fromBase64Url(body)));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(req: NextRequest): Promise<SessionPayload | null> {
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
