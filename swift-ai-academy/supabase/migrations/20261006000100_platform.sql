-- Swift AI Academy · platform schema (PRD-platform + CLAUDE.md decisions)
-- Writes go through server code (service role). Clients only ever read, under RLS (see _rls.sql).

create extension if not exists pgcrypto;

-- ---------- organisations ----------
create table public.institutions (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique check (code ~ '^[a-z0-9-]{2,40}$'),  -- used in /login/[institution_code]
  name        text not null,
  created_at  timestamptz not null default now(),
  archived_at timestamptz
);

create table public.cohorts (
  id             uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id),
  name           text not null,
  starts_on      date,
  ends_on        date,
  created_at     timestamptz not null default now(),
  archived_at    timestamptz,
  unique (institution_id, name)
);

-- ---------- people ----------
create table public.back_office_users (
  id           uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id),
  email        text not null unique check (email = lower(email)),
  full_name    text,
  role         text not null default 'back_office' check (role in ('back_office')),
  created_at   timestamptz not null default now(),
  disabled_at  timestamptz
);

create table public.learners (
  id                  uuid primary key default gen_random_uuid(),   -- learner_id everywhere
  institution_id      uuid not null references public.institutions(id),
  cohort_id           uuid references public.cohorts(id),
  ext_id              text,                                         -- student / employee id, unique inside institution
  email               text not null unique check (email = lower(email)),
  full_name           text not null,
  learner_type        text not null default 'college' check (learner_type in ('college', 'on_the_job')),
  qualification_level text,                                         -- roster prefill for Part 1 block A
  discipline          text,
  year_or_stage       text,
  auth_user_id        uuid unique references auth.users(id),        -- created at activation (decision 4)
  status              text not null default 'invited' check (status in ('invited', 'active', 'suspended')),
  consent_at          timestamptz,                                  -- required to finish activation
  consent_version     text,
  activated_at        timestamptz,
  last_seen_at        timestamptz,                                  -- 30-minute idle rule (decision 5)
  failed_logins       int not null default 0,
  locked_until        timestamptz,                                  -- 5 wrong tries -> 15 minutes (decision 3)
  created_at          timestamptz not null default now(),
  archived_at         timestamptz,                                  -- no hard deletes
  unique (institution_id, ext_id),
  check (status <> 'active' or (consent_at is not null and auth_user_id is not null))
);
create index on public.learners (institution_id, cohort_id);

create table public.roster_uploads (
  id             uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id),
  cohort_id      uuid references public.cohorts(id),
  file_name      text not null,
  file_sha256    text not null,
  rows_total     int not null default 0,
  rows_created   int not null default 0,
  rows_existing  int not null default 0,
  rows_error     int not null default 0,
  error_file     text,                    -- storage path of the error CSV
  uploaded_by    uuid references public.back_office_users(id),
  created_at     timestamptz not null default now()
);

create table public.invites (
  id          uuid primary key default gen_random_uuid(),
  learner_id  uuid not null references public.learners(id),
  token_hash  text not null unique,       -- sha256 of 32 random bytes; raw token only in the email
  expires_at  timestamptz not null,       -- 14 days
  used_at     timestamptz,
  revoked_at  timestamptz,                -- resend revokes the old token
  created_at  timestamptz not null default now()
);
create unique index invites_one_live on public.invites (learner_id) where used_at is null and revoked_at is null;

create table public.password_resets (
  id          uuid primary key default gen_random_uuid(),
  learner_id  uuid not null references public.learners(id),
  token_hash  text not null unique,
  expires_at  timestamptz not null,
  used_at     timestamptz,
  revoked_at  timestamptz,
  created_at  timestamptz not null default now()
);

create table public.email_outbox (
  id          uuid primary key default gen_random_uuid(),
  to_email    text not null,
  template    text not null,
  subject     text not null,
  body_text   text not null,
  body_html   text,
  provider_id text,                       -- Resend id when actually sent
  sent_at     timestamptz,
  error       text,
  created_at  timestamptz not null default now()
);

-- ---------- catalogue ----------
create table public.courses (
  course_id      text primary key check (course_id ~ '^[A-Z0-9-]{2,32}$'),  -- = course_code
  title          text not null,
  level          int not null default 1 check (level between 0 and 9),
  release_status text not null default 'draft' check (release_status in ('draft', 'partial', 'complete')),
  internal_only  boolean not null default false,   -- never an engine candidate (engine rule 11)
  created_at     timestamptz not null default now(),
  archived_at    timestamptz
);

create table public.modules (
  id           uuid primary key default gen_random_uuid(),
  course_id    text not null references public.courses(course_id),
  position     int not null,
  title        text not null,
  status       text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  unique (course_id, position)
);

