import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTestDb } from "./harness";

let t: Awaited<ReturnType<typeof createTestDb>>;
beforeAll(async () => { t = await createTestDb(); });
afterAll(async () => { await t?.drop(); });

describe("phase 0 · schema", () => {
  it("every migration applies and every PRD table exists", async () => {
    const { rows } = await t.db.query<{ tablename: string }>(`select tablename from pg_tables where schemaname = 'public'`);
    const names = rows.map((r) => r.tablename);
    const expected = [
      // PRD-recommendation section 8
      "taxonomy", "skill_statement", "course_meta", "pathway_meta", "skill_edge", "test_item", "test_attempt",
      "learner_profile", "engine_config", "recommendation", "recommendation_action",
      // platform
      "institutions", "cohorts", "learners", "back_office_users", "roster_uploads", "invites", "password_resets",
      "email_outbox", "courses", "modules", "items", "quiz_questions", "quiz_attempts", "item_progress",
      "pathways", "pathway_courses", "pathway_assignments", "course_completions", "pathway_completions",
      "certificates", "audit_log", "analytics_events", "catalogue_versions",
    ];
    for (const n of expected) expect(names, n).toContain(n);
  });

  it("RLS is enabled and forced on every public table (default deny)", async () => {
    const { rows } = await t.db.query<{ relname: string; on: boolean; forced: boolean }>(
      `select c.relname, c.relrowsecurity as on, c.relforcerowsecurity as forced
       from pg_class c join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public' and c.relkind = 'r'`);
    expect(rows.length).toBeGreaterThan(30);
    for (const r of rows) {
      expect(r.on, r.relname).toBe(true);
      expect(r.forced, r.relname).toBe(true);
    }
  });

  it("learner profile has no gender, caste, religion, disability or location column", async () => {
    const { rows } = await t.db.query<{ column_name: string }>(
      `select column_name from information_schema.columns
       where table_schema = 'public' and table_name in ('learners', 'learner_profile')`);
    const cols = rows.map((r) => r.column_name).join(" ");
    expect(cols).not.toMatch(/gender|caste|religion|disab|location|city|state|pincode/i);
  });

  it("only one pathway can be the default", async () => {
    await t.db.query(`insert into pathways (pathway_id, name) values ('pw_one','One'), ('pw_two','Two')`);
    await t.db.query(`insert into pathway_meta (pathway_id, career_outcomes, is_default) values ('pw_one', '{x}', true)`);
    await expect(
      t.db.query(`insert into pathway_meta (pathway_id, career_outcomes, is_default) values ('pw_two', '{x}', true)`),
    ).rejects.toThrow(/duplicate key/);
  });

  it("certificate ids must be SAA-YYYY- plus 8 base32 chars without 0, O, 1, I", async () => {
    const bad = ["SAA-2026-ABCDEFG0", "SAA-2026-ABCDEFGO", "SAA-2026-ABCDEFG1", "SAA-2026-ABCDEFGI", "SAA-26-ABCDEFGH"];
    for (const id of bad) {
      await expect(t.db.query(
        `insert into certificates (id, learner_id, pathway_completion_id, learner_name, pathway_name)
         values ($1, gen_random_uuid(), gen_random_uuid(), 'x', 'y')`, [id]), id).rejects.toThrow(/check constraint/);
    }
  });

  it("exactly one active pathway assignment per learner", async () => {
    const { rows: [i] } = await t.db.query(`insert into institutions (code, name) values ('inst-x','X') returning id`);
    const { rows: [l] } = await t.db.query(
      `insert into learners (institution_id, email, full_name) values ($1,'x@test.local','X') returning id`, [i.id]);
    await t.db.query(`insert into pathway_assignments (learner_id, pathway_id, source) values ($1,'pw_one','override')`, [l.id]);
    await expect(t.db.query(
      `insert into pathway_assignments (learner_id, pathway_id, source) values ($1,'pw_two','override')`, [l.id],
    )).rejects.toThrow(/duplicate key/);
  });

  it("an active learner must have a consent timestamp", async () => {
    const { rows: [i] } = await t.db.query(`insert into institutions (code, name) values ('inst-y','Y') returning id`);
    await expect(t.db.query(
      `insert into learners (institution_id, email, full_name, status) values ($1,'y@test.local','Y','active')`, [i.id],
    )).rejects.toThrow(/check constraint/);
  });

  it("an override action needs a reason", async () => {
    const { rows: [i] } = await t.db.query(`insert into institutions (code, name) values ('inst-z','Z') returning id`);
    const { rows: [l] } = await t.db.query(
      `insert into learners (institution_id, email, full_name) values ($1,'z@test.local','Z') returning id`, [i.id]);
    await expect(t.db.query(
      `insert into recommendation_action (learner_id, action, actor) values ($1,'override','ops@x')`, [l.id],
    )).rejects.toThrow(/check constraint/);
  });
});
