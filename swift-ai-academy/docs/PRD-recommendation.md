# Baseline Pathway Recommendation Test and Engine PRD v2.0 - Why, What, How

Oct 6, 2026 · Shubham Chakraborty

This document explains why every Swift AI Academy learner takes a two-part test before learning, what the test and recommendation engine must do, and how to build them. It is written for an engineer with no prior context; every term is defined in the glossary. It is the companion to the MVP Learning Platform PRD v3.0.

> Build decisions made after this PRD live in `CLAUDE.md` and win where they disagree.

# Part 1 - WHY

## 1. Why we are building this

**Context.** Swift AI Academy (ConveGenius.AI) teaches AI and workplace skills to learners enrolled by colleges and employers. Learners come from every background: B.A. History, B.Tech IT, Commerce, Science, Management, apprentices, working professionals. The catalogue offers pathways, each an ordered set of courses toward a career goal.

**Problem.** If learners pick a pathway on their own, many choose one they are not ready for (and drop out) or one far below their level (and get bored). A fixed rule like "B.Tech goes to AI" leaves non-technical learners with nothing relevant and breaks every time a course is added.

**Why it matters**

| Without it | With it |
| --- | --- |
| Wrong-level starts, early drop-off | Each learner starts where they actually are |
| Non-technical learners feel excluded | Every learner gets a relevant pathway, with a foundation route if needed |
| Hard-coded rules rewritten for every new course | New courses join recommendations automatically from their metadata |
| No explanation for the learner | Learner sees why this pathway, and where it leads |

**Goals**

| # | Goal | How we know |
| --- | --- | --- |
| G1 | Recommend the best-fit pathway from background, skills, interests and career goal | Worked examples in section 9 reproduce |
| G2 | No learner left without a recommendation | 0 empty results on 200 test profiles |
| G3 | Every recommendation explained in plain language | All 10 output elements shown (section 6) |
| G4 | New courses picked up with no code change | Gate 3 in section 6 passes |
| G5 | Questions built from the real catalogue, not invented separately | Every skill question maps to a catalogue skill tag |

**Not in this build (non-goals)**

- IQ, clinical or personality-disorder testing of any kind.
- Recommending from psychometrics alone.
- Job, salary or placement predictions.
- Machine-learning ranking (no outcome data yet); v1 uses transparent weighted scoring.
- Chatbot interface (a career chatbot will call this engine later).

# Part 2 - WHAT

## 2. Glossary

| Term | Meaning |
| --- | --- |
| Learner | Student or worker enrolled by their institution; takes the test |
| Course | A unit of learning, e.g. "Applied AI Level 1" |
| Pathway | Ordered set of courses toward a career goal, e.g. "AI Builder" |
| Baseline Pathway Recommendation Test | The two-part test every learner takes before learning |
| Part 1 - Learner Details | Form capturing education, work status, skills, goals and constraints; no right or wrong answers |
| Part 2 - Psychometric Analysis | Questions on interests, working style and light reasoning; scored into profile dimensions |
| Can-do statement | A concrete skill description a learner picks, e.g. "I can build a chart in a spreadsheet"; each maps to a skill level 0-3 |
| Skill tag | A controlled name for a skill, e.g. data_literacy, prompt_writing |
| Taxonomy | A controlled list of allowed values (qualifications, disciplines, skill tags, career outcomes, orientations) |
| RIASEC | Standard 6-type career-interest model: Realistic, Investigative, Artistic, Social, Enterprising, Conventional |
| Orientation | Work style lean: Analytical, Creative, Communication, Technical, People |
| Course metadata | Structured facts the Content Team gives for every course: prerequisites, eligible qualifications, learning outcomes, career outcomes |
| Prerequisite | Skill (at a level) or course a learner should have before starting a course |
| Learner profile | Structured result of both test parts; the engine matches this, not raw answers |
| Fit score | 0-100 number saying how well a pathway suits a learner |
| Gap routing | Adding foundation courses in front of a pathway when the learner lacks its prerequisites |
| Skip logic | Marking a course "can skip" when the learner already has its outcomes |
| Reason code | Machine tag (e.g. GOAL_MATCH) that becomes one sentence of explanation |
| Content Team | Internal team writing courses and their metadata |

## 3. Users and Where This Sits

The test runs right after account activation and before any learning. A learner cannot open a course until they have a recommendation and have chosen a pathway.

