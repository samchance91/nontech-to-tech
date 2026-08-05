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
- **Profiles** — each learner creates a profile with a name and email; progress is
  saved per profile, and several profiles can coexist on one device.
- **A community Showcase** — post your projects, findings, and experiments (with an
  optional link); everyone's posts appear in one feed.
- **Admin mode** — an admin button in the top bar, unlocked with a code, that opens
  every module and a dashboard of every profile's progress and every post.
- **Light and dark themes**, full mobile support (works down to 320px wide), keyboard
  navigation, and reduced-motion support.

## Accounts, admin, and the Showcase

Two ways to run these features:

1. **On-device (default, no setup).** Profiles, progress, and posts live in the
   browser's `localStorage`. Great for a single person or a demo, but data does not
   sync between people or devices, and the admin only sees profiles created in that
   same browser.
2. **Cloud multi-user (Supabase).** Connect a free Supabase project and the same
   screens become truly shared: progress syncs across devices, the Showcase shows
   everyone's posts, and the admin sees every learner. See
   [`supabase/schema.sql`](./supabase/schema.sql) and the setup steps below.

The **admin code** (`ADMIN_CODE` near the top of the `<script>` in `index.html`)
only *reveals* the admin dashboard. In the cloud setup, what the dashboard can
actually load is enforced by database Row Level Security — an admin is an email
listed in the `admins` table, so guessing the code never exposes other people's
data.

### Connecting Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. In the dashboard, open **SQL Editor**, paste all of
   [`supabase/schema.sql`](./supabase/schema.sql), and **Run**.
3. Add yourself as admin: `insert into public.admins (email) values ('you@example.com');`
4. Under **Project Settings → API**, copy the **Project URL** and the **anon public**
   key. Set them as `SUPABASE_URL` and `SUPABASE_KEY` near the top of the `<script>`
   in `index.html`. The anon key is safe to ship in a static site — RLS is what
   protects the data.
5. In **Authentication → Providers → Email**, turn **off "Confirm email"** so sign-up
   is instant (otherwise Supabase emails a confirmation link that points at the
   wrong URL by default).
6. Sign up on the site with the **same email** you added to the `admins` table in
   step 3 — that account is the admin.

When `SUPABASE_URL`/`SUPABASE_KEY` are set and the Supabase library loads, the app
runs in **cloud mode**: email + password sign-in, per-user progress synced across
devices, a shared Showcase, and the admin dashboard over everyone's real data. If
the library can't load (e.g. offline, or the CSP-sandboxed Artifact preview), it
falls back to **on-device mode** automatically — nothing breaks.

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
- On-device, each profile's progress is stored under its own key
  (`propelr_tnt_progress::<email>`), with profiles, posts, session, and theme in
  their own keys. All of it merges forward safely if the course content changes.
- Every read and write goes through one `DB` object near the top of the `<script>`.
  Swapping that object for a Supabase-backed one (same method names) is all it takes
  to move from on-device to cloud — nothing else in the app changes.

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
