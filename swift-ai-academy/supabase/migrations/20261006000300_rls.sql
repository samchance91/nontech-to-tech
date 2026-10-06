-- Swift AI Academy · row level security
-- Default deny: RLS on every public table. Learners may only SELECT their own rows plus the published catalogue.
-- All writes run in server code with the service role (bypasses RLS) and write audit_log.

create or replace function public.current_learner_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from public.learners where auth_user_id = auth.uid() and archived_at is null
$$;

create or replace function public.is_back_office() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.back_office_users
                 where auth_user_id = auth.uid() and disabled_at is null)
$$;

do $$
declare t record;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t.tablename);
    execute format('alter table public.%I force row level security', t.tablename);
    execute format('revoke all on public.%I from anon', t.tablename);
    execute format('revoke insert, update, delete, truncate on public.%I from authenticated', t.tablename);
  end loop;
end $$;

-- own rows
create policy own_select on public.learners            for select to authenticated using (id = public.current_learner_id());
create policy own_select on public.pathway_assignments for select to authenticated using (learner_id = public.current_learner_id());
create policy own_select on public.item_progress       for select to authenticated using (learner_id = public.current_learner_id());
create policy own_select on public.quiz_attempts       for select to authenticated using (learner_id = public.current_learner_id());
create policy own_select on public.course_completions  for select to authenticated using (learner_id = public.current_learner_id());
create policy own_select on public.pathway_completions for select to authenticated using (learner_id = public.current_learner_id());
create policy own_select on public.certificates        for select to authenticated using (learner_id = public.current_learner_id());
create policy own_select on public.test_attempt        for select to authenticated using (learner_id = public.current_learner_id());
create policy own_select on public.learner_profile     for select to authenticated using (learner_id = public.current_learner_id());
create policy own_select on public.recommendation      for select to authenticated using (learner_id = public.current_learner_id());
create policy own_select on public.recommendation_action for select to authenticated using (learner_id = public.current_learner_id());

-- published catalogue (no answer keys: quiz_questions has no policy)
create policy published_select on public.courses   for select to authenticated using (archived_at is null and not internal_only);
create policy published_select on public.modules   for select to authenticated using (status = 'published');
create policy published_select on public.items     for select to authenticated
  using (exists (select 1 from public.modules m where m.id = module_id and m.status = 'published'));
create policy published_select on public.pathways  for select to authenticated using (status = 'published');
create policy published_select on public.pathway_courses for select to authenticated
  using (exists (select 1 from public.pathways p where p.pathway_id = pathway_courses.pathway_id and p.status = 'published'));

-- No hard deletes on learner, attempt or certificate rows (even for the service role).
create or replace function public.forbid_delete() returns trigger language plpgsql as $$
begin
  raise exception 'hard delete is not allowed on %; archive instead', tg_table_name using errcode = '42501';
end $$;

create trigger no_delete before delete on public.learners       for each row execute function public.forbid_delete();
create trigger no_delete before delete on public.test_attempt   for each row execute function public.forbid_delete();
create trigger no_delete before delete on public.quiz_attempts  for each row execute function public.forbid_delete();
create trigger no_delete before delete on public.certificates   for each row execute function public.forbid_delete();
create trigger no_delete before delete on public.learner_profile for each row execute function public.forbid_delete();
create trigger no_truncate before truncate on public.learners      for each statement execute function public.forbid_delete();
create trigger no_truncate before truncate on public.test_attempt  for each statement execute function public.forbid_delete();
create trigger no_truncate before truncate on public.quiz_attempts for each statement execute function public.forbid_delete();
create trigger no_truncate before truncate on public.certificates  for each statement execute function public.forbid_delete();
