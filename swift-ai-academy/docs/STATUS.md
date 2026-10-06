# Status

Updated 6 Oct 2026 · Phase 0 done.

## Gates

| Gate | What | Phase | Status |
| --- | --- | --- | --- |
| G1-G10 | Platform gates (defined in `docs/PRD-platform.md`) | 1-9 | Not started. **Blocked: `docs/PRD-platform.md` is not in the repo yet** |
| E1 | 200 synthetic profiles, 0 empty | 5 | Not started |
| E2 | Learner A and B reproduce | 5 | Not started (fixture is authored and checked by hand: B gets AI Builder 94 = B100 R100 C100 P70) |
| E3 | New course appears with no code change | 5 | Not started |
| E4 | Missing required field blocks publish | 3 | Not started (validator built and unit-tested in Phase 0) |
| E5 | All 10 output elements shown | 6 | Not started |
| E6 | Same profile, same ranking | 5 | Not started |
| E7 | 0 job, salary, placement promises | 5 | Not started (fixture wording already checked) |

## Phase 0 checks

| Check | Test | Result |
| --- | --- | --- |
| Every migration applies; all PRD tables exist | `tests/db/p00-schema.test.ts` | PASS |
| RLS on and forced on every table (default deny) | `tests/db/p00-schema.test.ts` | PASS |
| Learner A cannot read learner B; learners cannot write; anon reads nothing | `tests/db/sec-rls-learner-isolation.test.ts` | PASS |
| No hard deletes on learner, attempt, profile or certificate rows | `tests/db/sec-rls-learner-isolation.test.ts` | PASS |
| No gender, caste, religion, disability or location column | `tests/db/p00-schema.test.ts` | PASS |
| One default pathway; one active assignment; certificate id format; consent before active; override needs reason | `tests/db/p00-schema.test.ts` | PASS |
| `npm run seed`: 2 institutions, 50 learners, 1 back-office user, fixtures, GAF internal-only; idempotent | `tests/db/p00-seed.test.ts` | PASS |
| Fixtures valid; psych weight cap 0.25; Part 2 = 18 + 2 repeats | `tests/unit/p00-fixtures.test.ts` | PASS |
| skill_edge builder | `tests/unit/p00-skill-edge.test.ts` | PASS |
| Publish validation: field-level errors, unknown tag rejected | `tests/unit/p00-publish-validation.test.ts` | PASS |
| Home works at 360 px and 1366 px; sign-up URLs 404 | `e2e/p00-smoke.spec.ts` | PASS (8/8) |
| Service-role key not in build output | `scripts/check-no-service-key.mjs` (CI) | PASS |

Totals: Vitest 36/36, Playwright 8/8, lint 0, typecheck 0.

## What was built

- Next.js 16 app in `swift-ai-academy/` (App Router, TypeScript, Tailwind 4, shadcn/ui components, Royal Blue / Deep Navy / Gold). Vercel functions pinned to Mumbai (`vercel.json`, `bom1`).
- Schema in `supabase/migrations`: platform tables, all 11 engine tables from PRD-recommendation section 8, `catalogue_versions` (stores every catalogue snapshot so any recommendation can be replayed), RLS, no-delete triggers, private storage buckets.
- Fixtures for the engine, placeholder test items (15 Part 1, 20 Part 2), `npm run seed`.
- CI (`.github/workflows/swift-ai-academy-ci.yml`): lint, typecheck, Vitest against a real Postgres, build, service-key grep, Playwright on desktop Chrome + Pixel.
- Manual workflow to migrate and seed staging (`.github/workflows/swift-ai-academy-staging-db.yml`).

## Technical decisions taken (no action needed)

- The app lives in `swift-ai-academy/` inside this repo (the only repo this workspace can reach). Vercel's Root Directory points at it.
- Branch: all work is on `claude/vigilant-carson-22g9j1` (the branch this workspace may push to), one commit per phase step, instead of one branch per phase.
- Platform tables were drafted from `CLAUDE.md` because the platform PRD is missing. They will be reconciled against `docs/PRD-platform.md` section 10 before Phase 1 code depends on them.
- shadcn components are vendored by hand (the shadcn registry is unreachable from the build sandbox); output is identical.
- Placeholder test-item wording is original, not copied from O*NET or IPIP.

## What you need to do

1. **Add `docs/PRD-platform.md`** (the MVP Learning Platform PRD v3.0) to the repo, or paste it in chat. Phase 1 needs its section 10 and the G1-G10 definitions.
2. **Create the staging Supabase project**
   1. Go to supabase.com > Dashboard > New project.
   2. Name `swift-ai-academy-staging`, Region **South Asia (Mumbai)**, set a strong database password and save it in your password manager.
   3. Authentication > Sign In / Providers > turn **off** "Allow new users to sign up".
   4. Authentication > Sign In / Providers > Email > turn **off** "Confirm email".
   5. Project Settings > API: copy the Project URL, the `anon` key and the `service_role` key.
   6. Project Settings > Database > Connection string > URI (Session pooler): copy it and put your password in it.
3. **Give GitHub the staging secrets**
   1. GitHub repo > Settings > Environments > New environment `staging`.
   2. Add secrets: `STAGING_DATABASE_URL` (step 2.6), `STAGING_SUPABASE_URL` (2.5 URL), `STAGING_SUPABASE_SERVICE_ROLE_KEY` (2.5 service_role), `STAGING_BACK_OFFICE_PASSWORD` (any 12+ character password; it becomes the login for `ops@test.swiftai.local`).
   3. Actions tab > "Swift AI Academy · migrate and seed staging" > Run workflow (branch `claude/vigilant-carson-22g9j1`).
4. **Create the Vercel project**
   1. vercel.com > Add New > Project > import this GitHub repo.
   2. Root Directory: `swift-ai-academy`. Framework: Next.js.
   3. Environment Variables (Preview): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (from 2.5), `APP_URL` (the preview URL).
   4. Deploy.

## What to test by hand

- Open the Vercel preview on your phone and on a laptop: the welcome page shows, no sideways scrolling.
- Open `/signup` on the preview: you get "404".
