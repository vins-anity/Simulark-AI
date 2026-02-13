-- Add onboarding tracking to users table
-- This migration adds fields to track onboarding state and store onboarding data

-- Add onboarding status fields to users table
alter table public.users 
  add column if not exists onboarding_completed boolean default false,
  add column if not exists onboarding_step integer default 0,
  add column if not exists onboarding_skipped boolean default false,
  add column if not exists onboarding_completed_at timestamp with time zone,
  add column if not exists onboarding_data jsonb default '{}'::jsonb;

-- Create index for efficient querying of users needing onboarding
create index if not exists idx_users_onboarding 
  on public.users(onboarding_completed, onboarding_skipped) 
  where onboarding_completed = false and onboarding_skipped = false;

-- Add comment explaining the fields
comment on column public.users.onboarding_completed is 'Whether user has completed the full onboarding flow';
comment on column public.users.onboarding_step is 'Last completed onboarding step (0-3)';
comment on column public.users.onboarding_skipped is 'Whether user explicitly skipped onboarding';
comment on column public.users.onboarding_data is 'Temporary storage for partial onboarding progress';
comment on column public.users.onboarding_completed_at is 'Timestamp when onboarding was completed';
