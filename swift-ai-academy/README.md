# Swift AI Academy MVP

One Next.js app: learner (`/`), back-office (`/admin`), public certificate check (`/verify/[id]`).
Supabase (Mumbai) for Postgres, auth and private files. Build rules: [`CLAUDE.md`](./CLAUDE.md). Progress: [`docs/STATUS.md`](./docs/STATUS.md).

## Run locally

```bash
cd swift-ai-academy
npm ci
cp .env.example .env.local          # fill in; never commit
npm run dev                         # http://localhost:3000
```

## Tests (the code review)

```bash
npm test          # Vitest: logic + database/RLS tests. Needs Postgres at DATABASE_URL_TEST
                  # (default postgresql://postgres:postgres@localhost:5432/postgres)
npm run test:e2e  # Playwright gates: desktop Chrome 1366 px + Pixel 7 (build first: npm run build)
```

Database tests create a throwaway database per file, load a small stand-in for Supabase's `auth`
schema (`tests/db/supabase-shim.sql`) and apply every file in `supabase/migrations`.

## Layout

| Path | What |
| --- | --- |
| `supabase/migrations` | The only way the schema changes |
| `fixtures/` | Engine fixture catalogue (9 courses, 3 pathways), taxonomy, can-do statements, engine config, placeholder test items |
| `lib/catalogue` | Metadata types (zod), publish validation, skill_edge builder, catalogue snapshot |
| `lib/engine` | Phase 5: pure `recommend(profile, catalogue, config)` |
| `scripts/seed.ts` | `npm run seed` (idempotent) |
| `tests/`, `e2e/` | Vitest and Playwright, named after the gate they prove |
