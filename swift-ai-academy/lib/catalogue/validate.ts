import type { Course, Taxonomy, TaxonomyType } from "./types";

export type FieldErrors = Record<string, string>;

const REQUIRED = ["prerequisites", "eligible_qualifications", "learning_outcomes", "career_outcomes"] as const;

/**
 * Publish validation (MET-01, MET-02). Returns field-level errors; empty object = publishable.
 * Internal-only courses need only minimal metadata (engine rule 11) but tags must still be valid.
 */
export function validateCourseForPublish(
  course: Course,
  taxonomy: Taxonomy,
  knownCourseIds: ReadonlySet<string>,
): FieldErrors {
  const errors: FieldErrors = {};
  const m = course.meta;
  const has = (t: TaxonomyType, c: string) => Boolean(taxonomy[t]?.[c]);
  const check = (field: string, t: TaxonomyType, c: string | null | undefined) => {
    if (c != null && !has(t, c)) errors[field] = `"${c}" is not in the ${t} taxonomy`;
  };

  if (!course.title?.trim()) errors.title = "Title is required";
  if (!Number.isInteger(course.level)) errors.level = "Level is required";

  for (const f of REQUIRED) {
    const v = m[f];
    if (v == null) errors[f] = "Required";
  }
  if (!course.internal_only) {
    if (m.learning_outcomes && m.learning_outcomes.length === 0) errors.learning_outcomes = "Add at least one learning outcome";
    if (m.career_outcomes && m.career_outcomes.length === 0) errors.career_outcomes = "Add at least one career outcome";
  }

  m.prerequisites?.skills.forEach((s, i) => check(`prerequisites.skills[${i}].skill_tag`, "skill_tag", s.skill_tag));
  m.prerequisites?.courses.forEach((c, i) => {
    if (!knownCourseIds.has(c)) errors[`prerequisites.courses[${i}]`] = `Unknown course "${c}"`;
  });
  const eq = m.eligible_qualifications;
  if (eq && eq.levels !== "any") eq.levels.forEach((c, i) => check(`eligible_qualifications.levels[${i}]`, "qualification_level", c));
  if (eq && eq.disciplines !== "any") eq.disciplines.forEach((c, i) => check(`eligible_qualifications.disciplines[${i}]`, "discipline", c));
  m.learning_outcomes?.forEach((o, i) => check(`learning_outcomes[${i}].skill_tag`, "skill_tag", o.skill_tag));
  m.career_outcomes?.forEach((c, i) => check(`career_outcomes[${i}]`, "career_outcome", c));
  check("domain", "domain", m.domain);
  check("difficulty", "difficulty", m.difficulty);
  m.orientation_tags?.forEach((c, i) => check(`orientation_tags[${i}]`, "orientation", c));
  m.related_courses?.forEach((c, i) => {
    if (!knownCourseIds.has(c)) errors[`related_courses[${i}]`] = `Unknown course "${c}"`;
  });
  return errors;
}
