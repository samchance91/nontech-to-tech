# The Learning Backbone & Skill Ontology — Admin Guide

*How the platform actually works underneath. This document is for the admin/operator, not the learner. Learners never see parameters, 0/1 flags, or this vocabulary — they see a smooth journey and a friendly, evolving profile. This is the machinery behind that.*

---

## 1. The idea in one paragraph

A learner moves from **"Where am I now?"** to **"I can stand behind what I built."** The shape of that movement is the **Universal Learning Backbone** — eight phases every learner passes through. Underneath the backbone sits the **Ontology**: a fixed map of the **skills** we track, each broken into **10–15 tiny, checkable parameters** scored `0` or `1`. As a learner does things on the platform — clears a quiz, finishes a mini-project, posts to the Showcase, defends a capstone — specific parameters flip from `0` to `1`. Add up the parameters and you get a **skill score**; snapshot the scores over time and you get **progression**. The learner sees this as a spider chart that grows, trend lines that climb, and a portfolio of real work. The admin sees the truth underneath: exactly which parameters are met, for every learner.

Two non-negotiables, both from the backbone:

- **AI may assist at every stage — it never replaces the learner's thinking, evidence, or accountability.** Skills are credited for what the learner demonstrates, not what a tool can generate.
- **Evidence over transcripts.** "A transcript says what someone studied. The portfolio shows what they actually did." Every skill parameter is tied to an observable action, not a claim.

---

## 2. Design principles (the "rethink")

We are competing for attention with things engineered to steal it, and our audience is non-technical. So:

1. **Seamless surface, rigorous spine.** The learner experience must feel light, guided, and momentum-building — one clear next step, never a wall of forms. The rigour (parameters, gates, evidence) lives in the backend and shows up only as *challenge*, never as *bureaucracy*.
2. **Challenge is the product, not the enemy of it.** Engagement doesn't come from making things easy; it comes from making hard things feel *doable and worth it*. Every phase asks something real. Some phases are **hard gates** — you cannot fake your way past them.
3. **Always show forward motion.** After every evaluation, the learner sees their spider chart move. Visible progress is the retention mechanic.
4. **Real-world contact early.** Feedback from someone who actually cares about the outcome must arrive *while the work can still change* — not as a final-week presentation.
5. **The learner owns the evidence.** Everything they produce accrues into a portfolio they carry forward.

---

## 3. The Universal Learning Backbone

Eight phases. Each phase has a question it answers, something it **produces**, and something that **checks** it. Three phases are **hard gates** — progress stops until they're genuinely passed.

| Phase | Name | The question | Produces | Checked by |
|---|---|---|---|---|
| **P0** | Calibrate | Where are you now? | Baseline result + pathway placement | *No pass/fail — placement, not an exam* |
| **P1** | Orient | What is this world, and how do people speak it? | A terrain map + working vocabulary | Can you describe the landscape in its own words? |
| **P2** | Ground | What is actually true? | An evidence base where every claim traces to a named source | **Traceability Audit (hard gate)** |
| **P3** | Construct | Can you build something useful from the evidence? | A real work product + a record of the decisions and assumptions behind it | Oral-style examination on the learner's *own* decisions |
| **P4** | Engage | Real-world contact | A real deliverable + a written reaction from someone who cares | **The recipient reacts (hard gate)** |
| **P5** | Stress | What happens if your work is wrong? | Scenario analysis + a risk register | Self-attack first, then structured peer challenge against a rubric |
| **P6** | Commit | Will you stand behind your conclusion? | A written position + a defence | **External practitioner panel (hard gate)** |
| **PP** | Persist | What evidence do you carry forward? | A published portfolio | Continuous |

The one-line logic: **Know where you are → Understand → Verify → Create → Engage → Question → Own → Prove.**

### 3.1 How our existing platform maps onto the backbone

The backbone is the *shape*; the ten tech modules are the *content* that flows through it. Nothing built so far is wasted — it gets re-expressed as phases:

| Backbone phase | On the platform today | What we add |
|---|---|---|
| **P0 Calibrate** | ✅ Baseline check (technical + learner profile) | Feed baseline results into the ontology as the *starting* skill snapshot |
| **P1 Orient** | ✅ Module intros, vocabulary, "what you can do at the end" | A per-module "terrain" recap that credits vocabulary parameters |
| **P2 Ground** | ~ "Apply it" tasks | A lightweight **traceability step**: name the source for a claim about your own product (gate) |
| **P3 Construct** | ✅ Mini-projects + ✅ Capstone PRD | Capture the *decisions/assumptions* alongside the deliverable |
| **P4 Engage** | ✅ Community Showcase | Reframe a Showcase post as "take it to someone who cares" + capture their reaction (gate) |
| **P5 Stress** | ~ Quizzes | A "break your own work" prompt on each project + a small risk register |
| **P6 Commit** | ✅ Capstone (the PRD) | Reframe the capstone as a **defended position** — this is what the certificate certifies |
| **PP Persist** | ✅ Progress + Showcase + baseline | A **Portfolio** view that assembles every artifact + the skill-growth story |

