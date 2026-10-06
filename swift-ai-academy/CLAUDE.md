@AGENTS.md

# Swift AI Academy MVP: build rules

Two specs. Read both fully before any work.

- `docs/PRD-platform.md`: the learning platform. Its gates are called G1-G10 here.
- `docs/PRD-recommendation.md`: the baseline test and recommendation engine. Its gates are called E1-E7 here.

Where this file and a PRD disagree, this file wins: it records decisions made after the PRDs.

Deadline: G1-G10 pass on staging by 23 Oct 2026. Feature freeze 21 Oct.

## Who you are working with

The owner is a product lead, not an engineer. He will not review code.

- Tests are the code review. Every phase ends with tests named after the gate they prove (`g01-roster.spec.ts`, `e02-worked-examples.test.ts`). A phase is not done while any test is red.
- Decide technical questions yourself. Ask him only product questions, one at a time, with your recommended answer.
- When he must do something in a dashboard (Supabase, Vercel, Resend, DNS), give numbered click-by-click steps.
- After each phase update `docs/STATUS.md`: gate table with PASS / FAIL, what was built, what he must test by hand.

## Stack (fixed, do not propose alternatives)

| Layer | Choice |
| --- | --- |
| App | One Next.js app (App Router, TypeScript) on Vercel, functions pinned to Mumbai |
| Routes | `/` learner, `/admin` back-office, `/verify/[id]` public |
| Backend | Server actions and route handlers in the same app. No separate service |
| Database, auth, files | Supabase, Mumbai region. Postgres, Supabase Auth, private Storage buckets |
| UI | Tailwind + shadcn/ui. Royal Blue, Deep Navy, Gold. Mobile-first, works at 360 px and 1366 px |
| Email | Resend. In local dev, write emails to an `email_outbox` table instead of sending |
| Certificate PDF | `pdf-lib` + `qrcode` in a route handler. No headless Chrome |
| PDF and slides viewer | `pdf.js` (Android Chrome will not render a PDF in an iframe) |
| Validation | zod on every server input |
| Tests | Vitest for logic, Playwright for gates (desktop Chrome + Pixel emulation) |

## Platform decisions that change or sharpen the PRD

1. **No GCS, no Cloud Run.** Supabase Storage with signed URLs (10-minute expiry) covers PLY-02. Certificate PDFs go in a separate private bucket.
2. **Student-ID login needs the institution.** `ext_id` is unique only inside an institution. Login page is `/login/[institution_code]`; the field accepts email or student ID. The server resolves student ID to email, then signs in. Invite links land on the right institution URL.
3. **Login always goes through a server action**, never the client SDK directly, so lockout (5 wrong tries, 15 minutes) and `login_failed` events can be enforced.
4. **Invites are custom**, not Supabase invites: 32 random bytes, stored hashed, 14-day expiry, resend kills the old token. Create the Supabase auth user at activation.
5. **Sessions:** session cookies with no max-age, no "remember me", `autocomplete="off"` on password. Server checks `last_seen_at` on every request and rejects after 30 minutes idle; client also runs an idle timer and signs out. Test with Chrome's "continue where you left off" switched on.
6. **Public sign-up off** in Supabase settings. Any sign-up URL returns 404.
7. **Slides are uploaded as PDF.** `asset_type = slides` uses the PDF viewer.
8. **HTML sims are single-file.** Fetch server-side and render with `<iframe sandbox="allow-scripts" srcdoc=...>`. Never add `allow-same-origin`.
9. **Video:** MP4, 720p max, played from a signed URL with the native `<video>` element.
10. **All platform P1 items are cut** (REL-06, REL-07, REL-08).
11. **Back-office is plain.** Tables, forms, CSV upload, CSV download. No charts.
12. **Test is mandatory** before any course opens, except when back-office assigns a pathway by override (logged with reason).

## Recommendation engine

Build Phase 1 of `docs/PRD-recommendation.md` inside this window.

