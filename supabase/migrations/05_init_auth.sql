-- Function to initialize account and default subscription for new auth users
create or replace function public.handle_new_user() 
returns trigger
security definer -- Runs as superuser to bypass table-level RLS restrictions during signup
set search_path = public
as $$
begin
  -- 1. Insert into your public.accounts table
  insert into public.accounts (user_id, name)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'name', 'New User') -- Fallback string if metadata name is missing
  );

  -- 2. Automatically grant them an active 'free' plan row right away
  insert into public.account_subscriptions (user_id, plan, status)
  values (new.id, 'free', 'active');

  return new;
end;
$$ language plpgsql;

-- Trigger to execute the initialization script on auth events
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Enable RLS across your tables
alter table public.accounts enable row level security;
alter table public.tasks enable row level security;
alter table public.account_subscriptions enable row level security;
alter table public.tasks_record enable row level security;

-- Accounts Policies
create policy "Users can read own account profile"
on public.accounts for select
using (auth.uid() = user_id);

create policy "Users can update own account profile"
on public.accounts for update
using (auth.uid() = user_id);

-- Tasks Policies (Using the short form 'for all' to handle CRUD out of the box)
create policy "Users can CRUD own tasks"
on public.tasks for all
using (auth.uid() = user_id);

-- Subscriptions Policies (Users should read this, but only Stripe webhooks/backend should edit it)
create policy "Users can view their own subscription status"
on public.account_subscriptions for select
using (auth.uid() = user_id);

-- Analytics Ledger Policies
create policy "Users can view their own monthly task records"
on public.tasks_record for select
using (auth.uid() = user_id);

-- Optimization: Drastically accelerates paginated dashboard task sorting queries
create index if not exists idx_tasks_user_created 
on public.tasks(user_id, created_at desc);

-- Bonus Optimization: Speeds up RLS verification queries on the lookup tables
create index if not exists idx_subscriptions_user on public.account_subscriptions(user_id);
create index if not exists idx_records_user_month on public.tasks_record(user_id, month);