| User | Interaction |
| --- | --- |
| Learner (college-enrolled or on-the-job) | Takes Part 1 and Part 2, reads the recommendation, accepts or picks an alternative, can retake once per 30 days |
| Content Team | Fills course and pathway metadata; writes can-do statements for new skill tags |
| Back-office operator | Edits taxonomies and weights, resets tests, overrides a pathway with a reason |
| Platform (MVP Learning Platform) | Calls the engine through one API and stores the chosen pathway |
| Career chatbot (later) | Will call the same API |

**Position in the learner journey:** Enrolment > Activation > **Part 1 Learner Details > Part 2 Psychometric Analysis > Recommendation > Pathway choice** > Learning > Quizzes > Completion > Certificate.

## 4. The Two-Part Test

About 15 minutes in total. Part 1 opens first; Part 2 unlocks once Part 1 is submitted. Both autosave on every answer and can be finished in separate sittings.

| Part | Purpose | Format | Time | Output |
| --- | --- | --- | --- | --- |
| Part 1 - Learner Details | Who the learner is and where they start | Dropdowns and can-do statements | 5-6 min | Values mapped to taxonomies |
| Part 2 - Psychometric Analysis | What suits them | Likert, forced choice, scenario, short reasoning items | 8-10 min | Scores per dimension |

**Part 1 - Learner Details**

| Block | Captures | Input type | Maps to |
| --- | --- | --- | --- |
| A. Education | Qualification, degree / stream / discipline, year or stage | Dropdowns, prefilled from roster | qualification_level, discipline |
| B. Work status | Employment, internship or apprenticeship, role, career stage | Single select | learner_type, career_stage |
| C. Exposure and skills | Subjects studied, tools used, skill level per relevant skill | One can-do statement per skill tag, e.g. data_literacy: 0 "Not yet", 1 "I can read a chart", 2 "I can build a chart in a spreadsheet", 3 "I can analyse a dataset and explain findings" | skill_levels {tag: 0-3} |
| D. Goals | Learning objective, career aspiration (up to 2) | Select | career_goals |
| E. Constraints | Hours per week, device, language | Select | constraints |

Block C only shows skill tags that appear in the live catalogue. There is no knowledge quiz; to catch over-claiming, failing the first graded quiz of the recommended course at a declared level of 2 or more shows a "Review your recommendation" prompt.

**Part 2 - Psychometric Analysis** (about 40-50 items)

| Dimension | Measures | Item type | Output |
| --- | --- | --- | --- |
| Career interests | RIASEC profile | "How much would you enjoy..." 5-point scale | 6 scores, 0-100 |
| Work-type preference | Data, people, ideas, things | Choose between two tasks | Preference vector |
| Orientations | Analytical, problem-solving, creative, communication | Scenario: pick the response closest to you | 5 scores, 0-100 |
| Working preferences | Solo vs team, structured vs open, pace | 5-point scale | Tags |
| Learning preferences | Watch, read, do, discuss | Rank order | Tags (tips only, not ranking) |
| Behavioural tendencies | Persistence, curiosity, comfort with ambiguity | 5-point scale, work-context wording | Scores, used only to break ties |
| Aptitude indicators | Pattern, numerical, verbal reasoning | 6-9 timed MCQs | Band: low / mid / high |

Two repeated items act as an attention check. Inconsistent answers mark the profile low-confidence, which sets the psychometric weight to 0 for that learner. Item banks come from public-domain sources (O*NET Interest Profiler, IPIP), licence to confirm.

**What the learner sees after each part:** "Your starting point" and "What you enjoy" summaries in plain words; never raw scores or labels like "low aptitude".

## 5. Course Metadata and Taxonomies

The engine can only match what both sides describe in the same words. The Content Team describes every course with the fields below, using only values from the taxonomies; the test maps learner answers to the same taxonomies.

**Course metadata (Content Team)**

| Field | Required | Format | Engine use |
| --- | --- | --- | --- |
| course_code, title, level | Yes | Text, integer | Identity, order |
| prerequisites | Yes | List of {skill_tag, min_level} and / or course_codes; empty = open entry | Readiness, gap routing |
| eligible_qualifications | Yes | Qualification levels + disciplines, or "any" | Background fit |
| learning_outcomes | Yes | List of {skill_tag, level_after} + one-line statement | Skip logic, explanation |
| career_outcomes | Yes | career_outcome tags | Goal fit, explanation |
| domain | Recommended | Domain tag | Interest fit |
| difficulty | Recommended | Foundation / Intermediate / Advanced | Readiness |
| orientation_tags | Recommended | Orientation values | Psychometric fit |
| related_courses | Optional | course_codes | Alternatives |
| est_hours | Optional | Number | Time constraint check |