> **Design decision (please confirm):** the backbone **wraps and re-frames** the existing 10-module journey; it does **not** replace it. The modules remain the content; the backbone becomes the visible spine and the vocabulary of progress. The alternative — rebuilding the whole journey as eight generic phases and discarding the tech modules — throws away working, valuable content, so I recommend against it.

---

## 4. The Ontology (the backend)

### 4.1 Definitions

- **Skill** — a named capability we track (e.g., *APIs & Integration*, *Structured Thinking & Rigour*). Each skill has a plain-English definition and a fixed set of parameters.
- **Parameter** — one small, **observable, binary** indicator of that skill. Either the learner has demonstrated it (`1`) or they haven't yet (`0`). Parameters are written so a machine can decide, from an action the learner took, whether to flip it. No opinions, no partial credit.
- **Skill score** — `met ÷ total` parameters, as a percent. That's the only maths. A skill at 7 of 12 parameters = 58%.
- **Snapshot** — the full set of skill scores frozen at a moment in time (with what triggered it, e.g. "cleared Module 3"). Snapshots are what make the spider chart *move* and the trend lines *climb*.
- **Evidence** — the specific action that flips a parameter. Every parameter names its evidence source. If there is no evidence, the parameter stays `0`. This is the backbone's Traceability Audit applied to our own scoring: we never credit a skill we can't point to a reason for.

### 4.2 How a parameter gets checked (the backend loop)

```
learner does something  ──▶  emits an evidence event  ──▶  flips matching parameters 0→1
      (answers a quiz,        (quiz_correct: m2/q3,          (never flips back to 0)
       finishes a project,     project_done: m3,
       posts to Showcase,      showcase_posted,
       retries & passes)       quiz_retry_pass: m5)
                                        │
                                        ▼
                        recompute skill scores  ──▶  write a snapshot  ──▶  refresh the profile charts
```

Evidence event types we emit:

| Event | Fires when | Primarily credits |
|---|---|---|
| `baseline_tech(area)` | Baseline technical answer correct | seeds the matching technical skill |
| `baseline_profile(trait)` | Baseline profile completed | seeds the matching soft skill |
| `quiz_correct(module, qId)` | A specific module-quiz question is answered correctly | technical parameters for that concept |
| `module_cleared(module)` | Module quiz passed (≥70%) | completes a cluster of technical parameters |
| `project_item(module, i)` | A mini-project checklist item ticked | "applied it to my own product" parameters |
| `project_done(module)` | All of a module's project items done | rigour + construct parameters |
| `quiz_retry_pass(module)` | Failed a quiz, came back, passed | resilience |
| `showcase_posted` | Learner posts a project/finding | communication + curiosity |
| `traceability_ok(module)` | Named a real source for a claim (P2 gate) | rigour + the module's technical skill |
| `capstone_done` | Capstone PRD completed & defended | construct + communication + collaboration |

**Important:** parameters only ever go `0 → 1`. Skills don't decay. Progress is monotonic — this is deliberate, because visible, permanent growth is what keeps a non-technical learner coming back.

### 4.3 Technical skills

Seven technical skills, each tied to the module(s) that teach it. Every parameter below is a `0/1` check.

**T1 · Systems & Mental Models** *(Module 0)* — Can picture any product as client → API → backend → database, and classify any feature as read / write / update / delete / trigger.
1. Names the four layers (client, API, backend, database)
2. States what the client/frontend is responsible for
3. States what the backend/server is responsible for
4. Describes an API as a contract between client and server
5. States where data lives (the database)
6. Classifies a feature as a *read*
7. Classifies a feature as a *write*
8. Classifies a feature as an *update*
9. Classifies a feature as a *delete*
10. Classifies a feature as a *trigger*
11. Maps one of their **own** product's features onto the pipeline
12. Guesses which layer a described bug most likely lives in

**T2 · Web & Networks** *(Module 1)* — Understands how a request crosses the web and can read an exchange.
1. Explains request/response
2. Knows GET / POST / PUT / DELETE meanings
3. Interprets 200 / 400 / 401 / 403 / 404 / 500
4. Explains what DNS does
5. Explains what a CDN does
6. Explains latency and why users feel it
7. Explains caching and stale-data bugs
8. States what HTTPS protects — and what it doesn't
9. Distinguishes client-side vs server-side work
10. Reads a request/response payload
11. Inspects a real call in the browser Network tab
12. Traces a domain → server journey end to end

