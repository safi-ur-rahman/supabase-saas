-- Tasks table
create table public.tasks (
  task_id uuid default extensions.uuid_generate_v4() primary key,
  user_id uuid references public.accounts on delete cascade,
  title text not null,
  description text,
  image_url text,
  label text check (label in ('Work', 'Personal', 'Health', 'Urgent', 'Other')),
  due_date timestamp with time zone,
  completed boolean default false,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);