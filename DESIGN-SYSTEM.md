# DESIGN-SYSTEM.md — Part 2

*Tokens, type, layout, and the one signature element — grounded in the Propelr brand, pushed into something specific to a learning platform. Ends with the required self-critique pass. **Checkpoint: approve before Part 3 (component library / baseline).***

The organizing idea, one sentence: **an instrument panel for learning** — a calm, near-monochrome surface where the only bright thing is *you and your frontier*, and the whole subject is drawn as one honest map you can see your position on.

---

## 1. Palette — 6 roles, one accent, held with discipline

Built on Propelr's core (`#2C2C2C` / `#FFD700` / `#FFFFFF`). Yellow is **attention only** — the active node, the frontier, focus rings, the single primary action. It never fills a large area and never carries body text.

**Light**
| Role | Token | Hex | Used for |
|---|---|---|---|
| Surface (ground) | `--surface` | `#F7F7F7` | page |
| Surface (raised) | `--surface-2` | `#FFFFFF` | cards, players |
| Ink (primary) | `--ink` | `#2C2C2C` | text, mastered terrain |
| Ink (muted) | `--ink-2` | `#6A6A6A` | secondary text, data labels |
| Accent | `--accent` | `#FFD700` | active/frontier/primary action **only** |
| Signal-positive | `--pos` | `#28A745` | correct, mastered-confirm |
| Signal-attention | `--warn` | `#F5A623` | hint used, revisit nudge |
| Error | `--err` | `#D92D20` | destructive / genuine failure only |
| Line | `--line` | `#D9D9D9` | borders, contour lines |

**Dark** (same roles): `--surface #0C0C0C` · `--surface-2 #1A1A1A` · `--ink #FFFFFF` · `--ink-2 #B5B5B5` · `--accent #FFD700` · `--pos #34C759` · `--warn #FF9500` · `--err #FF453A` · `--line #2F2F2F`.

**Tier encoding — deliberately NOT a fifth, sixth, seventh hue.** The four tiers are a **monochrome elevation ramp**, never colour alone (WCAG: always paired with a label + fill level):

```
Novice  ░ 25% ink fill   Beginner ▒ 50%   Intermediate ▓ 75%   Advanced █ 100% ink
```

Your **current** tier/frontier is the only thing that turns yellow. This is the whole discipline: the map is grayscale terrain; *you* are the light.

---

## 2. Type — the personality lives here

Three faces, self-hosted as subset **woff2** with `font-display: optional` (zero layout shift, works offline — no Google Fonts request):

| Face | Family | Role |
|---|---|---|
| **Display** | Poppins (600/700) | headings, the one big number on a screen |
| **Body** | Inter (400/500/600) | everything you read |
| **Data / instrument** | Space Mono (400/700) | tier labels, node coordinates, counts, timers, "12 / 15 mastered" |

**The opinionated move:** Space Mono is not decoration — it is the **instrument voice** of the whole platform. Every piece of progress data (your position, your mastery counts, your tier, the frontier label) is set in mono, tracked `+0.02em`, uppercased for labels. That single choice makes the product read like a cartographer's console rather than another course site, and it's the thread that ties the signature element to the chrome. Poppins/Inter alone would read generic; mono-as-instrumentation is the personality.

**Modular scale** (major-third-ish, on the 8px rhythm):

```
Display  clamp(2.4rem, 6vw, 3.75rem)  Poppins 700  tracking -0.02em
H1       2.0rem   Poppins 700  -0.02em
H2       1.5rem   Poppins 600  -0.01em
H3       1.25rem  Poppins 600
Body-lg  1.125rem Inter 400    (paragraph max-width 68ch)
Body     1.0rem   Inter 400
Data     0.8125rem Space Mono 700  UPPERCASE  +0.02em   ← the instrument voice
Caption  0.75rem  Inter 500
```

---

## 3. Layout, spacing, motion

