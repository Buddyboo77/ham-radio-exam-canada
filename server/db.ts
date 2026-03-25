import pkg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

const { Pool } = pkg;

// Prefer REPLIT_DATABASE_URL (Replit's built-in PostgreSQL) over the legacy
// DATABASE_URL which may point to an expired external Neon database.
const connectionString =
  process.env.REPLIT_DATABASE_URL ||
  process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "No database connection string found. Ensure the database is provisioned.",
  );
}

export const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });