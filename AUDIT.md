# AUDIT.md — current state of the platform

*Part 1 deliverable. Everything below is read from the live codebase (`index.html`, `supabase/`, `docs/`), not assumed. This is the map I'll redesign against. **Checkpoint: approve before I start Part 2 (DESIGN-SYSTEM.md).***

---

## 0. TL;DR

- **One file, vanilla JS, no build.** A ~3,600-line `index.html`: inline `<style>` design tokens, hand-rolled hash router, all views rendered as string templates, inline SVG for every graphic. Cloud sync via Supabase; hosting via GitHub Pages.
- **14 routes, ~13 view renderers, 4 content stores.** Rich and working: journey map, 10 modules (each a P0–PP backbone arc), baseline check, skill profile with radar/trend, flashcards, showcase, admin with per-learner drill-down.
- **The brief's biggest gaps, up front:**
  1. **All 29 YouTube references are outbound `<a target="_blank">` links** — a direct violation of the "no outbound YouTube" rule. Worse, **only 13 of 29 are embeddable** (12 `watch` + 1 `playlist`); the other **16 are search-result or channel links** that are not specific videos and cannot become a player without sourcing real video IDs.
  2. **No PWA** — no `manifest.json`, no service worker, no offline, no install flow.
  3. **No difficulty tiers and no adaptation** — single linear track for everyone.
  4. **The existing baseline is the wrong shape** — 30 questions on a 60-minute timer, not the ≤8-question, <90-second adaptive diagnostic Part 3 requires.
  5. **Persistence is localStorage + Supabase, not IndexedDB** — fine for small JSON, but the brief specifies IndexedDB + background-sync.
- **Stack call: keep vanilla, add a PWA layer. Do not migrate to a framework.** Justification in §1.

---

## 1. Tech stack & the keep-vs-migrate call

| Layer | Current |
|---|---|
| App | Single `index.html`, vanilla ES5-style JS (no framework, no bundler, no npm) |
| Styling | One inline `<style>` block; CSS custom-property design tokens; light/dark via `data-theme` + `prefers-color-scheme` |
| Routing | Hash router (`#/route`) hand-written in a `router()` function |
| Rendering | `main.innerHTML = ...` string templates per view; no virtual DOM |
| Graphics | 100% inline SVG (radar, trend line, journey map, icons). **Zero raster images.** |
| Data (local) | `localStorage` keys: `propelr_tnt_profiles`, `propelr_tnt_session`, `propelr_tnt_progress::<email>`, `propelr_tnt_posts`, `propelr_tnt_theme` (+ legacy `_progress_v1`) |
| Data (cloud) | Supabase (`@supabase/supabase-js@2` from jsdelivr CDN), tables `profiles` / `progress` / `posts`, anon key + RLS, email+password auth |
| Hosting / CI | GitHub Pages via `.github/workflows/deploy-pages.yml` on push (HTTPS — PWA-capable) |
| Build step | **None.** Edit file → push → deploy. |

**Decision: KEEP the vanilla single-file stack; ADD PWA files (`manifest.json`, `sw.js`, `/icons`) alongside it.**
Line 1: every hard requirement in this brief — PWA, IndexedDB, the YouTube IFrame API, the adaptation engine, offline — is reachable in vanilla JS on GitHub Pages; a framework migration would delete a large, working, verified codebase to buy nothing the brief asks for. Line 2: the *only* thing the single file blocks is the service worker + manifest (which must be separate top-level files), so I'll split those out and, for maintainability at this new scale, factor the app into `index.html` + `app.js` + `styles.css` — a refactor, not a stack change.

---

## 2. Routes & views

