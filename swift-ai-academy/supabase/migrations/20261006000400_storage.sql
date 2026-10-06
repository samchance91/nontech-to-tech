-- Private storage buckets (decision 1). Skipped where the storage schema does not exist (plain Postgres in CI).
do $$
begin
  if exists (select 1 from information_schema.schemata where schema_name = 'storage') then
    insert into storage.buckets (id, name, public) values
      ('course-assets', 'course-assets', false),
      ('certificates',  'certificates',  false),
      ('roster-errors', 'roster-errors', false)
    on conflict (id) do nothing;
  end if;
end $$;
