import { Pool } from "pg";

// Vercel Postgres / Neon expose the connection string as POSTGRES_URL.
// Neon's Vercel integration sometimes prefixes it with your project name
// (e.g. "myapp_DATABASE_URL") instead of the plain POSTGRES_URL/DATABASE_URL.
// Check the plain names first, then fall back to scanning for any prefixed
// variant so a prefix change in the dashboard doesn't silently break this.
function resolveConnectionString() {
  if (process.env.POSTGRES_URL) return process.env.POSTGRES_URL;
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const prefixedKey = Object.keys(process.env).find((key) =>
    /_(POSTGRES_URL|DATABASE_URL)$/i.test(key)
  );
  if (prefixedKey) return process.env[prefixedKey];

  return undefined;
}

const connectionString = resolveConnectionString();

if (!connectionString) {
  console.warn(
    "No POSTGRES_URL or DATABASE_URL environment variable set. Database calls will fail."
  );
}

declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

export const pool =
  global._pgPool ||
  new Pool({
    connectionString,
    ssl: connectionString?.includes("localhost")
      ? false
      : { rejectUnauthorized: false }
  });

if (process.env.NODE_ENV !== "production") {
  global._pgPool = pool;
}

export async function query<T = any>(text: string, params?: any[]) {
  const result = await pool.query(text, params);
  return result.rows as T[];
}