- **8px grid.** Spacing: 4 · 8 · 16 · 24 · 32 · 40 · 48 · 64 · 80 · 96.
- **Radius:** control 12 · card 16 · dialog 20 · pill 999. **Shadow:** one level only — `0 6px 16px rgba(44,44,44,.08)`.
- **Web grid:** 12-col, container 1140, reading column ≤ 68ch.
- **Reserved geometry everywhere** (CLS < 0.05): the VideoBlock is a fixed 16:9 box before it loads; skeletons match final node/card geometry; the Atlas has fixed intrinsic SVG dimensions.
- **Motion tokens:** `--fast 120ms` (press/hover) · `--base 240ms` (reveal) · `--move 480ms` (avatar/atlas), easing `cubic-bezier(.2,0,0,1)`. Every motion has a static end-state; `prefers-reduced-motion` snaps to it (no fades, no travel — the avatar *cuts* to position).

---

## 4. The signature element — **The Atlas**

> The one thing this platform is remembered for. It replaces the percentage ring entirely.

**What it is:** a single persistent, spatial map of the *entire subject* — not 10 stops, but every concept as a node, grouped into regions (modules), connected by prerequisite trails. It is simultaneously the **home screen, the navigation, and the progress model**. There is no separate "progress bar" anywhere; progress *is* the terrain filling in.

**How it encodes four dimensions at once, honestly:**

| Dimension | Encoding | Honesty |
|---|---|---|
| **Mastery** | each node is a hexagon that **fills from empty→solid ink as its real ontology parameters flip 0→1** | shows *actual* mastered checkpoints, not a rounded % |
| **Tier** | node's fill *ramp step* + a mono label on focus (`NOVICE`→`ADVANCED`) | the difficulty you're being served, visible and honest |
| **Frontier** | exactly one node/region glows **yellow** — where you are, what's next | answers "where am I / what's next" with zero words |
| **Reachability** | locked terrain sits under a soft **contour fog**; trails light as prerequisites clear | you can see the shape of the whole journey but not skip blindly |

```
            THE ATLAS  (home)                         legend
   ╔══════════════════════════════════════╗   ▟ mastered (solid ink)
   ║  ◇─◇─◆        ◇                       ║   ◈ in progress (part-filled)
   ║  │   │╲      ╱                        ║   ◇ available
   ║  ◆───◈──────◆   ← ⬤ YOU (yellow)      ║   ·· locked (fog)
   ║        ╲      ╲                       ║
   ║  region: DATA   · · frontier: APIs ·· ║   tier ramp: ░▒▓█
   ║  ·· ·· ·· locked ·· ·· ··             ║
   ╚══════════════════════════════════════╝
   [ TIER ▓ INTERMEDIATE ▾ ]   ← the single visible tier control (Part 4)
   12 / 47 CONCEPTS MASTERED · FRONTIER: “What is an API?”   ← mono instrument line
```

**Interaction:** tap a node → its lesson. The frontier node has the one primary (yellow) action: **"Continue → What is an API?"**. Zoom is region↔concept (direct manipulation, not a menu). The avatar animates along the trail on mastery (`--move`, or snaps under reduced-motion).

**Why it satisfies the brief where a % bar fails:** it's spatial (a place, not a number), honest (filled checkpoints, not a smoothed percent), information-dense (mastery + tier + frontier + reachability in one glance), self-evident (the yellow node *is* "what's next"), and it doubles as the map Part 6 demands. The existing radar + trend become the *secondary* "at a glance" panel on the Progress screen — kept, demoted.

---

## 5. Layout concept + wireframes

**Concept:** *console, not brochure.* A quiet grayscale field; one yellow focus at a time; the instrument line (mono) always tells you position and next step; the primary action is unmistakable and thumb-reachable.

### Home = the Atlas
```
┌───────────────────────────────────────────────┐
│ Propelr        [Atlas][Progress][Cards]   ⌘ ◐ ●│  ← chrome; ⌘=menu(<1024), ●=you
├───────────────────────────────────────────────┤
│  THE ATLAS  (§4)                                │  ← the whole subject, your frontier lit
│                                                 │
│  [ Continue → “What is an API?”  ▶ ]  (yellow)  │  ← ONE primary action
│  TIER ▓ INTERMEDIATE ▾    12/47 MASTERED        │  ← instrument line + tier control
└───────────────────────────────────────────────┘
```

