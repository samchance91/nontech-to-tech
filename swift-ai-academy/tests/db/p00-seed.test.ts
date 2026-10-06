import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTestDb } from "./harness";
import { seed } from "@/scripts/seed-data";

let t: Awaited<ReturnType<typeof createTestDb>>;
beforeAll(async () => { t = await createTestDb(); });
afterAll(async () => { await t?.drop(); });
const count = async (sql: string) => Number((await t.db.query(sql)).rows[0].n);

describe("phase 0 · npm run seed", () => {
  it("creates 2 institutions, 50 learners, 1 back-office user and the fixtures", async () => {
    const r = await seed(t.db);
    expect(r.learnersCreated).toBe(50);
    expect(await count(`select count(*) n from institutions`)).toBe(2);
    expect(await count(`select count(*) n from learners`)).toBe(50);
    expect(await count(`select count(*) n from back_office_users`)).toBe(1);
    expect(await count(`select count(*) n from courses where not internal_only`)).toBe(9);
    expect(await count(`select count(*) n from pathways where status = 'published'`)).toBe(3);
    expect(await count(`select count(*) n from pathway_meta where is_default`)).toBe(1);
    expect(await count(`select count(*) n from engine_config`)).toBe(1);
    expect(await count(`select count(*) n from catalogue_versions`)).toBe(1);
    expect(await count(`select count(*) n from skill_edge`)).toBeGreaterThan(0);
    expect(await count(`select count(*) n from test_item where part = 'psychometric'`)).toBe(20);
  });

  it("adds the Google AI Foundations test course flagged internal-only", async () => {
    const { rows } = await t.db.query(`select internal_only from courses where course_id = 'GAF'`);
    expect(rows[0].internal_only).toBe(true);
    expect(await count(`select count(*) n from skill_edge where 'GAF' in (from_course_id, to_course_id)`)).toBe(0);
  });

  it("covers all 7 disciplines and both learner types", async () => {
    expect(await count(`select count(distinct discipline) n from learners`)).toBe(7);
    expect(await count(`select count(distinct learner_type) n from learners`)).toBe(2);
  });

  it("is idempotent: a second run creates nothing and keeps the catalogue version", async () => {
    const r = await seed(t.db);
    expect(r.learnersCreated).toBe(0);
    expect(r.catalogueBumped).toBe(false);
    expect(await count(`select count(*) n from learners`)).toBe(50);
    expect(await count(`select count(*) n from catalogue_versions`)).toBe(1);
  });
});
