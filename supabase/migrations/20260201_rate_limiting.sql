-- Create user_usage table
create table if not exists public.user_usage (
    user_id uuid references public.users(user_id) not null primary key,
    usage_count integer default 0 not null,
    last_used_at timestamp with time zone default now() not null
);

-- RLS for user_usage
alter table public.user_usage enable row level security;

create policy "Users can view own usage" on public.user_usage
  for select using (auth.uid() = user_id);

-- Function to check and increment usage
create or replace function public.check_and_increment_usage(
    limit_count int
)
returns boolean
language plpgsql
security definer
as $$
declare
    current_usage int;
    user_record record;
begin
    -- Ensure usage record exists
    insert into public.user_usage (user_id)
    values (auth.uid())
    on conflict (user_id) do nothing;
    
    select usage_count into current_usage 
    from public.user_usage 
    where user_id = auth.uid();

    if current_usage >= limit_count then
        return false;
    end if;

    update public.user_usage
    set usage_count = usage_count + 1,
        last_used_at = now()
    where user_id = auth.uid();
    
    return true;
end;
$$;