### Lesson (tier-aware, carries the new media model)
```
┌───────────────────────────────────────────────┐
│ ‹ Atlas · DATA          NODE: “What is an API?” │  ← recognition, not recall
│ TIER ▓ INTERMEDIATE ▾   ●●●○○ concept 3/5       │  ← where you are in this node
├───────────────────────────────────────────────┤
│ [ 16:9 VIDEO — facade poster ▶ ]  ≤10 min       │  ← primary lesson, embedded (Part 7)
│   Chapters: 0:00 · 2:10 · 4:30  (seek in place) │
│ ▸ Go deeper (in-depth video)      ← on demand   │  ← tier-gated disclosures
│ ▸ Learn to build it (coding video)              │
│ ▸ Resources ↗  source · eng blog · docs         │  ← real external links, marked ↗
│                                                 │
│ [ concept text — Novice sees this first ]       │  ← tier reorders text vs video
│ ┌─ Practice ──────────────────────────────────┐│
│ │ Q … ( Beginner: [Show a hint] before answer )││  ← scaffolding density = tier
│ │ [ Check answer ]  (yellow)                   ││  ← names exactly what it does
│ └──────────────────────────────────────────────┘│
│ ◀ back always visible        Next node → (after)│  ← reversible, one next step
└───────────────────────────────────────────────┘
```

### Progress
```
┌───────────────────────────────────────────────┐
│ PROGRESS                              🔥 5-day  │
│ [ mini-Atlas: regions filled ]  ← same object   │  ← primary progress = the Atlas again
│ Radar (skills)   |   Trend (mastery over time)  │  ← kept, demoted to “at a glance”
│ 12 / 47 CONCEPTS · TIER ▓ · biggest gain: APIs  │
│ Portfolio ▸ what you actually built             │
└───────────────────────────────────────────────┘
```

---

## 6. The four feedback registers as tokens (preview of Part 5)

Defined here so components inherit them: **Instant** = `--fast` press/hover + focus ring `0 0 0 3px color-mix(accent 45%)`; **Confirmation** = optimistic state + toast with undo, `--base`; **Evaluative** = answer card (what happened · why · one next step), never bare "Wrong"; **Progressive** = the Atlas node fills *at the moment of the action*, avatar moves. These become real components in Part 3.

---

## 7. Self-critique — where this risked reading generic, and what I changed

The brief demands this pass. I checked every choice against "would this be the default answer for any e-learning site?"

1. **Percentage ring → cut.** The current app has a % completion ring on the map. That's the generic answer. **Changed:** progress is now the Atlas filling in (checkpoints, not percent). No bar is the primary progress anywhere.
2. **Poppins + Inter alone = safe/templated.** True — that pairing is everywhere. **Changed:** promoted **Space Mono to the instrument voice** for all progress/data, which is the personality and the through-line to the signature. Type now carries meaning, not just text.
3. **Yellow-on-black could drift toward the forbidden "near-black + one acid accent" cliché.** **Guardrails added:** yellow is restricted to *active/frontier/primary-action only* (never fills, never large), and it is warm-yellow not acid, on an off-white default ground — not the dark-mode-first neon look the brief rejects. Also explicitly *not* the cream+serif+terracotta or broadsheet-hairline defaults: no serifs, no hairline rules as structure (the Atlas is the structure).
4. **"Skill tree" is the generic gamified answer.** **Changed:** the Atlas is a *terrain/contour* map keyed to the real ontology parameters and tiers, not XP orbs or a branching tech tree — mastery is honest fill, tier is elevation, and it doubles as navigation, so it earns its place instead of decorating.
5. **Four tiers tempted four colours.** That would break "one accent." **Changed:** tiers are a monochrome ramp + labels; the only colour is you.
6. **Radar/trend were the star; that's a dashboard cliché if left primary.** **Changed:** demoted to a secondary "at a glance" panel; the Atlas is primary.

Anything that still smells generic after this, flag it and I'll revise before Part 3.

---

**Awaiting approval to start Part 3** — the component library with the four feedback registers built and demonstrable (then the baseline flow). I'll keep stopping at each checkpoint per your sequence.
