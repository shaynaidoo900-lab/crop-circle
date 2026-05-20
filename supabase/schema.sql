-- ================================================
-- Crop Circle — Supabase Schema
-- Run this in Supabase SQL Editor
-- ================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ================================================
-- PROFILES
-- ================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key default uuid_generate_v4(),
  email text unique not null,
  name text,
  subscription_tier text not null default 'free' check (subscription_tier in ('free', 'pro', 'enterprise')),
  created_at timestamptz not null default now()
);

-- RLS
alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ================================================
-- FIELDS
-- ================================================
create table public.fields (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  name text not null,
  boundary jsonb not null, -- GeoJSON Polygon
  area_hectares numeric not null default 0,
  created_at timestamptz not null default now()
);

alter table public.fields enable row level security;
create policy "Users can view own fields" on public.fields for select using (auth.uid() = user_id);
create policy "Users can insert own fields" on public.fields for insert with check (auth.uid() = user_id);
create policy "Users can update own fields" on public.fields for update using (auth.uid() = user_id);
create policy "Users can delete own fields" on public.fields for delete using (auth.uid() = user_id);

-- ================================================
-- FIELD SCANS
-- ================================================
create table public.field_scans (
  id uuid default uuid_generate_v4() primary key,
  field_id uuid references public.fields on delete cascade not null,
  scan_date timestamptz not null default now(),
  satellite_source text,
  ndvi_avg numeric,
  health_score numeric,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

alter table public.field_scans enable row level security;
create policy "Users can view own field scans" on public.field_scans
  for select using (
    exists (select 1 from public.fields where id = field_id and user_id = auth.uid())
  );
create policy "Users can insert own field scans" on public.field_scans
  for insert with check (
    exists (select 1 from public.fields where id = field_id and user_id = auth.uid())
  );

-- ================================================
-- AI INSIGHTS
-- ================================================
create table public.ai_insights (
  id uuid default uuid_generate_v4() primary key,
  field_id uuid references public.fields on delete cascade not null,
  generated_at timestamptz not null default now(),
  insight_text text not null,
  category text not null check (category in ('nutrition', 'water', 'pest', 'disease', 'general'))
);

alter table public.ai_insights enable row level security;
create policy "Users can view own insights" on public.ai_insights
  for select using (
    exists (select 1 from public.fields where id = field_id and user_id = auth.uid())
  );
create policy "Users can insert own insights" on public.ai_insights
  for insert with check (
    exists (select 1 from public.fields where id = field_id and user_id = auth.uid())
  );

-- ================================================
-- INDEXES
-- ================================================
create index idx_fields_user_id on public.fields(user_id);
create index idx_field_scans_field_id on public.field_scans(field_id);
create index idx_field_scans_scan_date on public.field_scans(scan_date desc);
create index idx_ai_insights_field_id on public.ai_insights(field_id);
create index idx_ai_insights_generated_at on public.ai_insights(generated_at desc);