| Route | Renderer | Purpose | Gated by |
|---|---|---|---|
| `#/` | `renderWelcome` | Landing: hero, backbone strip, features, how-to | — |
| `#/map` | `renderMap` | Journey map (spatial), avatar, progress ring, next-step card | profile |
| `#/module/<id>` | `renderModule` | A module as an 8-phase P0–PP arc (calibrate→persist) | profile |
| `#/capstone` | `renderCapstone` | PRD checklist; locked until all module quizzes cleared | profile |
| `#/baseline` | `renderBaseline` | Hub for the two baseline checks | profile |
| `#/baseline/tech` | `renderBaselineTech` | 30-Q technical check, **60-min timer**, per-area scoring | profile |
| `#/baseline/psych` | `renderBaselinePsych` | 30 Likert profile statements | profile |
| `#/profile` | `renderProfile` | Skill radar (baseline vs now), trend line, 12 skill bars, portfolio, streak, level-up, next-step | profile |
| `#/flashcards` | `renderFlashcards` | Deck grid; per-module decks locked until quiz cleared | profile |
| `#/flashcards/<mid>` | `renderDeck` | Flip-card study mode, known-tracking, shuffle, focus | quiz cleared |
| `#/showcase` | `renderShowcase` | Community post wall (Supabase-backed) | — |
| `#/admin` | `renderAdmin` | Cohort dashboard: stats, cohort radar, learner table, posts | admin code `2718281828` |
| `#/admin/l/<email>` | `renderAdminLearner` | Per-learner drill-down (radar, bars, portfolio, baseline) | admin |
| `#/reference` | `renderReference` | "Nonsense detector" + standing principles | — |

Supporting renderers: `renderQuiz`, `renderProject` (embedded in module/capstone), `videoCard`, `pipelineHTML`.

---

## 3. Component inventory

- **Chrome:** sticky nav (brand, links ≥1024px, compact menu sheet <1024px, admin/theme icons, profile chip), footer.
- **Dialogs (`<dialog>`):** reset, profile create/switch, profile menu, admin gate, nav menu.
- **Progress visualisations:** journey map (SVG path + moving avatar + node states), completion ring, skill **radar** (baseline ring vs now), **trend** line chart, horizontal skill bars, per-area bars, streak badge, level-up banner.
- **Learning primitives:** quiz (radio + graded feedback + explanations), project checklist, phase rail (8 steps), calibrate 1–5 control, soft-gate textareas (ground/engage/stress/commit), flashcard flip card.
- **Feedback today (ad-hoc, not a system):** hover/focus CSS states (Instant ✓), optimistic saves with no undo (Confirmation ⚠ partial), quiz result banners with per-answer why (Evaluative ✓ good), map/skill updates on action (Progressive ✓). Part 5 wants these as **four named reusable registers** — currently they're bespoke per view.

---

## 4. Content types & inventory

| Store | Where | Volume | Notes |
|---|---|---|---|
| **Modules** | `COURSE.modules` | 10 (m0–m9) | Each: outcomes, why, videos, `concepts[{t,d}]`, callout, `apply`, `quiz[{q,opts,a,why}]`, `project{checklist}` |
| **Capstone** | `COURSE.capstone` | 1 | PRD checklist |
| **Baseline — technical** | `BASELINE.tech` | 30 Q across 6 areas | + `BASELINE.techMod` maps each Q → module |
| **Baseline — profile** | `BASELINE.psych` | 30 Likert across 5 traits | reverse-scored items |
| **Flashcards** | `FLASHCARDS` | ~10–12 per module (~110) | front/back recall cards |
| **Reference** | `COURSE` (principles, nonsense-detector) | 1 page | |
| **Skill ontology** | `SKILLS` + `docs/ontology-and-backbone.md` | 12 skills × 10–15 binary params | scoring backend, not difficulty tiers |
| **Showcase posts** | Supabase `posts` | user-generated | |

Concepts are defined at first use (good for Novice). Quizzes carry rationale on every option. **None of it is tagged by difficulty tier today.**

---

## 5. Media inventory — the YouTube problem

**Raster images: 0.** No `<img>`, no external image hosts, no icon fonts — every graphic is inline SVG. So **there is no image-weight or LCP-image problem**, and no media to migrate except video.

**YouTube: 29 references, 100% currently outbound** (`videoCard()` at line ~1914 renders `<a href=… target="_blank" rel="noopener">`). Categorised:

| Kind | Count | Embeddable as a player? | Action |
|---|---|---|---|
| `watch?v=` | 12 | ✅ yes | Convert to `<VideoBlock>` facade embeds |
| `playlist?list=` | 1 | ✅ yes (playlist embed) | Embed |
| `results?search_query=` | 11 | ❌ no — it's a search page | **Must source a specific video ID or cut** |
| `@channel` | 5 (Fireship ×3, TraversyMedia, …) | ❌ no — it's a channel | **Replace with a specific video or move to a "further viewing" list** |

