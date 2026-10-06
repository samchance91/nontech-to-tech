import type { Client } from "pg";
import { buildSkillEdges } from "@/lib/catalogue/skill-edge";
import { buildSnapshot } from "@/lib/catalogue/snapshot";
import { validateCourseForPublish } from "@/lib/catalogue/validate";
import {
  loadCatalogue, loadEngineConfig, loadInternalCourses, loadSkillStatements, loadTaxonomy, loadTestItems,
} from "@/lib/catalogue/fixtures";

export const SEED = {
  institutions: [
    { code: "demo-college", name: "Demo College of Arts and Science", learnerType: "college", count: 30, prefix: "S" },
    { code: "demo-employer", name: "Demo Logistics Pvt Ltd", learnerType: "on_the_job", count: 20, prefix: "E" },
  ],
  backOfficeEmail: "ops@test.swiftai.local",
} as const;

const DISCIPLINES = ["arts_humanities", "commerce", "science", "engineering_it", "management", "vocational", "other"];
const COLLEGE_QUALS = ["ug_in_progress", "ug_in_progress", "ug_complete", "diploma_iti", "class_12", "pg"];
const WORK_QUALS = ["working", "ug_complete", "diploma_iti", "class_12"];

/**
 * Idempotent seed: running it twice changes nothing. Caller owns the transaction.
 * `backOfficeAuthUserId` is the Supabase auth user id when one was created via the admin API.
 */