A course missing any required field cannot be published.

**Pathway metadata**

| Field | Required | Engine use |
| --- | --- | --- |
| pathway_id, name, ordered courses (required / optional) | Yes | Composition |
| career_outcomes | Yes | Goal fit |
| entry_requirements | Derived from first course | Readiness |
| target_learner | Recommended | Background fit |
| foundation_route | Optional | Preferred gap route |

**Taxonomies (illustrative values; curriculum team finalises)**

| Taxonomy | Example values |
| --- | --- |
| Qualification level | Class 12, Diploma / ITI, UG in progress, UG complete, PG, Working |
| Discipline | Arts / Humanities, Commerce, Science, Engineering / IT, Management, Vocational, Other |
| Skill tags (levels 0-3, each with can-do statements) | prompt_writing, data_literacy, spreadsheet, python_basics, written_comm, spoken_comm, bot_design |
| Domain | AI and data, Communication, Low-code / bots, Business |
| Orientation | Analytical, Creative, Communication, Technical, People |
| Career outcome | AI-enabled operations associate, Customer success executive, Bot developer (low-code), Data assistant |

Rule: a new tag is added to its taxonomy first, then used in a course.

## 6. Output, Requirements and Definition of Done

The recommendation screen must answer: given my background, interests and goals, what should I learn next, why, and where can it take me?

**The 10 output elements**

| # | Element | Source |
| --- | --- | --- |
| 1 | Primary pathway (name, courses count, est. hours) | Pathway metadata |
| 2 | Why this fits (2-3 sentences, under 60 words) | Top reason codes |
| 3 | Background factors that counted | Part 1 reason codes |
| 4 | Interest factors that counted | Part 2 reason codes |
| 5 | Career outcome ("builds toward...") | Pathway career_outcomes |
| 6 | Learning outcomes (3-5) | Course learning_outcomes |
| 7 | Ordered courses with "can skip" tags | Pathway + skip logic |
| 8 | Foundation courses needed first, if any | Gap routing |
| 9 | Up to 2 alternatives, one-line reason each | Ranking |
| 10 | Actions: Start, Choose alternative, Retake test | Platform |

**Functional requirements** (P0 = this build, P1 = if time allows)

| ID | Requirement | Acceptance test | P |
| --- | --- | --- | --- |
| MET-01 | Course cannot publish without required metadata | Missing field blocks publish with field-level error | P0 |
| MET-02 | Only taxonomy values accepted | Unknown tag rejected | P0 |
| TAX-01 | Taxonomies editable as data | New skill tag added without deploy | P0 |
| T1-01 | Part 1 blocks A-E with branching by learner type | Engineering and Arts test users each finish in 6 minutes or less | P0 |
| T1-02 | Block C built from live catalogue skill tags | 0 statements for tags not in catalogue | P0 |
| T1-03 | Can-do statements only, no self-rating scale | Every level choice is a concrete statement | P0 |
| T2-01 | Part 2 covers all 7 dimensions | Each produces a score or tag | P0 |
| T2-02 | Attention check | Inconsistent set marks profile low-confidence; psychometric weight = 0 | P0 |
| T-03 | Autosave and resume both parts | Exit mid-part, resume at same item | P0 |
| PRF-01 | Versioned learner profile | Written within 5 seconds of Part 2 submit | P0 |
| REC-01 | Deterministic ranking | Same profile + catalogue = same result | P0 |
| REC-02 | Never empty | 0 empty results across 200 synthetic profiles | P0 |
| REC-03 | Gap routing | Unmet prerequisites produce a foundation route, never a rejection | P0 |
| REC-04 | Skip logic | Course with outcomes already held shows "can skip" | P0 |
| REC-05 | Weights and threshold in config | Change applies to next request without deploy | P0 |
| EXP-01 | Reason-code explanations | Output shows background and interest reasons | P0 |
| EXP-02 | Wording guardrails | 0 job, salary or placement promises in QA set | P0 |
| DYN-01 | New course auto-detected | Valid course appears in next recommendation, no code change | P0 |
| DYN-02 | Missing can-do statements prompt | Task raised to Content Team | P1 |
| OVR-01 | Learner retake | Max once per 30 days | P0 |
| OVR-02 | Back-office override | Logged with operator and reason | P0 |
| LOG-01 | Snapshot every recommendation | Inputs, scores, reasons, output stored | P0 |
| CHK-01 | Over-claim check | First graded-quiz fail at declared level 2+ shows review prompt | P1 |

