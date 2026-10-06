import { z } from "zod";

export const TAXONOMY_TYPES = [
  "qualification_level", "discipline", "skill_tag", "domain", "orientation", "career_outcome",
  "difficulty", "learner_type", "career_stage", "hours_band", "device", "language",
  "learning_objective", "riasec",
] as const;
export type TaxonomyType = (typeof TAXONOMY_TYPES)[number];

export const code = z.string().regex(/^[a-z0-9_]{1,60}$/, "use lowercase letters, digits and _");
export const courseId = z.string().regex(/^[A-Z0-9-]{2,32}$/, "use capitals, digits and -");
export const pathwayId = z.string().regex(/^pw_[a-z0-9_]{2,40}$/, "must start with pw_");
const anyOr = z.union([z.literal("any"), z.array(code).min(1)]);

export const skillReq = z.object({ skill_tag: code, min_level: z.number().int().min(1).max(3) });
export const outcome = z.object({
  skill_tag: code,
  level_after: z.number().int().min(1).max(3),
  statement: z.string().min(3).max(140),
});

/** Course metadata as stored in course_meta. Required fields may be null on a draft; publish validation enforces them. */
export const courseMeta = z.object({
  prerequisites: z.object({ skills: z.array(skillReq), courses: z.array(courseId) }).nullable(),
  eligible_qualifications: z.object({ levels: anyOr, disciplines: anyOr }).nullable(),
  learning_outcomes: z.array(outcome).nullable(),
  career_outcomes: z.array(code).nullable(),
  domain: code.nullable(),
  difficulty: code.nullable(),
  orientation_tags: z.array(code).nullable(),
  related_courses: z.array(courseId).nullable(),
  est_hours: z.number().positive().nullable(),
});
export type CourseMeta = z.infer<typeof courseMeta>;

export const course = z.object({
  course_id: courseId,
  title: z.string().min(2),
  level: z.number().int().min(0).max(9),
  internal_only: z.boolean(),
  meta: courseMeta,
});
export type Course = z.infer<typeof course>;

export const pathwayMeta = z.object({
  career_outcomes: z.array(code).min(1),
  target_learner: z
    .object({ learner_types: z.array(code).min(1), levels: anyOr, disciplines: anyOr })
    .nullable(),
  foundation_route: z.array(courseId),
  is_default: z.boolean(),
  tagline: z.string().max(80).nullable().optional(),
});
export type PathwayMeta = z.infer<typeof pathwayMeta>;

export const pathway = z.object({
  pathway_id: pathwayId,
  name: z.string().min(2),
  courses: z.array(z.object({ course_id: courseId, required: z.boolean() })).min(1),
  meta: pathwayMeta,
});
export type Pathway = z.infer<typeof pathway>;

export const catalogueFile = z.object({ courses: z.array(course), pathways: z.array(pathway) });

/** taxonomy_type -> code -> label */
export type Taxonomy = Partial<Record<TaxonomyType, Record<string, string>>>;

export type SkillEdge = { from_course_id: string; to_course_id: string; skill_tag: string };

export const engineConfig = z
  .object({
    version: z.number().int().positive(),
    weights: z.object({ B: z.number().min(0), R: z.number().min(0), C: z.number().min(0), P: z.number().min(0) }),
    p_weight_cap: z.number().min(0).max(0.25),
    threshold: z.number().min(0).max(100),
    route_penalty: z.number().min(0).max(100),
    max_alternatives: z.number().int().min(0).max(2),
    max_route_courses: z.number().int().min(1).max(3),
    background_scores: z.object({ full: z.number(), partial: z.number(), none: z.number() }),
    goal_scores: z.object({ primary: z.number(), secondary: z.number() }),
    riasec_map: z.record(code, code),
    attention_max_diff: z.number().int().min(0).max(4),
    retake_days: z.number().int().min(1),
    timeout_ms: z.number().int().positive(),
  })
  .refine((c) => Math.abs(c.weights.B + c.weights.R + c.weights.C + c.weights.P - 1) < 1e-6, {
    message: "weights must sum to 1", path: ["weights"],
  })
  .refine((c) => c.weights.P <= c.p_weight_cap, {
    message: "psychometric weight is capped at 0.25", path: ["weights", "P"],
  });
export type EngineConfig = z.infer<typeof engineConfig>;
