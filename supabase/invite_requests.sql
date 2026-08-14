-- ============================================================
-- Makes the login screen's "Request an invite" box work.
--
-- Run once: Supabase Dashboard → SQL Editor → New query → paste ALL of
-- this → Run. It should say "Success. No rows returned."
--
-- This block is fully self-contained — it does NOT depend on anything
-- else in the schema, so it can't half-run and roll back. Safe to
-- re-run any number of times.
-- ============================================================

-- 1. The table.
create table if not exists public.invite_requests (
  id           uuid primary key default gen_random_uuid(),
  email        text not null,
  requested_at timestamptz not null default now()
);

-- 2. Row Level Security on, with a policy that lets logged-out visitors
--    (the "anon" role) submit a request. No dependency on any function.
alter table public.invite_requests enable row level security;

drop policy if exists "anyone can request an invite" on public.invite_requests;
create policy "anyone can request an invite"
  on public.invite_requests
  for insert
  to anon, authenticated
  with check (true);

-- 3. Table-level privilege to match the policy.
grant insert on public.invite_requests to anon, authenticated;

-- ============================================================
-- OPTIONAL — in-app admin reading of the request list.
-- Run this ONLY after you've run the full schema.sql (which defines
-- public.is_admin()). You can always read requests without it via the
-- Table Editor, which bypasses RLS. Skipping this does NOT affect the
-- invite box.
-- ============================================================
-- grant select on public.invite_requests to authenticated;
-- drop policy if exists "admin reads invite requests" on public.invite_requests;
-- create policy "admin reads invite requests"
--   on public.invite_requests for select
--   to authenticated using (public.is_admin());