**Shape.** A pure function `recommend(profile, catalogue, config) -> result` in `lib/engine/`. No database or network calls inside it. A thin wrapper loads the three inputs, calls it, stores the full snapshot, returns the JSON in section 11 of the PRD. This makes E1, E2 and E6 plain unit tests.

**Build the fallback first.** The wrapper returns the default pathway with `fallback = true` on any error or after 5 seconds. Write that path and its test before the real scoring.

**Kill switch.** If E1, E2 and E6 are not green by end of day 17 Oct, the wrapper returns the fallback for everyone and Phase 6 builds its screens against that. Tell the owner the same day.

**In scope**

- Part 1 blocks A-E, branching by learner type, block C built from skill tags in the live catalogue, can-do statements only.
- Part 2 short form: about 20 items covering RIASEC interests and orientations, plus 2 repeated items as the attention check.
- Scoring (B, R, C, P), gap routing, skip logic, template explanations, all 10 output elements, snapshot, retake once per 30 days, override.
- Metadata validation that blocks publish; taxonomy as data; engine config as data.

**Out of scope (Phase 2)**

- Aptitude items, behavioural tendencies, work-type, working and learning preferences. T2-01's seven dimensions is deferred; leave those profile attributes null.
- CHK-01, DYN-02, LLM rewording, Hindi, the "new pathway that fits you" notice.

**Rules the PRD leaves open. Use these.**

1. Orientations are the taxonomy's five: Analytical, Creative, Communication, Technical, People.
2. P, learner side: a 5-value vector. Each orientation score is averaged with its mapped RIASEC score. Mapping lives in `engine_config`; default Investigative and Conventional to Analytical, Artistic to Creative, Enterprising to Communication, Realistic to Technical, Social to People.
3. P, pathway side: count of each orientation tag across the pathway's required courses.
4. Low-confidence profile: psychometric weight becomes 0 and the B, R, C weights are rescaled to sum to 1.
5. B: "any" = 100. Qualification and discipline both match = 100. One matches = 60. Neither = 20.
6. R: no entry prerequisites = 100. After gap routing, R = 100 minus the route penalty.
7. Tie-break on equal Fit: higher C, then higher R, then `pathway_id` ascending.
8. Default pathway: `pathway_meta.is_default`, exactly one row true. Used when nothing clears the threshold and no goal matches, and as the fallback result.
9. Gap routing: if `pathway_meta.foundation_route` covers the gap, use it. Otherwise the smallest set of published courses (up to 3) whose learning outcomes cover the missing tags at the needed level; tie-break lowest course level, then `course_code`. If nothing covers the gap, keep the pathway and show the gap. Never reject.
10. A skill tag with no can-do statements counts as level 0 for every learner.
11. Courses flagged internal-only (the Google AI Foundations test course) are never engine candidates, but still need minimal metadata to publish.
12. Explanations come only from templates, with "builds toward" wording. E7 test: no output contains job, salary, placement, guarantee, hired or package.
13. The profile type has no gender, caste, religion, disability or location field. Do not add one.
14. Learners never see numbers. No fit score, no component scores, no bands. The two summaries ("Your starting point", "What you enjoy") use strength-based plain words.

**Reference data.** `taxonomy`, `skill_statement`, `test_item`, `course_meta`, `pathway_meta` and `engine_config` are loaded as CSV or JSON through one `/admin/reference-data` screen with validation and audit log. No per-row editing screens. Nothing is cached across requests, so a change applies to the next recommendation (TAX-01, REC-05, DYN-01).

**Publish validation.** A module cannot be published unless its course has every required metadata field and every tag exists in its taxonomy. Show field-level errors. On publish or metadata change: rebuild `skill_edge`, increment `catalogue_version`.