**T3 · APIs & Integration** *(Module 2)* — Can reason about how systems talk.
1. Defines an API as a contract
2. Explains what an endpoint is
3. Reads JSON structure
4. Maps CRUD to HTTP methods
5. Explains request headers (incl. auth token)
6. Explains status codes in an API context
7. Explains rate limits and why they exist
8. Distinguishes REST from GraphQL at a high level
9. Explains pagination / large result sets
10. Reads a real API's docs enough to say what an endpoint does
11. Makes (or traces) one real API call (e.g. in Postman)
12. Specifies the request/response an integration would need

**T4 · Data & Databases** *(Module 3)* — Can reason about how data is stored and asked for.
1. Describes tables as rows and columns
2. Explains a primary key
3. Explains a foreign key / relationship
4. Gives a one-to-many example
5. Gives a many-to-many example
6. Reads a simple SQL `SELECT`
7. Explains a `WHERE` filter
8. Explains a `JOIN` in plain terms
9. Explains why "just add a field" is sometimes expensive
10. Sketches a data model for their **own** product
11. Distinguishes data that should be stored vs derived
12. Spots a reporting question that needs a join

**T5 · Delivery, Environments & Security** *(Modules 4 & 5)* — Understands how software ships and who's allowed to do what.
1. Distinguishes local / staging / production
2. Explains what "deploying" means
3. Explains a rollback
4. Explains CI/CD at a high level
5. Explains a feature flag / gradual release
6. Distinguishes authentication from authorization
7. Explains roles / permissions (RBAC)
8. Explains multi-tenancy risk (seeing another tenant's data)
9. States what HTTPS/encryption does for data in transit
10. Writes a basic permission matrix for their **own** product
11. Names one thing that should never be exposed client-side (secrets)
12. Explains why "works on my machine" happens

**T6 · Engineering Collaboration** *(Modules 6, 7 & 8)* — Can work with an engineering team and write things that don't bounce.
1. Explains a sprint
2. Explains a standup / blocker
3. Explains a backlog and prioritisation
4. Explains technical debt
5. Explains what a good ticket contains
6. Writes acceptance criteria / a definition of done
7. Distinguishes a PRD from a ticket
8. Explains estimation uncertainty (why "how long" is hard)
9. Explains version control / a commit at a high level
10. Explains a branch and a pull request
11. Rewrites a vague request into a clear one
12. Gets a real engineer to review one of their specs

**T7 · AI Fluency** *(Module 9)* — Can talk about AI features without hand-waving, and use AI honestly.
1. Explains what a model / LLM is at a high level
2. Explains a prompt vs a system prompt
3. Explains tokens / context window
4. Explains hallucination and why verification matters
5. Explains embeddings / retrieval (RAG) at a high level
6. Explains fine-tuning vs prompting (when each is used)
7. Explains an AI "agent" / tool use
8. Identifies a task AI is good vs bad at
9. Specifies an AI feature as an input → output contract
10. States where a human must stay accountable
11. Records their **own** AI use honestly (the backbone's AI-verification record)
12. Spots an over-promised "AI" claim

### 4.4 Soft skills

Five soft skills. These are **seeded** by the P0 profile check (self-report) and then **corroborated by behaviour** — the platform watches what the learner actually does, so the score isn't just self-assessment. Behavioural parameters carry more weight in the admin's eyes because they're evidence, not opinion.

**S1 · Growth Mindset** — treats ability as buildable.
Self-report seeds (from P0): 1. Believes technical topics are learnable with effort · 2. Rejects "I'm just not a tech person" · 3. Sees struggle as normal · 4. Enjoys getting better at hard things.
Behavioural evidence: 5. Returned after a low quiz score · 6. Improved a score on retake · 7. Completed a module they found hard · 8. Kept going past the first hard gate · 9. Attempted an optional stretch · 10. Finished the journey.

**S2 · Curiosity** — drawn to how things work.
Self-report seeds: 1. Wonders how tools work · 2. Cares "under the hood" · 3. Looks up new jargon · 4. Learns outside the job.
Behavioural evidence: 5. Opened a reference/video link · 6. Explored a module out of sequence · 7. Posted a "finding" to the Showcase · 8. Asked a question in a post · 9. Inspected something real (DevTools / Postman) · 10. Completed an optional module (8 or 9).

**S3 · Structured Thinking & Rigour** — works in clear steps, sweats the details.
Self-report seeds: 1. Breaks work into ordered steps · 2. Notices details others miss · 3. Double-checks before "done" · 4. Values precise wording.
Behavioural evidence: 5. Completed **all** items of a project (not partial) · 6. Passed a Traceability step (named a real source) · 7. Wrote acceptance criteria in the capstone · 8. Recorded assumptions/decisions (P3) · 9. Produced a risk register (P5) · 10. High first-attempt quiz accuracy.

**S4 · Resilience** — stays with hard problems.
Self-report seeds: 1. Persists when confused · 2. Tries a different approach after a setback · 3. Stays motivated on long goals · 4. Bounces back from mistakes.
Behavioural evidence: 5. Retried a failed quiz and passed · 6. Finished the timed baseline without abandoning · 7. Resumed after a multi-day gap · 8. Cleared a module after an initial fail · 9. Reworked a project after feedback · 10. Reached the capstone.

**S5 · Communication & Collaboration** — asks, explains, works with others.
Self-report seeds: 1. Comfortable asking "basic" questions · 2. Explains ideas clearly · 3. Works with people who think differently · 4. Seeks feedback.
Behavioural evidence: 5. Posted to the Showcase · 6. Took work to a real recipient (P4) and logged the reaction · 7. Got an engineer to review a spec (T6-12) · 8. Responded to peer challenge (P5) · 9. Defended the capstone (P6) · 10. Gave feedback on someone else's post.

### 4.5 Scoring summary

- Each skill: **score = met parameters ÷ total × 100**, rounded.
- **Technical mastery** = average of T1–T7.
- **Profile strength** = average of S1–S5.
- **Overall** = weighted blend (suggest 70% technical / 30% soft, since the certificate certifies capability).
- After each module evaluation, we recompute all affected skills and **write a snapshot** so the charts can show change.

---

## 5. The learner profile & visualizations

Learners never see parameters. They see a living **Profile** that updates the moment they finish a module evaluation ("Your skills just moved") and is open anytime.

1. **Spider / radar chart** — 7 technical axes (optionally 12 with soft skills). Two overlays: a faint **baseline** ring (P0) and the solid **now** ring. The gap *is* the growth story. Redraws after every module.
2. **Trajectory line chart** — x = time (each snapshot), y = overall technical mastery %, with optional per-skill lines. Shows the climb.
3. **Skill bar chart** — one bar per skill at current %, sorted, so "what's strong / what's next" is obvious at a glance. A second set for soft skills.
4. **Per-module mastery** — a compact grid/heat-strip: how much of each module's skill the learner has evidenced.
5. **The Portfolio (PP)** — a reverse-chronological wall of real artifacts: baseline snapshot, each project, capstone, Showcase posts, external reactions, and the skill-growth timeline. "What they actually did."

**Admin view:** everything above per learner, plus an aggregate (cohort spider = average rings, distribution of overall %, who's stuck at which gate, parameter-level detail on demand). This is where the 0/1 truth is visible.

All charts are hand-built inline SVG — theme-aware, responsive, no external libraries — so they work identically in the hosted site and the sandboxed preview.

---

## 6. Data model (for the backend / Supabase)

```jsonc
// Fixed, ships with the app — the ontology itself
ONTOLOGY = {
  skills: {
    T1: { name, kind: "technical", modules: ["m0"], definition,
          params: [ { id: "T1p1", text, evidence: { event: "quiz_correct", ref: "m0/q1" } }, … ] },
    S1: { name, kind: "soft", definition,
          params: [ { id: "S1p5", text, evidence: { event: "quiz_retry_pass" } }, … ] },
    …
  }
}

// Per learner, stored in progress (syncs to Supabase `progress.data`)
skills = {
  params: { "T1p1": 1, "T1p2": 0, … },          // the 0/1 truth
  scores: { T1: 58, T2: 33, …, S1: 80, … },      // derived, cached
  snapshots: [
    { at: 1699999999, trigger: "baseline",   scores: {…} },
    { at: 1700400000, trigger: "m3_cleared",  scores: {…} },
    …
  ]
}
```

No new Supabase tables are required — this rides inside the existing per-learner `progress` JSON, so it syncs and appears in the admin dashboard automatically. (If we later want cohort analytics in SQL, we can promote `skills` to its own table.)

---

## 7. Implementation roadmap

Staged so the platform keeps working at every step and the learner always sees something new.

- **Stage A — Ontology in code.** Ship `ONTOLOGY` as a real data structure; wire the existing baseline + quizzes + projects to emit evidence events and flip parameters. *(No visible change yet; the backend starts scoring.)*
- **Stage B — Living profile & charts.** Build the radar / line / bar / portfolio views; show the "your skills moved" moment after each module evaluation.
- **Stage C — Backbone framing.** Re-express the journey with the P0–PP phases and their language; add the light P2 traceability step, the P5 "break your own work" prompt, and the P4 "recipient reaction" capture.
- **Stage D — Hard gates & polish.** Turn on the three hard gates (Traceability, Recipient reaction, Commit/defence) as genuine but humane checkpoints; tune the engagement loop.
- **Stage E — Admin analytics.** Cohort spider, gate funnel, parameter drill-down.

---

*This document is the source of truth for the ontology. The code implements exactly these skills and parameters; when we change one, we change it here first.*
