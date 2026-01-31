-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- --- Users Table (Extends auth.users) ---
create table if not exists public.users (
  user_id uuid references auth.users not null primary key,
  email text,
  full_name text,
  avatar_url text,
  subscription_tier text default 'free', -- free, pro, enterprise
  preferences jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trigger to sync auth.users to public.users
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (user_id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Drop trigger if exists to avoid duplication errors on re-run
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- --- Projects Table ---
create table if not exists public.projects (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(user_id) not null,
  name text not null,
  description text,
  provider text default 'Generic', -- AWS, GCP, Azure, Generic
  nodes jsonb default '[]'::jsonb,
  edges jsonb default '[]'::jsonb,
  is_public boolean default false,
  version integer default 1,
  share_token text unique,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- --- Project Versions Table ---
create table if not exists public.project_versions (
  id uuid default uuid_generate_v4() primary key,
  project_id uuid references public.projects(id) not null,
  version integer not null,
  nodes jsonb,
  edges jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (project_id, version)
);

-- --- AI Generations Table ---
create table if not exists public.ai_generations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(user_id) not null,
  project_id uuid references public.projects(id),
  prompt text not null,
  model_aggregator text,
  model_generator text,
  success boolean not null,
  tokens_used integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- --- Functions & Triggers ---

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists handle_projects_updated_at on public.projects;
create trigger handle_projects_updated_at
  before update on public.projects
  for each row execute procedure public.handle_updated_at();

-- --- RLS Policies ---

alter table public.users enable row level security;
alter table public.projects enable row level security;
alter table public.project_versions enable row level security;
alter table public.ai_generations enable row level security;

-- Users
create policy "Users can view their own profile" on public.users
  for select using (auth.uid() = user_id);

create policy "Users can update their own profile" on public.users
  for update using (auth.uid() = user_id);

-- Projects
create policy "Users can view own projects" on public.projects
  for select using (auth.uid() = user_id);

create policy "Users can insert own projects" on public.projects
  for insert with check (auth.uid() = user_id);

create policy "Users can update own projects" on public.projects
  for update using (auth.uid() = user_id);

create policy "Users can delete own projects" on public.projects
  for delete using (auth.uid() = user_id);

-- Project Versions
create policy "Users can view their project versions" on public.project_versions
  for select using (
    exists (select 1 from public.projects where id = project_versions.project_id and user_id = auth.uid())
  );

create policy "Users can insert their project versions" on public.project_versions
  for insert with check (
    exists (select 1 from public.projects where id = project_versions.project_id and user_id = auth.uid())
  );

-- AI Generations
create policy "Users can view own generations" on public.ai_generations
  for select using (auth.uid() = user_id);

create policy "Users can insert own generations" on public.ai_generations
  for insert with check (auth.uid() = user_id);
