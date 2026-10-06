/* npm run seed — seeds the database in DATABASE_URL. Idempotent. */
import { Client } from "pg";
import { createClient } from "@supabase/supabase-js";
import { SEED, seed } from "./seed-data";

async function backOfficeAuthUser(): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.log("No Supabase keys set: back-office row created without a login (link it later).");
    return null;
  }
  const sb = createClient(url, key, { auth: { persistSession: false } });
  const password = process.env.SEED_BACK_OFFICE_PASSWORD;
  if (!password || password.length < 12) throw new Error("Set SEED_BACK_OFFICE_PASSWORD (12+ characters).");
  const { data: list } = await sb.auth.admin.listUsers();
  const existing = list?.users.find((u) => u.email === SEED.backOfficeEmail);
  if (existing) return existing.id;
  const { data, error } = await sb.auth.admin.createUser({
    email: SEED.backOfficeEmail, password, email_confirm: true, app_metadata: { role: "back_office" },
  });
  if (error) throw error;
  return data.user.id;
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Set DATABASE_URL.");
  const authId = await backOfficeAuthUser();
  const db = new Client({ connectionString: url });
  await db.connect();
  try {
    await db.query("begin");
    const r = await seed(db, { backOfficeAuthUserId: authId });
    await db.query("commit");
    console.log(`Seeded. New learners: ${r.learnersCreated}. Catalogue version bumped: ${r.catalogueBumped}. Skill edges: ${r.edges}.`);
  } catch (e) {
    await db.query("rollback");
    throw e;
  } finally {
    await db.end();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
