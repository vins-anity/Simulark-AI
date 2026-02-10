-- Create a table to track user generation usage
create table if not exists public.user_usages (
  user_id uuid references auth.users not null primary key,
  date date not null default current_date,
  generation_count int not null default 0,
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.user_usages enable row level security;

-- Policies
create policy "Users can view their own usage"
  on public.user_usages for select
  using (auth.uid() = user_id);

-- Only service role can update/insert (managed by API)
create policy "Service role can manage usages"
  on public.user_usages
  using (true)
  with check (true);

-- Grant access
grant select on public.user_usages to authenticated;
grant all on public.user_usages to service_role;
