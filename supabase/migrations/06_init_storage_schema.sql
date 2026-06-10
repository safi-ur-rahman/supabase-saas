-- Clean up existing bucket safely if resetting
do $$
begin
  if exists (
    select 1 from storage.buckets where id = 'task-attachments'
  ) then
    delete from storage.objects where bucket_id = 'task-attachments';
    delete from storage.buckets where id = 'task-attachments';
  end if;
end $$;

-- Create storage bucket for your task attachments
insert into storage.buckets (
  id, 
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'task-attachments',
  'task-attachments',
  true, -- Kept public so tasks can display images on the client easily
  1000000, -- 1MB restriction
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- Policy: Anyone can view task images
create policy "Public can view attachments"
on storage.objects for select
using (bucket_id = 'task-attachments');

-- Policy: Users can only upload to a folder that matches their User ID
create policy "Users can upload their own attachments"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'task-attachments'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Users can delete their own attachments manually via API if needed
create policy "Users can delete their own attachments"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'task-attachments'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create or replace function public.delete_task_storage_object()
returns trigger
security definer -- Vital: bypasses storage RLS to let the database handle internal cleanup
set search_path = public
as $$
declare
  file_path text;
begin
  if old.image_url is not null then
    -- Extract the relative path from the full public URL string
    -- This removes 'https://.../storage/v1/object/public/task-attachments/'
    file_path := substring(old.image_url from 'task-attachments/(.+)$');

    if file_path is not null then
      delete from storage.objects
      where bucket_id = 'task-attachments'
      and name = file_path;
    end if;
  end if;
  
  return old;
end;
$$ language plpgsql;

-- Bind the trigger to your exact public.tasks table
create or replace trigger cleanup_storage_on_task_delete
  before delete on public.tasks
  for each row
  execute function public.delete_task_storage_object();

grant delete on storage.objects to authenticated;