The 12 embeddable video IDs: `AEaKrq3SpW8, zN8YNNHcaZc, Yzx7ihtCGBs, s7wmiS2mSXY, WXsD0ZgxjRw, _Ss42Vb1SU4, ruz-vK8IesE, RtQ3tpq-RuE, hLkDdAl8OYg, XU0llRltyFM, emidrJeUTaM, NDVSMlVYxm8` + playlist `PLuAoMvvRllpQruEtbJQjsKRUI-FHaTyiV`.

> **Consequence for scope:** "all YouTube plays inline" cannot be met by wrapping the current content as-is — **16 of 29 entries aren't videos**. Part 7 needs a small content pass to replace every search/channel link with a real embeddable ID (or reclassify it as an external "further reading" link that is honestly not a video). Flagging now so it's a decision, not a surprise.

Non-YouTube outbound links that are legitimately external and stay as links: user-supplied Showcase post links, and the Supabase/CDN infra hosts.

---

## 6. Current journey as a flow (⚑ = a spot a user might need telling)

```
                         ┌─────────────────────────────────────────────┐
  First visit ──▶ #/ Welcome ──▶ "Create a profile & start"            │
                         │            │                                 │
                         │            ▼                                 │
                         │      Profile dialog (name/email[/password])  │
                         │            │                                 │
     ┌───────────────────┴────────────┼─────────────────────┐          │
     ▼                                ▼                      ▼          │
  #/baseline ⚑(30 Q / 60-min timer   #/map (journey)   #/flashcards ⚑  │
   feels like an exam, not a           │  spatial ✓      (locked until  │
   90-sec diagnostic)                  ▼                 quiz cleared ⚑ │
                              #/module/<id> = P0–PP arc                 │
                              calibrate→orient→ground→construct→        │
                              engage→stress(quiz)→commit→persist        │
                              ⚑ soft-gate purpose ("why am I typing     │
                                a position?") is implicit               │
                                     │ quiz cleared → avatar advances ✓ │
                                     ▼                                   │
                              (repeat ×10) ──▶ #/capstone (locked ⚑     │
                                                until all 10 cleared)   │
  #/profile: radar + trend + skills ✓ (strong spatial progress)        │
  #/admin ⚑ (hidden behind code 2718281828 — undiscoverable by design) │
                         └─────────────────────────────────────────────┘
```

**Where the current design still makes a user guess (to fix in the redesign, not with a tour):**
1. **Baseline reads as a test** — 30 questions + a ticking 60-min clock signals "exam," contradicting "a starting point, not a verdict." Part 3 fixes this structurally (≤8, <90s, adaptive, skippable).
2. **No visible difficulty position** — a user can't see or steer how hard the content is; there's no tier control (Part 4 transparency requirement).
3. **Soft-gate intent is implicit** — the P2/P4/P6 prompts are good but their payoff (they build "how you learn" skills) isn't shown at the moment of acting.
4. **Videos are a leap of faith** — clicking a video *leaves the site*; the user loses their place (Part 7).
5. **No install affordance on mobile** (Part 8).
6. **Admin is deliberately hidden** — correct for admins, but worth noting it's out of the learner flow.

What already answers "where am I / what's next" well and should be *kept*: the **journey map** (spatial, honest), the **avatar advance on quiz-clear**, the **next-step card**, the **skill radar**, and the **phase rail**.

---

## 7. What existing content can be graded into the four tiers

Content is authored once per concept already (concepts, quiz, apply, project, flashcards, videos) — so the brief's "one tagged tree, not four courses" is *achievable by tagging what exists*, not rewriting. Natural tier mapping:

| Existing asset | Natural tier(s) | Role under tiering |
|---|---|---|
| `concepts[{t,d}]` (definitions) | **Novice** | Defined-at-first-use blocks; render first for Novice, collapsible for Advanced |
| Primer videos (short "explained" clips) | **Novice–Beginner** | Video-before-text for Novice |
| Full-course / deep videos | **Beginner–Intermediate** | Optional for higher tiers |
| `apply` task | **Beginner–Intermediate** | Guided practice (Beginner gets hints) |
| `project` checklist | **Intermediate** | Transfer task; scaffolding toggle |
| `quiz` questions | **mixed** | Need per-question difficulty tags to feed adaptive selection |
| `callout` (PM-move asides) | **Intermediate–Advanced** | Optional depth block |
| Capstone / reference / nonsense-detector | **Advanced** | Problem-first, on-demand theory |
| Flashcards | **Novice–Beginner** | Vocabulary retention |
| Baseline per-area scores | signal source | Seeds the initial tier per concept-area |

