create or replace function public.check_task_limit()
returns trigger
security definer -- Vital: Allows checking records even if RLS is highly restrictive on the client
set search_path = public
as $$
declare
  current_plan text;
  allowed_limit integer;
  current_month_start date;
  monthly_count integer;
begin
  -- 1. Grab the user's active billing plan
  select plan into current_plan 
  from public.account_subscriptions 
  where user_id = new.user_id 
    and status = 'active'
  limit 1;

  -- Fallback: If no subscription record exists yet for some reason, default them to free
  if current_plan is null then
    current_plan := 'free';
  end if;

  -- 2. Dynamically assign the quota boundary based on their plan
  if current_plan = 'premium' then
    allowed_limit := 1000;
  else
    allowed_limit := 100; -- Free tier default limit
  end if;

  -- 3. Get the first day of the current month to match your tasks_record schema
  current_month_start := date_trunc('month', now())::date;
  
  -- 4. Get the current month's total created tasks count
  select created_tasks into monthly_count
  from public.tasks_record
  where user_id = new.user_id 
    and month = current_month_start;

  -- If no tasks have been created this month yet, the count is effectively 0
  if monthly_count is null then
    monthly_count := 0;
  end if;

  -- 5. Hard enforcement: Raise an error if they try to exceed their limit
  if monthly_count >= allowed_limit then
    raise exception 'Monthly task creation limit reached. Your current plan (%) allows up to % tasks per month, and you have already created % tasks.', 
      initcap(current_plan), allowed_limit, monthly_count
      using errcode = 'EXC01'; -- Custom error code you can intercept in your frontend
  end if;
  
  return new;
end;
$$ language plpgsql;

-- Bind the execution hook right BEFORE an insert happens on your tasks table
create or replace trigger enforce_task_limit_before_insert
  before insert on public.tasks
  for each row
  execute function public.check_task_limit();