**Fixtures.** `fixtures/catalogue.json` holds 9 courses and 3 pathways (AI Builder, AI-Ready Professional, Workplace Communication), authored so that Learner A and Learner B in PRD section 9 reproduce, including the 94 fit with B 100, R 100, C 100, P 70 for Learner B. E2 runs against the fixture, not live data, so curriculum edits cannot break it. `fixtures/test-items.json` holds placeholder Part 1 and Part 2 items; the owner will replace them. Write a generator for 200 synthetic profiles across all 7 disciplines (E1).

## Security rules (non-negotiable)

- RLS on every table, default deny. A learner can read only rows with their own `learner_id`. Write a test that logs in as learner A and fails to read learner B.
- The service-role key is used only in server code. Never in a `NEXT_PUBLIC_` variable, never in the client bundle. Add a CI check that greps the build output for it.
- Every `/admin` action checks the `back_office` role on the server and writes `audit_log` in the same transaction as the change.
- No hard deletes on learner, attempt or certificate rows.
- Psychometric responses, scores and profile attributes never appear in exports or the institution report. Only the chosen pathway does.
- Secrets live in env vars. Never commit `.env*`.
- Consent timestamp is required to finish activation. The consent text names the psychometric test explicitly.

## Platform business logic

Implement PRD-platform section 10 exactly. Put these in Postgres functions or single server modules, each with unit tests on the edge cases:

- Roster dedupe: re-upload the same file, 0 new learners.
- Quiz: 79% fails, 80% passes, a pass never reverts, 4th attempt inside 8 hours is blocked with the unlock time.
- Progress %: required items in published modules only.
- Course complete: release_status = complete AND all required graded items passed. Re-evaluate on quiz pass and on module publish.
- Pathway complete: idempotent through the unique constraint; one certificate per completion. A can_skip course still counts toward completion: the learner may skip its lessons but must pass its graded quiz. Show it as "Skip to the quiz".
- Pathway switch: one transaction, exactly one active assignment per learner.
- Module publish: touches no progress table.
- Certificate ID: `SAA-YYYY-` + 8 base32 chars without 0, O, 1, I.

## Working rules

- Schema changes only through files in `supabase/migrations`. Never change tables by hand.
- One branch per phase, small commits, merge when the phase's tests are green.
- Staging = Vercel preview deployment + the staging Supabase project. No production project until after gate review.
- `npm run seed` creates 2 institutions, 50 test learners, 1 back-office user, the fixtures above, and the Google AI Foundations test course flagged internal-only.
- Before each phase: post a short plan. After: run every test, not just the new ones.

## Phases

| # | Dates | Build | Gates |
| --- | --- | --- | --- |
| 0 | 6 Oct | Repo, schema from both PRDs + RLS, seed script, CI running tests | - |
| 1 | 7-8 Oct | Back-office login, institutions, cohorts, roster upload with error file | G1 |
| 2 | 9-10 Oct | Invite, activation + consent, login, lockout, idle logout, password reset, emails | G2 |
| 3 | 11-13 Oct | Course, quiz and metadata import; reference-data screen; publish validation; course page; lesson player; resume | G5, G6, E4 |
| 4 | 14-15 Oct | Quiz, attempt window, progress %, course and pathway completion | G7 |
| 5 | 16-17 Oct | Engine as a pure function: fallback, scoring, gap routing, skip logic, reasons, snapshot, fixtures, 200 profiles | E1, E2, E3, E6, E7 |
| 6 | 18-19 Oct | Test Part 1 + 2 with autosave, profile builder, recommendation screen, accept, switch, retake, override | G3, G4, E5 |
| 7 | 20 Oct | Certificate PDF, verify page, revoke and reissue | G8 |
| 8 | 21 Oct | Learner 360 view, CSV export, institution report query, analytics events check. Freeze | G9 |
| 9 | 22-23 Oct | Bug fixing only. Full gate run on desktop Chrome and a real Android phone | G10 |

Start each session with: "Read CLAUDE.md, both PRDs and docs/STATUS.md. Do Phase N."
