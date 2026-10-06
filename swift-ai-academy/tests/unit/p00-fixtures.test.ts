import { describe, expect, it } from "vitest";
import {
  loadCatalogue, loadEngineConfig, loadInternalCourses, loadSkillStatements, loadTaxonomy, loadTestItems,
} from "@/lib/catalogue/fixtures";
import { validateCourseForPublish } from "@/lib/catalogue/validate";
import { engineConfig } from "@/lib/catalogue/types";

const taxonomy = loadTaxonomy();
const cat = loadCatalogue();
const internal = loadInternalCourses();
const ids = new Set([...cat.courses, ...internal].map((c) => c.course_id));

describe("phase 0 · fixtures", () => {
  it("catalogue has 9 courses and the 3 named pathways", () => {
    expect(cat.courses).toHaveLength(9);
    expect(cat.pathways.map((p) => p.name).sort()).toEqual(["AI Builder", "AI-Ready Professional", "Workplace Communication"]);
  });

  it("every fixture course passes publish validation", () => {
    for (const c of [...cat.courses, ...internal]) expect(validateCourseForPublish(c, taxonomy, ids), c.course_id).toEqual({});
  });

  it("every pathway references real courses and taxonomy values; exactly one is default", () => {
    for (const p of cat.pathways) {
      for (const pc of p.courses) expect(ids.has(pc.course_id), pc.course_id).toBe(true);
      for (const f of p.meta.foundation_route) expect(ids.has(f), f).toBe(true);
      for (const o of p.meta.career_outcomes) expect(taxonomy.career_outcome?.[o], o).toBeTruthy();
    }
    expect(cat.pathways.filter((p) => p.meta.is_default)).toHaveLength(1);
  });

  it("taxonomy has the 7 disciplines and 5 orientations", () => {
    expect(Object.keys(taxonomy.discipline!)).toHaveLength(7);
    expect(Object.keys(taxonomy.orientation!).sort()).toEqual(["analytical", "communication", "creative", "people", "technical"]);
  });

  it("every catalogue skill tag has 4 can-do statements and every statement tag is in the taxonomy", () => {
    const statements = loadSkillStatements();
    for (const tag of Object.keys(statements)) expect(taxonomy.skill_tag?.[tag], tag).toBeTruthy();
    const used = new Set(cat.courses.flatMap((c) => [
      ...(c.meta.prerequisites?.skills.map((s) => s.skill_tag) ?? []),
      ...(c.meta.learning_outcomes?.map((o) => o.skill_tag) ?? []),
    ]));
    for (const tag of used) expect(statements[tag], tag).toHaveLength(4);
  });

  it("engine config is valid and keeps the psychometric weight at or under 0.25", () => {
    const c = loadEngineConfig();
    expect(c.weights).toEqual({ B: 0.25, R: 0.25, C: 0.3, P: 0.2 });
    expect(engineConfig.safeParse({ ...c, weights: { B: 0.2, R: 0.2, C: 0.3, P: 0.3 } }).success).toBe(false);
    expect(engineConfig.safeParse({ ...c, weights: { B: 0.3, R: 0.3, C: 0.3, P: 0.2 } }).success).toBe(false);
    expect(Object.keys(c.riasec_map).sort()).toEqual(["artistic", "conventional", "enterprising", "investigative", "realistic", "social"]);
  });

  it("test items: Part 1 covers blocks A-E; Part 2 short form is 18 items + 2 attention repeats", () => {
    const items = loadTestItems();
    expect(new Set(items.learner_details.map((i) => i.block))).toEqual(new Set(["A", "B", "C", "D", "E"]));
    const p2 = items.psychometric;
    expect(p2).toHaveLength(20);
    const repeats = p2.filter((i) => i.block === "attention");
    expect(repeats).toHaveLength(2);
    for (const r of repeats) {
      const of = p2.find((i) => i.item_id === r.scoring_key.repeat_of);
      expect(of?.prompt).toBe(r.prompt);
    }
    expect(p2.filter((i) => i.block === "riasec").length).toBe(12);
    expect(p2.filter((i) => i.block === "orientation").length).toBe(6);
  });

  it("no fixture text makes a job, salary or placement promise", () => {
    const text = JSON.stringify([cat, loadTestItems(), taxonomy]);
    expect(text.match(/\b(job|jobs|salary|placement|guarantee|hired|package)\b/gi) ?? []).toEqual([]);
  });
});
