import type { Course, Pathway, SkillEdge, Taxonomy } from "./types";

/** Everything the engine reads about the catalogue at one catalogue_version. Stored whole for reproducibility. */
export type CatalogueSnapshot = {
  courses: Course[];          // published, not archived (internal-only kept, flagged)
  pathways: Pathway[];        // published
  skill_edges: SkillEdge[];
  statement_tags: string[];   // skill tags that have can-do statements (others count as level 0)
  taxonomy: Taxonomy;         // labels used by explanations
};

export function buildSnapshot(input: CatalogueSnapshot): CatalogueSnapshot {
  const byId = <T extends { course_id: string } | { pathway_id: string }>(a: T, b: T) =>
    ("course_id" in a ? a.course_id : a.pathway_id).localeCompare("course_id" in b ? b.course_id : b.pathway_id);
  return {
    courses: [...input.courses].sort(byId),
    pathways: [...input.pathways].sort(byId),
    skill_edges: input.skill_edges,
    statement_tags: [...input.statement_tags].sort(),
    taxonomy: input.taxonomy,
  };
}
