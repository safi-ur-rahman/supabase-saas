-- Enable required extensions
create extension if not exists "uuid-ossp";

-- User Accounts table (extends Supabase auth.users)
create table public.accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text,
  stripe_customer_id text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);