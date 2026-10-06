import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { TAXONOMY_TYPES, catalogueFile, course, engineConfig, type Taxonomy } from "./types";

const dir = join(process.cwd(), "fixtures");
const read = (f: string): unknown => JSON.parse(readFileSync(join(dir, f), "utf8"));

export function loadTaxonomy(): Taxonomy {
  const raw = z.record(z.enum(TAXONOMY_TYPES), z.array(z.tuple([z.string(), z.string()]))).parse(read("taxonomy.json"));
  return Object.fromEntries(Object.entries(raw).map(([t, rows]) => [t, Object.fromEntries(rows)])) as Taxonomy;
}

export function loadSkillStatements(): Record<string, [string, string, string, string]> {
  return z.record(z.string(), z.tuple([z.string(), z.string(), z.string(), z.string()])).parse(read("skill-statements.json"));
}

export const loadCatalogue = () => catalogueFile.parse(read("catalogue.json"));
export const loadInternalCourses = () => z.array(course).parse(read("internal-courses.json"));
export const loadEngineConfig = () => engineConfig.parse(read("engine-config.json"));

const testItem = z.object({
  item_id: z.string().regex(/^[A-Za-z0-9_]{1,40}$/),
  part: z.enum(["learner_details", "psychometric"]),
  block: z.string(),
  type: z.enum(["select", "multi_select", "can_do", "likert5", "scenario"]),
  prompt: z.string().min(3),
  options: z.record(z.string(), z.unknown()),
  scoring_key: z.record(z.string(), z.unknown()),
  show_if: z.record(z.string(), z.array(z.string())).optional(),
  prefill: z.string().optional(),
  position: z.number().int().positive(),
  status: z.enum(["active", "retired"]),
});
export type TestItem = z.infer<typeof testItem>;

export function loadTestItems() {
  return z.object({ learner_details: z.array(testItem), psychometric: z.array(testItem) }).parse(read("test-items.json"));
}
