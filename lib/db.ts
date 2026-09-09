import { Pool } from "pg";

// Vercel Postgres / Neon expose the connection string as POSTGRES_URL.
// Fall back to DATABASE_URL for other Postgres providers.
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

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
