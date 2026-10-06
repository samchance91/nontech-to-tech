import { describe, expect, it } from "vitest";
import { buildSkillEdges } from "@/lib/catalogue/skill-edge";
import { loadCatalogue, loadInternalCourses } from "@/lib/catalogue/fixtures";

const courses = [...loadCatalogue().courses, ...loadInternalCourses()];

describe("phase 0 · skill_edge builder", () => {
  const edges = buildSkillEdges(courses);
  const has = (from: string, to: string, tag: string) =>
    edges.some((e) => e.from_course_id === from && e.to_course_id === to && e.skill_tag === tag);

  it("links a course that teaches a tag to every course that needs it", () => {
    expect(has("DATA-101", "AAI-L2", "data_literacy")).toBe(true);
    expect(has("AAI-L1", "AAI-L2", "prompt_writing")).toBe(true);
    expect(has("AAI-L1", "AIRP-2", "data_literacy")).toBe(true);
    expect(has("WC-102", "WC-103", "spoken_comm")).toBe(true);
  });

  it("never links a course to itself and never includes internal-only courses", () => {
    expect(edges.every((e) => e.from_course_id !== e.to_course_id)).toBe(true);
    expect(edges.some((e) => e.from_course_id === "GAF" || e.to_course_id === "GAF")).toBe(false);
  });

  it("is deterministic", () => {
    expect(buildSkillEdges([...courses].reverse())).toEqual(edges);
  });
});