Gap: **quiz questions and each content block need a `tier` range tag** (schema in Part 6), and the baseline must emit a **starting tier per area**, which the current 30-Q baseline computes as a % but never converts to a tier.

---

## 8. Persistence & data model (today)

- **Local:** one JSON blob per profile under `propelr_tnt_progress::<email>` holding `modules{quiz,project,phase}`, `capstone`, `baseline{tech,psych}`, `skills{snapshots}`, `streak`, `flashcards`. Session + profiles + theme are separate keys.
- **Cloud:** Supabase `progress.data` mirrors that blob (debounced upsert); `profiles`, `posts`; auth = email+password; RLS enforces per-user + admin-reads-all.
- **Against the brief:** survives refresh ✓ and device-switch ✓ (when signed in). **Missing:** IndexedDB (currently localStorage — a 5MB ceiling and synchronous), a background-sync queue for offline writes, and any offline read capability.

---

## 9. Gap analysis vs the brief

| Brief requirement | Status | Note |
|---|---|---|
| Self-evident, no tour | 🟡 partial | Map/rail/next-step strong; baseline + tier position weak |
| Immediate feedback on every action | 🟡 partial | Exists but ad-hoc; needs the 4 named registers |
| Adaptive difficulty from baseline + behaviour | 🔴 missing | No tiers, no adaptation engine |
| All YouTube inline | 🔴 missing | 100% outbound; 16/29 aren't even videos |
| Mobile PWA install | 🔴 missing | No manifest / SW / prompt |
| No layout shift, CLS < 0.05 | 🟡 partial | SVG-only helps; video/skeletons unmeasured |
| No blocking spinners <400ms | 🟢 ok | Local-first renders are instant |
| Keyboard + SR parity, focus rings | 🟡 partial | Dialogs/nav decent; needs an a11y pass + audit |
| `prefers-reduced-motion` | 🟢 ok | Honored (map, flip, timer) |
| ≤8-Q adaptive baseline <90s | 🔴 missing | Current is 30 Q / 60 min |
| Four internal tiers, one tagged tree | 🔴 missing | Content untagged |
| IndexedDB local-first + sync | 🟡 partial | localStorage + Supabase today |
| Signature progress element | 🟢 strong base | Map + radar are a real spatial progress story to build the signature on |
| Lighthouse 90/100/95 + installable | ❓ unmeasured | Baseline run needed |

---

## 10. Decisions taken & what I need from you at this checkpoint

**Decisions I'm making (opinionated, per the brief):**
1. Keep vanilla; refactor to `index.html` + `app.js` + `styles.css`; add `manifest.json` + `sw.js` + `/icons`. (§1)
2. IndexedDB becomes the local source of truth; Supabase stays as the sync target; localStorage kept only for a fast theme/session read. (§8)
3. The signature element grows out of the **journey map + skill radar** — the two honest spatial progress views already here — rather than a new gimmick. (Full proposal in DESIGN-SYSTEM.md.)
4. The four tiers drive **sequencing / scaffolding / pacing / optional-block rendering** via per-block `tier` tags; no parallel trees.

**The one thing that needs your call before Part 2, because it's content not code:**
> **The 16 non-embeddable YouTube entries (11 searches + 5 channels).** To honor "all YouTube inline," each must become a specific `watch?v=` ID. Options: **(a)** I source replacement videos per concept (I'll pick reputable ones and list them for your OK), or **(b)** you supply the IDs, or **(c)** we render them as an honest "Further viewing ↗" list clearly separated from embedded lessons. My recommendation: **(a)**, so every concept keeps a real inline video. Tell me if you'd rather (b)/(c).

**Everything else I can proceed on.** Awaiting approval to start **Part 2 — DESIGN-SYSTEM.md** (tokens, type, wireframes, the signature element, and the self-critique pass).
