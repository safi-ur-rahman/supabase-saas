create or replace function public.handle_task_metrics_sync() 
returns trigger
security definer -- Vital: Allows tracking updates to complete even if user RLS is strict
set search_path = public
as $$
declare
  current_month_start date;
  target_user_id uuid;
begin
  -- 1. Determine who owns the row and set the date block to the 1st of the current month
  current_month_start := date_trunc('month', now())::date;
  
  if TG_OP = 'DELETE' then
    target_user_id := old.user_id;
  else
    target_user_id := new.user_id;
  end if;

  -- 2. Ensure an analytics row exists for this user for the current month
  insert into public.tasks_record (user_id, month, created_tasks, total_tasks, completed_tasks)
  values (target_user_id, current_month_start, 0, 0, 0)
  on conflict (user_id, month) do nothing;

  -- 3. Calculate metrics based on the database event type
  if (TG_OP = 'INSERT') then
    update public.tasks_record
    set 
      created_tasks = created_tasks + 1, -- Total historically spawned this month
      total_tasks = total_tasks + 1       -- Total currently sitting in their account
    where user_id = target_user_id and month = current_month_start;

  elsif (TG_OP = 'DELETE') then
    update public.tasks_record
    set 
      total_tasks = greatest(0, total_tasks - 1),
      completed_tasks = case 
        when old.completed = true then greatest(0, completed_tasks - 1) 
        else completed_tasks 
      end
    where user_id = target_user_id and month = current_month_start;

  elsif (TG_OP = 'UPDATE') then
    -- Watch specifically to see if the "completed" boolean shifted states
    if old.completed = false and new.completed = true then
      update public.tasks_record
      set completed_tasks = completed_tasks + 1
      where user_id = target_user_id and month = current_month_start;
    elsif old.completed = true and new.completed = false then
      update public.tasks_record
      set completed_tasks = greatest(0, completed_tasks - 1)
      where user_id = target_user_id and month = current_month_start;
    end if;
  end if;

  return null; -- Result is ignored since this runs AFTER the changes are committed
end;
$$ language plpgsql;

-- Bind the automation triggers to your public.tasks table
create or replace trigger sync_task_metrics_on_change
  after insert or update or delete on public.tasks
  for each row execute function public.handle_task_metrics_sync();

alter table public.tasks_record enable row level security;

create policy "Users can read own usage tracking"
on public.tasks_record for select
using (auth.uid() = user_id);