create table public.items (
  id           uuid primary key default gen_random_uuid(),
  module_id    uuid not null references public.modules(id),
  position     int not null,
  title        text not null,
  kind         text not null check (kind in ('lesson', 'quiz')),
  asset_type   text check (asset_type in ('video', 'pdf', 'slides', 'html_sim', 'text')),
  storage_path text,                     -- private bucket; served by 10-minute signed URL
  body_text    text,
  required     boolean not null default true,
  graded       boolean not null default false,
  pass_pct     int not null default 80 check (pass_pct between 1 and 100),
  est_minutes  int,
  created_at   timestamptz not null default now(),
  unique (module_id, position),
  check (kind = 'quiz' or not graded)
);

create table public.quiz_questions (
  id         uuid primary key default gen_random_uuid(),
  item_id    uuid not null references public.items(id),
  position   int not null,
  prompt     text not null,
  options    jsonb not null,             -- [{id, text}]
  answer_key jsonb not null,             -- never readable by learners (no policy)
  unique (item_id, position)
);

create table public.pathways (
  pathway_id  text primary key check (pathway_id ~ '^pw_[a-z0-9_]{2,40}$'),
  name        text not null,
  status      text not null default 'draft' check (status in ('draft', 'published')),
  created_at  timestamptz not null default now(),
  archived_at timestamptz
);

create table public.pathway_courses (
  pathway_id text not null references public.pathways(pathway_id),
  course_id  text not null references public.courses(course_id),
  position   int not null,
  required   boolean not null default true,
  primary key (pathway_id, course_id),
  unique (pathway_id, position)
);

-- ---------- learning progress ----------
create table public.pathway_assignments (
  id          uuid primary key default gen_random_uuid(),
  learner_id  uuid not null references public.learners(id),
  pathway_id  text not null references public.pathways(pathway_id),
  source      text not null check (source in ('recommendation', 'alternative', 'override')),
  rec_id      text,                       -- recommendation that produced it (null for override)
  active      boolean not null default true,
  assigned_at timestamptz not null default now(),
  ended_at    timestamptz
);
-- exactly one active assignment per learner
create unique index pathway_assignments_one_active on public.pathway_assignments (learner_id) where active;

create table public.item_progress (
  learner_id   uuid not null references public.learners(id),
  item_id      uuid not null references public.items(id),
  status       text not null default 'started' check (status in ('started', 'completed')),
  resume_state jsonb,                    -- e.g. {"seconds": 312} or {"page": 4}
  updated_at   timestamptz not null default now(),
  completed_at timestamptz,
  primary key (learner_id, item_id)
);

create table public.quiz_attempts (
  id           uuid primary key default gen_random_uuid(),
  learner_id   uuid not null references public.learners(id),
  item_id      uuid not null references public.items(id),
  answers      jsonb not null,
  score_pct    numeric(5,2) not null check (score_pct between 0 and 100),
  passed       boolean not null,
  started_at   timestamptz not null default now(),
  submitted_at timestamptz not null default now()
);
create index on public.quiz_attempts (learner_id, item_id, submitted_at);

create table public.course_completions (
  learner_id   uuid not null references public.learners(id),
  course_id    text not null references public.courses(course_id),
  completed_at timestamptz not null default now(),
  primary key (learner_id, course_id)
);

create table public.pathway_completions (
  id           uuid primary key default gen_random_uuid(),
  learner_id   uuid not null references public.learners(id),
  pathway_id   text not null references public.pathways(pathway_id),
  completed_at timestamptz not null default now(),
  unique (learner_id, pathway_id)        -- idempotent completion
);

create table public.certificates (
  id                    text primary key check (id ~ '^SAA-[0-9]{4}-[A-HJ-NP-Z2-9]{8}$'),
  learner_id            uuid not null references public.learners(id),
  pathway_completion_id uuid not null references public.pathway_completions(id),
  learner_name          text not null,
  pathway_name          text not null,
  issued_at             timestamptz not null default now(),
  pdf_path              text,             -- separate private bucket
  revoked_at            timestamptz,
  revoke_reason         text,
  reissued_from         text references public.certificates(id),
  check (revoked_at is null or revoke_reason is not null)
);
-- one live certificate per completion
create unique index certificates_one_live on public.certificates (pathway_completion_id) where revoked_at is null;

-- ---------- audit and analytics ----------
create table public.audit_log (
  id          bigserial primary key,
  actor_id    uuid,                       -- back_office_users.id (null = system)
  actor_email text,
  action      text not null,
  entity      text not null,
  entity_id   text,
  reason      text,
  before      jsonb,
  after       jsonb,
  created_at  timestamptz not null default now()
);

create table public.analytics_events (
  id         bigserial primary key,
  learner_id uuid references public.learners(id),
  event      text not null,
  props      jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index on public.analytics_events (event, created_at);