**Definition of done (on staging)** — called E1-E7 in `CLAUDE.md`

| Gate | Done when | Verdict |
| --- | --- | --- |
| 1 | 200 synthetic profiles across all 7 disciplines each get at least 1 recommendation | 0 empty |
| 2 | Learner A and Learner B examples (section 9) reproduce exactly | PASS / FAIL |
| 3 | New course with valid metadata appears in recommendations with no code change | PASS / FAIL |
| 4 | Course with a missing required field is blocked from publishing | PASS / FAIL |
| 5 | Every output shows all 10 elements | 10 / 10 |
| 6 | Same profile re-run returns identical ranking | PASS / FAIL |
| 7 | QA explanation set has 0 job, salary or placement promises | Count = 0 |

# Part 3 - HOW

## 7. How It Works End to End

The learner side turns the two test parts into one profile; the catalogue side keeps an index of every published course and its metadata. Both meet at scoring (section 9). A missing prerequisite adds foundation courses in front of the pathway instead of ending the journey.

## 8. Data Model

PostgreSQL tables added to the platform schema. learner_id, course_id and pathway_id are the platform's own keys.

| Table | Key columns | Notes |
| --- | --- | --- |
| taxonomy | taxonomy_type, code, label, status | One typed table for all controlled lists |
| skill_statement | skill_tag, level (0-3), statement_text | Can-do statements shown in Part 1 block C |
| course_meta | course_id, prerequisites JSON, eligible_qualifications, learning_outcomes JSON, career_outcomes, domain, difficulty, orientation_tags, related_courses, est_hours | 1:1 course |
| pathway_meta | pathway_id, career_outcomes, target_learner, foundation_route | 1:1 pathway |
| skill_edge | from_course_id, to_course_id, skill_tag | Prerequisite graph: from_course teaches what to_course needs; rebuilt on every publish |
| test_item | item_id, part (learner_details / psychometric), block or dimension, type, options, scoring_key, status | Item bank |
| test_attempt | attempt_id, learner_id, part, responses JSON, started_at, submitted_at | Raw answers |
| learner_profile | learner_id, profile_version, attributes JSON, confidence (high / low) | New version on every retake |
| engine_config | version, weights JSON, threshold, active_from | Versioned |
| recommendation | rec_id, learner_id, profile_version, catalogue_version, config_version, ranked_output JSON, reason_codes, fallback, created_at | Full snapshot; any result can be reproduced |
| recommendation_action | rec_id, action (accepted / alternative / retake / override), actor, reason, ts | Feeds pathway_assignment in the platform |

**learner_profile.attributes**

| Attribute | From | Format |
| --- | --- | --- |
| qualification_level, discipline | Part 1 A | Taxonomy codes |
| learner_type, career_stage | Part 1 B + roster | Enum |
| skill_levels | Part 1 C | {skill_tag: 0-3} |
| career_goals | Part 1 D | Up to 2 career_outcome codes |
| constraints | Part 1 E | Hours band, device, language |
| riasec, orientations | Part 2 | 6 and 5 scores, 0-100 |
| aptitude_band | Part 2 | low / mid / high |
| preferences | Part 2 | Tags |

## 9. Scoring Algorithm

v1 is transparent weighted scoring plus a prerequisite graph. No machine learning. Every step emits reason codes that become the explanation.

**Steps**

- **Candidates** - every published pathway open to the learner's learner_type.
- **Background (B)** - compare qualification and discipline with the pathway's eligible_qualifications: full match 100, partial 60, none 20. "None" lowers the score; it never removes the pathway.
- **Readiness (R)** - for each entry prerequisite {skill_tag, min_level}, check learner skill_levels. R = met / required x 100. Unmet tags become the gap list.
- **Career goal (C)** - primary goal in pathway career_outcomes 100, secondary goal 60, none 0.
- **Psychometric (P)** - cosine similarity between the learner's interest + orientation vector and the pathway's orientation_tags vector, x 100. P = 0 if profile confidence is low.
- **Fit** - weighted sum (formula below).
- **Gap routing** - for top pathways with a gap, walk skill_edge backwards to find the fewest foundation courses whose learning_outcomes cover the missing tags. Output becomes "foundation route + target pathway"; R is recomputed as if the route is done, minus a 10-point route penalty.
- **Skip logic** - any course whose every learning_outcome the learner already holds at or above level_after is marked can_skip.
- **Rank and guarantee** - sort by Fit; return primary + up to 2 alternatives. If none clear the threshold (default 55), return the foundation route toward the learner's top career goal; if no goal matches, return the default open-entry pathway. Result is never empty.
- **Explain** - top reason codes become sentences via templates.

