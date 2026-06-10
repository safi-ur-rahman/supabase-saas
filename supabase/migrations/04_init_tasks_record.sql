-- Tasks record table monthly for account analytics
create table public.tasks_record (
  record_id uuid default extensions.uuid_generate_v4() primary key,
  user_id uuid references public.accounts on delete cascade,
  month date not null,
  created_tasks integer default 0,
  total_tasks integer default 0,
  completed_tasks integer default 0,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  unique (user_id, month)
);