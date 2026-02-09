-- Add metadata column to projects table
alter table public.projects
add column if not exists metadata jsonb default '{}'::jsonb;

-- Comment on column
comment on column public.projects.metadata is 'Stores project-specific UI settings, layout preferences, and model configurations.';