Fit = 0.25 B + 0.25 R + 0.30 C + 0.20 P

Weights, threshold and route penalty live in engine_config. Psychometric weight is capped at 0.25 so it can refine, never decide.

**Reason codes (examples)**

| Code | Sentence template |
| --- | --- |
| GOAL_MATCH | "It builds toward {career_outcome}, your stated goal." |
| PREREQ_MET | "You already have {skill} at the level this pathway needs." |
| PREREQ_GAP | "{course} first will give you {skill}, which this pathway needs." |
| INTEREST_ALIGN | "You enjoy {interest}, which this pathway uses a lot." |
| SKIP_ELIGIBLE | "You can skip {course}; you already have what it teaches." |
| BACKGROUND_FIT | "It suits learners from {discipline}." |

**Worked examples (illustrative pathways)**

|  | Learner A: B.A. History | Learner B: B.Tech IT |
| --- | --- | --- |
| Part 1 | UG, Arts; prompt_writing 1, data_literacy 0, written_comm 2 | UG, Engineering / IT; python_basics 2, data_literacy 2, prompt_writing 2 |
| Part 2 | High Social, Artistic; strong communication | High Investigative; strong analytical, technical |
| Goal | Customer success executive | Bot developer (low-code) |
| Engine finds | AI Builder has a data_literacy gap; Workplace Communication matches goal and interests | All AI Builder prerequisites met; Applied AI L1 outcomes already held |
| Primary | Workplace Communication | AI Builder, starting at Applied AI L2 (L1 can skip) |
| Alternative | Applied AI L1 as foundation, then AI-Ready Professional | AI-Ready Professional |

Different starting points get different, relevant results; neither learner is rejected.

## 10. Dynamic Course Detection

Adding a course is a data change, never a code change. The engine reads course_meta and skill_edge on every request, so a newly published course is considered from the next recommendation.

- Content Team saves course metadata (section 5).
- Validator checks required fields and that every tag exists in its taxonomy; any failure blocks publishing with a field-level error.
- On publish, skill_edge is rebuilt: for each prerequisite tag of the new course, link every course whose learning_outcomes supply that tag; and vice versa.
- If the course uses a skill tag that has no can-do statements, Part 1 block C cannot ask about it yet; a task is raised to the Content Team (DYN-02). Until then that tag counts as level 0 for every learner.
- catalogue_version increments; the next recommendation request includes the course in candidates and routing.
- Existing learners keep their pathway; they may see a "New pathway that fits you" notice if their profile now ranks it first.

| Event | System reaction |
| --- | --- |
| Course published | Validate, rebuild skill_edge, bump catalogue_version |
| Course metadata edited | Same as publish |
| Course unpublished | Removed from candidates; learners already on it unaffected |
| Taxonomy tag added | Available to course metadata and Part 1 immediately |
| Weights changed | New engine_config version; applies to next request |

## 11. Interface Contract

One internal API used by the platform today and the career chatbot later. Proposed names; engineering may rename.

| Method and path | Purpose |
| --- | --- |
| GET /tests/{part} | Load Part 1 or Part 2 items for the learner (Part 1 block C built from live skill tags) |
| PUT /tests/{part}/responses | Autosave answers |
| POST /tests/{part}/submit | Submit; Part 2 submit builds learner_profile |
| POST /recommendations | Run engine for learner_id; returns result below |
| POST /recommendations/{rec_id}/actions | accepted, alternative, retake |
| POST /admin/recommendations/override | Back-office override with reason |
| PUT /admin/engine-config | New weights / threshold version |
| CRUD /admin/taxonomy, /admin/course-meta | Data management with validation |

**POST /recommendations response (example)**

```json
{
  "rec_id": "rec_8f2c",
  "learner_id": "lrn_1042",
  "profile_version": 1,
  "catalogue_version": 14,
  "config_version": 3,
  "fallback": false,
  "primary": {
    "pathway_id": "pw_ai_builder",
    "name": "AI Builder",
    "fit": 94,
    "components": {"B": 100, "R": 100, "C": 100, "P": 70},
    "why": "It builds toward Bot developer, your stated goal. You already have the data skills it needs.",
    "background_reasons": ["PREREQ_MET:data_literacy", "BACKGROUND_FIT:engineering_it"],
    "interest_reasons": ["INTEREST_ALIGN:investigative"],
    "career_outcomes": ["bot_developer_lowcode"],
    "learning_outcomes": ["Design a working chatbot flow", "Use AI tools to prototype"],
    "courses": [
      {"course_id": "AAI-L1", "can_skip": true},
      {"course_id": "AAI-L2", "can_skip": false},
      {"course_id": "SCBB", "can_skip": false}
    ],
    "foundation_route": []
  },
  "alternatives": [
    {"pathway_id": "pw_ai_ready", "fit": 71, "why": "Broader AI skills for any role."}
  ]
}
```

