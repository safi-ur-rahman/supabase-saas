-- Account Subscriptions Table
create table public.account_subscriptions (
  subscription_id uuid default extensions.uuid_generate_v4() primary key,
  user_id uuid references public.accounts on delete cascade,
  plan text check (plan in ('free', 'premium')) not null,
  status text check (status in ('active', 'canceled', 'past_due', 'trialing')) not null,
  stripe_subscription_id text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);