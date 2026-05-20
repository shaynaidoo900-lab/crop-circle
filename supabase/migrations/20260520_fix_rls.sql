-- ================================================
-- Fix RLS for service_role (bypasses auth.uid() context)
-- ================================================

-- Drop and recreate profiles policies to allow service_role insert
drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

create policy "Users can view own profile" on public.profiles
  for select using (
    auth.uid() = id
    or auth.jwt('role') = 'service_role'
  );

create policy "Users can update own profile" on public.profiles
  for update using (
    auth.uid() = id
    or auth.jwt('role') = 'service_role'
  );

-- Fields: allow service_role for seeding
drop policy if exists "Users can insert own fields" on public.fields;
drop policy if exists "Users can view own fields" on public.fields;

create policy "Users can view own fields" on public.fields
  for select using (
    auth.uid() = user_id
    or auth.jwt('role') = 'service_role'
  );

create policy "Users can insert own fields" on public.fields
  for insert with check (
    auth.uid() = user_id
    or auth.jwt('role') = 'service_role'
  );

create policy "Users can update own fields" on public.fields
  for update using (
    auth.uid() = user_id
    or auth.jwt('role') = 'service_role'
  );

create policy "Users can delete own fields" on public.fields
  for delete using (
    auth.uid() = user_id
    or auth.jwt('role') = 'service_role'
  );

-- Field scans: allow service_role for seeding
drop policy if exists "Users can view own field scans" on public.field_scans;
drop policy if exists "Users can insert own field scans" on public.field_scans;

create policy "Users can view own field scans" on public.field_scans
  for select using (
    exists (select 1 from public.fields where id = field_id and (user_id = auth.uid() or auth.jwt('role') = 'service_role'))
    or auth.jwt('role') = 'service_role'
  );

create policy "Users can insert own field scans" on public.field_scans
  for insert with check (
    exists (select 1 from public.fields where id = field_id and (user_id = auth.uid() or auth.jwt('role') = 'service_role'))
    or auth.jwt('role') = 'service_role'
  );

-- AI insights: allow service_role for seeding
drop policy if exists "Users can view own insights" on public.ai_insights;
drop policy if exists "Users can insert own insights" on public.ai_insights;

create policy "Users can view own insights" on public.ai_insights
  for select using (
    exists (select 1 from public.fields where id = field_id and (user_id = auth.uid() or auth.jwt('role') = 'service_role'))
    or auth.jwt('role') = 'service_role'
  );

create policy "Users can insert own insights" on public.ai_insights
  for insert with check (
    exists (select 1 from public.fields where id = field_id and (user_id = auth.uid() or auth.jwt('role') = 'service_role'))
    or auth.jwt('role') = 'service_role'
  );