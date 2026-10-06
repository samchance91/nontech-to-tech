import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { randomBytes } from "node:crypto";
import { Client } from "pg";

/**
 * Throwaway database per test file: Supabase shim + every migration in order.
 * Needs DATABASE_URL_TEST pointing at a Postgres superuser connection (CI: the postgres service).
 */
export const ADMIN_URL = process.env.DATABASE_URL_TEST ?? "postgresql://postgres:postgres@localhost:5432/postgres";
export const hasDb = async () => {
  const c = new Client({ connectionString: ADMIN_URL });
  try { await c.connect(); await c.end(); return true; } catch { return false; }
};

const root = join(__dirname, "..", "..");
export const migrationFiles = () =>
  readdirSync(join(root, "supabase", "migrations")).filter((f) => f.endsWith(".sql")).sort()
    .map((f) => join(root, "supabase", "migrations", f));

export async function createTestDb() {
  const name = `saa_t_${randomBytes(4).toString("hex")}`;
  const admin = new Client({ connectionString: ADMIN_URL });
  await admin.connect();
  await admin.query(`create database ${name}`);
  await admin.end();
  const url = new URL(ADMIN_URL);
  url.pathname = `/${name}`;
  const db = new Client({ connectionString: url.toString() });
  await db.connect();
  await db.query(readFileSync(join(root, "tests", "db", "supabase-shim.sql"), "utf8"));
  for (const f of migrationFiles()) await db.query(readFileSync(f, "utf8"));
  return {
    db,
    url: url.toString(),
    async drop() {
      await db.end();
      const a = new Client({ connectionString: ADMIN_URL });
      await a.connect();
      await a.query(`drop database if exists ${name} with (force)`);
      await a.end();
    },
  };
}

/** Run fn as a Supabase "authenticated" user with the given auth uid, inside a rolled-back transaction. */
export async function asUser<T>(db: Client, uid: string | null, fn: () => Promise<T>): Promise<T> {
  await db.query("begin");
  try {
    await db.query(uid ? "set local role authenticated" : "set local role anon");
    await db.query("select set_config('request.jwt.claims', $1, true)", [JSON.stringify(uid ? { sub: uid, role: "authenticated" } : {})]);
    return await fn();
  } finally {
    await db.query("rollback");
  }
}