export async function seed(db: Client, opts: { backOfficeAuthUserId?: string | null } = {}) {
  const taxonomy = loadTaxonomy();
  const statements = loadSkillStatements();
  const catalogue = loadCatalogue();
  const internal = loadInternalCourses();
  const config = loadEngineConfig();
  const items = loadTestItems();
  const allCourses = [...catalogue.courses, ...internal];

  // fixtures must themselves pass publish validation
  const ids = new Set(allCourses.map((c) => c.course_id));
  for (const c of allCourses) {
    const errs = validateCourseForPublish(c, taxonomy, ids);
    if (Object.keys(errs).length) throw new Error(`fixture course ${c.course_id} invalid: ${JSON.stringify(errs)}`);
  }

  // reference data
  for (const [type, rows] of Object.entries(taxonomy)) {
    let order = 0;
    for (const [code, label] of Object.entries(rows ?? {})) {
      await db.query(
        `insert into taxonomy (taxonomy_type, code, label, sort_order) values ($1,$2,$3,$4)
         on conflict (taxonomy_type, code) do update set label = excluded.label, sort_order = excluded.sort_order`,
        [type, code, label, order++]);
    }
  }
  for (const [tag, levels] of Object.entries(statements)) {
    for (let level = 0; level < 4; level++) {
      await db.query(
        `insert into skill_statement (skill_tag, level, statement_text) values ($1,$2,$3)
         on conflict (skill_tag, level) do update set statement_text = excluded.statement_text`,
        [tag, level, levels[level]]);
    }
  }
  await db.query(
    `insert into engine_config (version, config) values ($1,$2) on conflict (version) do nothing`,
    [config.version, config]);
  for (const it of [...items.learner_details, ...items.psychometric]) {
    await db.query(
      `insert into test_item (item_id, part, block, type, prompt, options, scoring_key, show_if, position, status)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       on conflict (item_id) do update set part=excluded.part, block=excluded.block, type=excluded.type,
         prompt=excluded.prompt, options=excluded.options, scoring_key=excluded.scoring_key,
         show_if=excluded.show_if, position=excluded.position, status=excluded.status`,
      [it.item_id, it.part, it.block, it.type, it.prompt, it.options,
       { ...it.scoring_key, ...(it.prefill ? { prefill: it.prefill } : {}) }, it.show_if ?? null, it.position, it.status]);
  }

  // catalogue
  for (const c of allCourses) {
    await db.query(
      `insert into courses (course_id, title, level, release_status, internal_only) values ($1,$2,$3,'complete',$4)
       on conflict (course_id) do update set title=excluded.title, level=excluded.level, internal_only=excluded.internal_only`,
      [c.course_id, c.title, c.level, c.internal_only]);
    const m = c.meta;
    await db.query(
      `insert into course_meta (course_id, prerequisites, eligible_qualifications, learning_outcomes, career_outcomes,
         domain, difficulty, orientation_tags, related_courses, est_hours)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       on conflict (course_id) do update set prerequisites=excluded.prerequisites,
         eligible_qualifications=excluded.eligible_qualifications, learning_outcomes=excluded.learning_outcomes,
         career_outcomes=excluded.career_outcomes, domain=excluded.domain, difficulty=excluded.difficulty,
         orientation_tags=excluded.orientation_tags, related_courses=excluded.related_courses, est_hours=excluded.est_hours`,
      [c.course_id, m.prerequisites, m.eligible_qualifications, JSON.stringify(m.learning_outcomes), m.career_outcomes,
       m.domain, m.difficulty, m.orientation_tags, m.related_courses, m.est_hours]);
    await db.query(
      `insert into modules (course_id, position, title, status, published_at) values ($1, 1, 'Module 1', 'published', now())
       on conflict (course_id, position) do nothing`, [c.course_id]);
  }
  for (const p of catalogue.pathways) {
    await db.query(
      `insert into pathways (pathway_id, name, status) values ($1,$2,'published')
       on conflict (pathway_id) do update set name = excluded.name, status = 'published'`, [p.pathway_id, p.name]);
    for (const [i, pc] of p.courses.entries()) {
      await db.query(
        `insert into pathway_courses (pathway_id, course_id, position, required) values ($1,$2,$3,$4)
         on conflict (pathway_id, course_id) do update set position = excluded.position, required = excluded.required`,
        [p.pathway_id, pc.course_id, i + 1, pc.required]);
    }
    const m = p.meta;
    await db.query(
      `insert into pathway_meta (pathway_id, career_outcomes, target_learner, foundation_route, is_default, tagline)
       values ($1,$2,$3,$4,$5,$6)
       on conflict (pathway_id) do update set career_outcomes=excluded.career_outcomes, target_learner=excluded.target_learner,
         foundation_route=excluded.foundation_route, is_default=excluded.is_default, tagline=excluded.tagline`,
      [p.pathway_id, m.career_outcomes, m.target_learner, m.foundation_route, m.is_default, m.tagline ?? null]);
  }
  const edges = buildSkillEdges(allCourses);
  await db.query(`delete from skill_edge`);
  for (const e of edges) {
    await db.query(`insert into skill_edge (from_course_id, to_course_id, skill_tag) values ($1,$2,$3)`,
      [e.from_course_id, e.to_course_id, e.skill_tag]);
  }
  const snapshot = buildSnapshot({
    courses: allCourses, pathways: catalogue.pathways, skill_edges: edges,
    statement_tags: Object.keys(statements), taxonomy,
  });
  const latest = await db.query<{ version: number; same: boolean }>(
    `select version, snapshot = $1::jsonb as same from catalogue_versions order by version desc limit 1`, [snapshot]);
  const same = Boolean(latest.rows[0]?.same);
  if (!same) {
    await db.query(`insert into catalogue_versions (version, snapshot, reason) values ($1,$2,'seed')`,
      [(latest.rows[0]?.version ?? 0) + 1, snapshot]);
  }

  // organisations and people
  const bo = await db.query<{ id: string }>(
    `insert into back_office_users (email, full_name, auth_user_id) values ($1, 'Seed operator', $2)
     on conflict (email) do update set auth_user_id = coalesce(back_office_users.auth_user_id, excluded.auth_user_id)
     returning id`, [SEED.backOfficeEmail, opts.backOfficeAuthUserId ?? null]);
  let created = 0;
  for (const inst of SEED.institutions) {
    const i = await db.query<{ id: string }>(
      `insert into institutions (code, name) values ($1,$2)
       on conflict (code) do update set name = excluded.name returning id`, [inst.code, inst.name]);
    const c = await db.query<{ id: string }>(
      `insert into cohorts (institution_id, name, starts_on) values ($1, '2026 Pilot', '2026-10-24')
       on conflict (institution_id, name) do update set name = excluded.name returning id`, [i.rows[0].id]);
    for (let n = 1; n <= inst.count; n++) {
      const ext = `${inst.prefix}${String(n).padStart(4, "0")}`;
      const quals = inst.learnerType === "college" ? COLLEGE_QUALS : WORK_QUALS;
      const r = await db.query(
        `insert into learners (institution_id, cohort_id, ext_id, email, full_name, learner_type, qualification_level, discipline)
         values ($1,$2,$3,$4,$5,$6,$7,$8) on conflict do nothing`,
        [i.rows[0].id, c.rows[0].id, ext, `${inst.code}.${ext.toLowerCase()}@test.swiftai.local`,
         `Test Learner ${ext}`, inst.learnerType, quals[n % quals.length], DISCIPLINES[n % DISCIPLINES.length]]);
      created += r.rowCount ?? 0;
    }
  }
  await db.query(
    `insert into audit_log (actor_id, actor_email, action, entity, entity_id, after)
     values ($1,$2,'seed','database',null,$3)`,
    [bo.rows[0].id, SEED.backOfficeEmail, { learners_created: created, catalogue_version_bumped: !same }]);
  return { learnersCreated: created, catalogueBumped: !same, edges: edges.length };
}
