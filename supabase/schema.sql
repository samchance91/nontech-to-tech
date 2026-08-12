-- ============================================================
-- Tech for Non-Tech People — Supabase schema
-- Run this once in your Supabase project:
--   Dashboard → SQL Editor → New query → paste all of this → Run.
--
-- It creates three tables (profiles, progress, posts), turns on
-- Row Level Security, and adds policies so that:
--   • each learner can read/write only their own profile & progress
--   • everyone signed in can read the shared Showcase; you can only
--     edit/delete your own posts
--   • an admin (an email listed in the `admins` table) can read every
--     profile, every learner's progress, and delete any post
-- Security is enforced here in the database, not in the page — so the
-- admin code in the site only reveals the dashboard; the data it can
-- actually load is governed by these policies.
-- ============================================================

-- Who is an admin. Add your email after running this (see bottom).
create table if not exists public.admins (
  email text primary key
);

-- One row per learner, linked to their Supabase Auth account.
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  name       text not null default '',
  created_at timestamptz not null default now()
);

-- The learner's course progress, stored as one JSON blob (same shape
-- the app already uses on-device).
create table if not exists public.progress (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- The shared Showcase wall.
create table if not exists public.posts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null,
  kind       text not null default 'project',
  title      text not null,
  body       text not null,
  link       text,
  created_at timestamptz not null default now()
);

-- Helper: is the current signed-in user an admin?
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admins a
    where lower(a.email) = lower(auth.jwt() ->> 'email')
  );
$$;

-- Turn on Row Level Security.
alter table public.profiles enable row level security;
alter table public.progress enable row level security;
alter table public.posts    enable row level security;
alter table public.admins   enable row level security;

-- ---- profiles ----
drop policy if exists "own profile read"  on public.profiles;
drop policy if exists "own profile write" on public.profiles;
drop policy if exists "own profile edit"  on public.profiles;
drop policy if exists "admin reads profiles" on public.profiles;
create policy "own profile read"  on public.profiles for select using (auth.uid() = id);
create policy "own profile write" on public.profiles for insert with check (auth.uid() = id);
create policy "own profile edit"  on public.profiles for update using (auth.uid() = id);
create policy "admin reads profiles" on public.profiles for select using (public.is_admin());

-- ---- progress ----
drop policy if exists "own progress read"  on public.progress;
drop policy if exists "own progress write" on public.progress;
drop policy if exists "own progress edit"  on public.progress;
drop policy if exists "admin reads progress" on public.progress;
create policy "own progress read"  on public.progress for select using (auth.uid() = user_id);
create policy "own progress write" on public.progress for insert with check (auth.uid() = user_id);
create policy "own progress edit"  on public.progress for update using (auth.uid() = user_id);
create policy "admin reads progress" on public.progress for select using (public.is_admin());

-- ---- posts (shared wall) ----
drop policy if exists "read all posts"   on public.posts;
drop policy if exists "insert own post"  on public.posts;
drop policy if exists "delete own or admin" on public.posts;
create policy "read all posts"   on public.posts for select using (auth.role() = 'authenticated');
create policy "insert own post"  on public.posts for insert with check (auth.uid() = user_id);
create policy "delete own or admin" on public.posts for delete using (auth.uid() = user_id or public.is_admin());

-- ---- admins table (only admins can read it) ----
drop policy if exists "admins read" on public.admins;
create policy "admins read" on public.admins for select using (public.is_admin());

-- ---- invite requests (the login screen's "request access" box) ----
-- Propelr is invite-only. Logged-out visitors can submit their email here;
-- only an admin can read the list. No admin address is ever shown on the page.
create table if not exists public.invite_requests (
  id           uuid primary key default gen_random_uuid(),
  email        text not null,
  requested_at timestamptz not null default now()
);
alter table public.invite_requests enable row level security;
drop policy if exists "anyone can request an invite" on public.invite_requests;
drop policy if exists "admin reads invite requests"  on public.invite_requests;
create policy "anyone can request an invite" on public.invite_requests for insert with check (true);
create policy "admin reads invite requests"  on public.invite_requests for select using (public.is_admin());

-- ============================================================
-- FINALLY: make yourself an admin. Replace the email, then run:
--   insert into public.admins (email) values ('you@example.com');
-- ============================================================
