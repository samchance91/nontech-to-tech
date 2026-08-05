# Tech for Non-Tech People — a Propelr course

An interactive, self-contained course platform that turns the "Tech for Non-Tech
People" curriculum into a guided learning journey for PMs, founders, and anyone
running a tech team without writing code.

It ships as a single HTML file — no build step, no server, no dependencies. Open
it, and it runs.

## What's inside

- **A journey map** with a traveller that walks stop-to-stop across the course as
  you complete modules. The trail behind you is Propelr Yellow; the road ahead is
  neutral grey.
- **A milestone tracker** — overall progress, modules cleared, projects done, and
  the capstone — saved on your device.
- **10 modules**, each opening with **"What you can do at the end of this module,"**
  then *why it matters*, embedded **video links**, key vocabulary, an *Apply it*
  task, a **quiz** with instant feedback, and an **end-of-module mini-project**.
- **A final capstone** — write a real PRD for your own product — unlocked once every
  module quiz is cleared.
- A **reference** section: the "bullshit detector" and the standing principles.
- **Light and dark themes**, full mobile support (works down to 320px wide), keyboard
  navigation, and reduced-motion support.

## Running it

Just open `index.html` in any modern browser — double-click it, or drag it into a
browser tab. Nothing is uploaded; your progress lives in this browser's
`localStorage` on this device. Clearing your browser data (or the in-app **Reset**
button) clears it.

To serve it over a local URL instead:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Any static host (GitHub Pages, Netlify, S3, an internal server) will serve the file
as-is.

## How progress works

- A module is **cleared** when you pass its quiz (70%+). Clearing a module advances
  your traveller on the map.
- Mini-projects and the capstone are tracked separately via their checklists.
- All of it is stored under a single `localStorage` key (`propelr_tnt_progress_v1`)
  and merges forward safely if the course content changes.

## Brand & design

Built against the Propelr brand system. The design tokens (colours, type scale,
spacing, radii, motion) live in `:root` inside `index.html` and mirror the source
files kept for reference in [`design/`](./design):

- `design/propelr-brand-guidelines.md`
- `design/propelr-design-tokens.json`

### Two deliberate substitutions

1. **Fonts.** The brand fonts are Poppins (headings), Inter (body), and Space Mono
   (technical). Because the app is fully self-contained, it uses the brand's own
   fallback stacks rather than fetching web fonts. To use the real fonts when
   self-hosting, add `@font-face` rules (or a `<link>` to a font provider) for
   Poppins, Inter, and Space Mono — the CSS variables `--font-heading`,
   `--font-body`, and `--font-mono` already reference them.
2. **Logo.** No official Propelr logo artwork was supplied, so the wordmark renders
   as styled text. Drop in `propelr-logo-black.svg` / `propelr-logo-white.svg` and
   swap the `.brand__mark` / `.brand__word` markup in `index.html` to use it.

## Editing the course

All content lives in the `COURSE` object near the top of the `<script>` in
`index.html` — modules, outcomes, video links, vocabulary, quizzes, and projects
are data. Add or edit a module by editing that object; the map, tracker, and
routing update automatically.

## Accessibility

Semantic HTML, visible focus states, keyboard-navigable map nodes and quizzes,
44px minimum touch targets, status conveyed by icon and text (not colour alone),
and `prefers-reduced-motion` respected (the traveller snaps instead of animating).
