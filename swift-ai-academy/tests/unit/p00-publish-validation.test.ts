import { describe, expect, it } from "vitest";
import { validateCourseForPublish } from "@/lib/catalogue/validate";
import { loadCatalogue, loadTaxonomy } from "@/lib/catalogue/fixtures";
import type { Course } from "@/lib/catalogue/types";

const taxonomy = loadTaxonomy();
const base = loadCatalogue().courses.find((c) => c.course_id === "AAI-L2")!;
const ids = new Set(loadCatalogue().courses.map((c) => c.course_id));
const withMeta = (patch: Partial<Course["meta"]>): Course => ({ ...base, meta: { ...base.meta, ...patch } });

describe("phase 0 · publish validation (groundwork for E4)", () => {
  it("a complete course passes", () => {
    expect(validateCourseForPublish(base, taxonomy, ids)).toEqual({});
  });

  it.each(["prerequisites", "eligible_qualifications", "learning_outcomes", "career_outcomes"] as const)(
    "missing %s blocks publish with a field-level error", (field) => {
      expect(validateCourseForPublish(withMeta({ [field]: null }), taxonomy, ids)).toHaveProperty(field, "Required");
    });

  it("an unknown tag is rejected with the field that holds it", () => {
    const errs = validateCourseForPublish(
      withMeta({ career_outcomes: ["astronaut"], orientation_tags: ["technical", "sporty"] }), taxonomy, ids);
    expect(errs["career_outcomes[0]"]).toMatch(/astronaut/);
    expect(errs["orientation_tags[1]"]).toMatch(/sporty/);
  });

  it("a new tag becomes valid as soon as it is added to the taxonomy (data, not code)", () => {
    const c = withMeta({ career_outcomes: ["ai_trainer"] });
    expect(validateCourseForPublish(c, taxonomy, ids)).toHaveProperty("career_outcomes[0]");
    const t2 = { ...taxonomy, career_outcome: { ...taxonomy.career_outcome, ai_trainer: "AI trainer" } };
    expect(validateCourseForPublish(c, t2, ids)).toEqual({});
  });
});
