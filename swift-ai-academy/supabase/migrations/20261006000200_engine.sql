-- Swift AI Academy · baseline test + recommendation engine (PRD-recommendation section 8)

create table public.taxonomy (
  taxonomy_type text not null check (taxonomy_type in (
    'qualification_level', 'discipline', 'skill_tag', 'domain', 'orientation',
    'career_outcome', 'difficulty', 'learner_type', 'career_stage',
    'hours_band', 'device', 'language', 'learning_objective', 'riasec')),
  code          text not null check (code ~ '^[a-z0-9_]{1,60}$'),
  label         text not null,
  status        text not null default 'active' check (status in ('active', 'retired')),
  sort_order    int not null default 0,
  primary key (taxonomy_type, code)
);

create table public.skill_statement (
  skill_tag      text not null,
  level          int not null check (level between 0 and 3),
  statement_text text not null,
  primary key (skill_tag, level)
);

create table public.course_meta (
  course_id               text primary key references public.courses(course_id),
  prerequisites           jsonb,          -- {"skills":[{"skill_tag","min_level"}], "courses":["CODE"]}
  eligible_qualifications jsonb,          -- {"levels": "any" | [...], "disciplines": "any" | [...]}
  learning_outcomes       jsonb,          -- [{"skill_tag","level_after","statement"}]
  career_outcomes         text[],
  domain                  text,
  difficulty              text,
  orientation_tags        text[],
  related_courses         text[],
  est_hours               numeric(6,1),
  updated_at              timestamptz not null default now()
);

create table public.pathway_meta (
  pathway_id       text primary key references public.pathways(pathway_id),
  career_outcomes  text[] not null,
  target_learner   jsonb,                 -- {"learner_types":[], "levels": "any"|[], "disciplines": "any"|[]}
  foundation_route text[] not null default '{}',
  is_default       boolean not null default false,
  tagline          text,
  updated_at       timestamptz not null default now()
);
-- engine rule 8: exactly one default (at most one enforced here; "at least one" checked on load)
create unique index pathway_meta_one_default on public.pathway_meta (is_default) where is_default;

create table public.skill_edge (
  from_course_id text not null references public.courses(course_id),
  to_course_id   text not null references public.courses(course_id),
  skill_tag      text not null,
  primary key (from_course_id, to_course_id, skill_tag)
);

create table public.catalogue_versions (
  version    int primary key,
  snapshot   jsonb not null,             -- full engine catalogue input at this version (reproducibility)
  reason     text not null,
  created_at timestamptz not null default now()
);

create table public.test_item (
  item_id     text primary key,
  part        text not null check (part in ('learner_details', 'psychometric')),
  block       text not null,             -- A-E for Part 1, dimension for Part 2
  type        text not null check (type in ('select', 'multi_select', 'can_do', 'likert5', 'scenario')),
  prompt      text not null,
  options     jsonb,
  scoring_key jsonb,
  show_if     jsonb,                     -- branching, e.g. {"learner_type": ["on_the_job"]}
  position    int not null,
  status      text not null default 'active' check (status in ('active', 'retired'))
);

create table public.test_attempt (
  attempt_id   uuid primary key default gen_random_uuid(),
  learner_id   uuid not null references public.learners(id),
  part         text not null check (part in ('learner_details', 'psychometric')),
  responses    jsonb not null default '{}'::jsonb,
  position     int not null default 0,   -- resume at same item
  started_at   timestamptz not null default now(),
  submitted_at timestamptz,
  archived_at  timestamptz                -- retake / reset archives, never deletes
);
create unique index test_attempt_one_open on public.test_attempt (learner_id, part) where archived_at is null;

create table public.learner_profile (
  learner_id      uuid not null references public.learners(id),
  profile_version int not null,
  attributes      jsonb not null,        -- no gender, caste, religion, disability or location
  confidence      text not null check (confidence in ('high', 'low')),
  created_at      timestamptz not null default now(),
  primary key (learner_id, profile_version)
);

create table public.engine_config (
  version     int primary key,
  config      jsonb not null,            -- weights, threshold, route_penalty, riasec_map, ...
  active_from timestamptz not null default now(),
  created_by  uuid references public.back_office_users(id)
);

create table public.recommendation (
  rec_id            text primary key,
  learner_id        uuid not null references public.learners(id),
  profile_version   int,
  catalogue_version int,
  config_version    int,
  inputs            jsonb not null,      -- profile + config as used
  ranked_output     jsonb not null,      -- every candidate with components
  result            jsonb not null,      -- the section 11 JSON returned
  reason_codes      text[] not null default '{}',
  fallback          boolean not null default false,
  created_at        timestamptz not null default now()
);
create index on public.recommendation (learner_id, created_at desc);

create table public.recommendation_action (
  id         uuid primary key default gen_random_uuid(),
  rec_id     text references public.recommendation(rec_id),
  learner_id uuid not null references public.learners(id),
  action     text not null check (action in ('accepted', 'alternative', 'retake', 'override')),
  pathway_id text references public.pathways(pathway_id),
  actor      text not null,              -- 'learner' or back-office email
  reason     text,
  ts         timestamptz not null default now(),
  check (action <> 'override' or reason is not null)
);

alter table public.pathway_assignments
  add constraint pathway_assignments_rec_fk foreign key (rec_id) references public.recommendation(rec_id);
