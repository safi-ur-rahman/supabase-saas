-- 1. Explicitly enable the wrappers extension inside the extensions schema namespace
create extension if not exists wrappers with schema extensions;

-- 2. Safely create the Stripe foreign data wrapper link using the explicit handler paths
do $$
begin
  if not exists (select 1 from pg_foreign_data_wrapper where fdwname = 'stripe_wrapper') then
    create foreign data wrapper stripe_wrapper
      handler extensions.stripe_fdw_handler
      validator extensions.stripe_fdw_validator;
  end if;
end $$;

-- 3. Provision the Stripe engine server instance linked to your Vault key
do $$
begin
  if not exists (select 1 from pg_foreign_server where srvname = 'stripe_server') then
    create server stripe_server
      foreign data wrapper stripe_wrapper
      options (
        api_key_name 'stripe' -- Points to your Stripe Secret Key stored securely in Vault
      );
  end if;
end $$;

-- 4. Isolate the Stripe virtual tables into their own schema
create schema if not exists stripe;

-- 5. Map Stripe's API attributes to a virtual SQL table
create foreign table if not exists stripe.customers (
  id text,
  email text,
  name text,
  description text,
  created timestamp,
  attrs jsonb
)
server stripe_server
options (
  object 'customers',
  rowid_column 'id'
);

-- 6. Function to handle Stripe customer creation asynchronously after signup
create or replace function public.handle_stripe_customer_creation()
returns trigger
security definer
set search_path = public
as $$
declare
  customer_email text;
  new_stripe_id text;
begin
  -- Extract the authentic user email from the core auth metadata ledger
  select email into customer_email
  from auth.users
  where id = new.user_id;

  -- Issue a dynamic SQL Insert statement that the FDW converts into a Stripe API Call
  insert into stripe.customers (email, name)
  values (customer_email, coalesce(new.name, 'New User'))
  returning id into new_stripe_id;
  
  -- Write the returned ID back to your public.accounts row
  update public.accounts
  set stripe_customer_id = new_stripe_id
  where user_id = new.user_id;
  
  return new;
end;
$$ language plpgsql;

-- Bind as an AFTER trigger to separate core auth registration from Stripe network health
create or replace trigger create_stripe_customer_on_account_creation
  after insert on public.accounts
  for each row
  execute function public.handle_stripe_customer_creation();

-- 7. Function to handle Stripe customer deletion on profile cleanup
create or replace function public.handle_stripe_customer_deletion()
returns trigger
security definer
set search_path = public
as $$
begin
  if old.stripe_customer_id is not null then
    begin -- Opens exception handling block
      -- This SQL statement instructs the FDW engine to send a DELETE HTTP request to Stripe
      delete from stripe.customers where id = old.stripe_customer_id;
    exception when others then
      -- Graceful catching: Ensures your local row deletion doesn't fail if Stripe's API is down
      raise notice 'Failed to delete Stripe customer record natively: %', SQLERRM;
    end; -- ✨ Fixed: Properly closes the exception block here
  end if; -- Properly closes the structural IF statement
  return old;
end;
$$ language plpgsql;

-- Bind the cleanup hook to your exact public.accounts table
create or replace trigger delete_stripe_customer_on_account_deletion
  before delete on public.accounts
  for each row
  execute function public.handle_stripe_customer_deletion();