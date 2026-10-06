import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { asUser, createTestDb } from "./harness";

let t: Awaited<ReturnType<typeof createTestDb>>;
const A = { auth: randomUUID(), id: "" };
const B = { auth: randomUUID(), id: "" };

beforeAll(async () => {
  t = await createTestDb();
  const db = t.db;
  await db.query(`insert into auth.users (id, email) values ($1,'a@test.local'), ($2,'b@test.local')`, [A.auth, B.auth]);
  const { rows: [inst] } = await db.query(`insert into institutions (code, name) values ('rls-inst','RLS') returning id`);
  for (const [who, email] of [[A, "a@test.local"], [B, "b@test.local"]] as const) {
    const { rows: [l] } = await db.query(
      `insert into learners (institution_id, email, full_name, auth_user_id, status, consent_at)
       values ($1,$2,$2,$3,'active',now()) returning id`, [inst.id, email, who.auth]);
    who.id = l.id;
    await db.query(`insert into test_attempt (learner_id, part, responses) values ($1,'psychometric','{"R01":"5"}')`, [l.id]);
    await db.query(`insert into learner_profile (learner_id, profile_version, attributes, confidence) values ($1,1,'{"riasec":{}}','high')`, [l.id]);
    await db.query(
      `insert into recommendation (rec_id, learner_id, inputs, ranked_output, result) values ($1,$2,'{}','[]','{}')`,
      [`rec_${email[0]}`, l.id]);
  }
});
afterAll(async () => { await t?.drop(); });

describe("security · RLS learner isolation", () => {
  it("learner A reads their own rows", async () => {
    await asUser(t.db, A.auth, async () => {
      const me = await t.db.query(`select id from learners`);
      expect(me.rows.map((r) => r.id)).toEqual([A.id]);
      expect((await t.db.query(`select 1 from learner_profile`)).rowCount).toBe(1);
      expect((await t.db.query(`select 1 from test_attempt`)).rowCount).toBe(1);
      expect((await t.db.query(`select 1 from recommendation`)).rowCount).toBe(1);
    });
  });

  it("learner A fails to read learner B", async () => {
    await asUser(t.db, A.auth, async () => {
      for (const table of ["learners", "test_attempt", "learner_profile", "recommendation"]) {
        const col = table === "learners" ? "id" : "learner_id";
        const r = await t.db.query(`select * from ${table} where ${col} = $1`, [B.id]);
        expect(r.rowCount, table).toBe(0);
      }
    });
  });

  it("learner A cannot write anything, even their own rows", async () => {
    await asUser(t.db, A.auth, async () => {
      await expect(t.db.query(`update learners set full_name = 'x' where id = $1`, [A.id])).rejects.toThrow(/permission denied/);
    });
    await asUser(t.db, A.auth, async () => {
      await expect(t.db.query(
        `insert into test_attempt (learner_id, part) values ($1,'psychometric')`, [A.id])).rejects.toThrow(/permission denied/);
    });
  });

  it("anonymous users read nothing", async () => {
    await asUser(t.db, null, async () => {
      await expect(t.db.query(`select * from learners`)).rejects.toThrow(/permission denied/);
    });
  });

  it("quiz answer keys and audit log are never readable by a learner", async () => {
    await asUser(t.db, A.auth, async () => {
      expect((await t.db.query(`select * from quiz_questions`)).rowCount).toBe(0);
      expect((await t.db.query(`select * from audit_log`)).rowCount).toBe(0);
      expect((await t.db.query(`select * from back_office_users`)).rowCount).toBe(0);
    });
  });

  it("no hard deletes on learner, attempt or certificate rows, even for the service role", async () => {
    await expect(t.db.query(`delete from learners where id = $1`, [B.id])).rejects.toThrow(/hard delete is not allowed/);
    await expect(t.db.query(`delete from test_attempt where learner_id = $1`, [B.id])).rejects.toThrow(/hard delete is not allowed/);
  });
});
