create or replace function public.handle_subscription_lifecycle_mutation()
returns trigger 
security definer
set search_path = public
as $$
begin
  -- 1. If their subscription transitions to an inactive state (e.g., canceled, past_due)
  if new.status in ('canceled', 'past_due') and old.status not in ('canceled', 'past_due') then
    -- Downgrade their plan status to free automatically if payment drops
    new.plan := 'free';
  end if;

  -- 2. Log changes or handle data syncing if needed
  -- (e.g., if they upgrade back to premium from a canceled state)
  if new.status = 'active' and old.status != 'active' then
    -- Any additional custom upgrade events can be fired here natively
  end if;

  return new;
end;
$$ language plpgsql;

-- Bind the execution hook right BEFORE an update hits your subscription ledger
create or replace trigger on_subscription_tier_changed
  before update on public.account_subscriptions
  for each row
  execute function public.handle_subscription_lifecycle_mutation();