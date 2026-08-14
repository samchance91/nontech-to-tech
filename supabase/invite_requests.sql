-- ============================================================
-- Fix for the login screen's "Send invite" box.
-- If requesting an invite shows "Couldn't send your request just now",
-- the invite_requests table or its anon-insert policy is missing in your
-- Supabase project. Run this once:
--   Supabase Dashboard → SQL Editor → New query → paste all → Run.
-- Safe to re-run (idempotent).
-- ============================================================

create table if not exists public.invite_requests (
  id           uuid primary key default gen_random_uuid(),
  email        text not null,
  requested_at timestamptz not null default now()
);

alter table public.invite_requests enable row level security;

drop policy if exists "anyone can request an invite" on public.invite_requests;
drop policy if exists "admin reads invite requests"  on public.invite_requests;

-- Logged-out visitors (the anon role) may add a request; nobody can read them
-- except an admin (an email listed in public.admins).
create policy "anyone can request an invite" on public.invite_requests
  for insert with check (true);
create policy "admin reads invite requests" on public.invite_requests
  for select using (public.is_admin());

-- Table-level privileges (RLS still gates which rows each role can touch).
grant insert on public.invite_requests to anon, authenticated;
grant select on public.invite_requests to authenticated;
