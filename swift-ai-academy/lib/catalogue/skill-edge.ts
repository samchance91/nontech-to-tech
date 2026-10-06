import type { Course, SkillEdge } from "./types";

/**
 * Prerequisite graph (PRD section 10): from_course teaches a skill tag that to_course needs.
 * Rebuilt in full on every publish or metadata change. Internal-only courses never take part.
 */
export function buildSkillEdges(courses: Course[]): SkillEdge[] {
  const live = courses.filter((c) => !c.internal_only);
  const edges = new Map<string, SkillEdge>();
  for (const to of live) {
    for (const req of to.meta.prerequisites?.skills ?? []) {
      for (const from of live) {
        if (from.course_id === to.course_id) continue;
        const supplies = (from.meta.learning_outcomes ?? []).some((o) => o.skill_tag === req.skill_tag);
        if (!supplies) continue;
        const e = { from_course_id: from.course_id, to_course_id: to.course_id, skill_tag: req.skill_tag };
        edges.set(`${e.from_course_id}|${e.to_course_id}|${e.skill_tag}`, e);
      }
    }
  }
  return [...edges.values()].sort((a, b) =>
    a.from_course_id.localeCompare(b.from_course_id) ||
    a.to_course_id.localeCompare(b.to_course_id) ||
    a.skill_tag.localeCompare(b.skill_tag));
}