Timeout 5 seconds. On error the platform falls back to a rule-based default and stores fallback = true.

## 12. Non-Functional, Fairness, Privacy, Events, Phasing

| Area | Requirement |
| --- | --- |
| Reproducibility | Any recommendation can be re-run from its snapshot (profile, catalogue and config versions) |
| Fairness | Gender, caste, religion, disability and location are never inputs; quarterly check that results for the same profile band do not differ by gender beyond 10 percentage points |
| Privacy | Psychometric answers are sensitive personal data (DPDP Act 2023): explicit consent, learner-only visibility; institutions see the chosen pathway, never psychometric scores |
| Learner wellbeing | Strength-based wording only; no negative labels |
| Speed | Recommendation under 3 seconds for up to 200 courses |
| Mobile | Both parts usable at 360 px on Android Chrome; save on every answer |
| Validity | Psychometric items reviewed by a qualified assessment expert before pilot; reliability check after first 300 completions |

**Analytics events** (all carry learner_id, timestamp)

| Event | Fired when |
| --- | --- |
| test_part_started, test_part_submitted | Each part begins / ends |
| profile_generated | learner_profile written (with confidence) |
| recommendation_shown | Output displayed (rec_id, fallback) |
| recommendation_accepted, alternative_chosen, test_retaken | Learner action |
| recommendation_overridden | Back-office override |
| review_prompt_shown | Over-claim check fires |

**Phasing**

| Phase | Scope | When |
| --- | --- | --- |
| Phase 1 | Part 1 A-E; short Part 2 (interests + orientations, about 20 items); scoring, gap routing, skip logic, template explanations; metadata for launch and test courses | Inside the MVP build window |
| Phase 2 | Full Part 2 incl. aptitude and tendencies; over-claim check; LLM rewording of reasons; Hindi | Next quarter |
| Phase 3 | Career chatbot front end; weights tuned on real outcomes | After first cohort completes |

If Phase 1 slips, the platform ships with the rule-based fallback behind the same API and switches over with no platform change.

## 13. Decisions, Risks, Open Questions

**Decisions already made**

| Topic | Decision |
| --- | --- |
| Test structure | One test, two parts: Learner Details, then Psychometric Analysis |
| Skill capture | Can-do statements in Part 1; no knowledge quiz |
| Role of psychometrics | Refines ranking (weight 0.20, cap 0.25); never decides eligibility |
| No dead ends | Unmet prerequisites add a foundation route instead of rejecting |
| Catalogue-driven | Questions, matching and new courses all read course metadata |
| Ranking method | Transparent weighted scoring in v1; ML later |

**Risks**

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Incomplete course metadata | Wrong or weak matches | Publish blocked without required fields; taxonomy validation |
| Small catalogue (9 courses, 3 pathways) | Recommendations look similar | Skip logic and foundation routes add variety; show a single honest option when that is the fit |
| Learners over-claim skills | Placed too high, early failure | Concrete can-do statements; review prompt after first graded quiz |
| Psychometric licence or validity issue | Legal or credibility risk | Public-domain banks; expert review before pilot |
| Test fatigue (about 15 minutes) | Drop-off before learning | Autosave, separate sittings, prefill, short Phase 1 Part 2 |
| Over-claiming career outcomes | Trust and compliance risk | Template guardrails; "builds toward" wording |

**Open questions**

- [ ] Final taxonomy lists and owner from the curriculum team?
- [ ] Psychometric item bank licence confirmation?
- [x] Is the test mandatory for every learner, or can back-office assign a pathway directly? — Mandatory; override is the exception (CLAUDE.md decision 12).
- [ ] Can institutions see Part 1 results (never Part 2) in future dashboards?
- [x] Phase 1 inside the current MVP window, or rule-based fallback first? — Phase 1 in window, fallback built first (CLAUDE.md).

**Related documents:** MVP Learning Platform PRD v3.0 (`docs/PRD-platform.md`); PRD - Baseline Pathway Recommendation Test and Engine (previous version).
