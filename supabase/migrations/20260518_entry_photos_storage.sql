-- Entry photos + private storage foundation
-- Run this migration in Supabase before wiring photo upload UI.

create table if not exists public.entry_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  daily_log_id uuid references public.daily_logs(id) on delete cascade,
  entry_index int,
  pillar text not null check (pillar in ('quwwah','imaan','sabr','niyyah','adab')),
  category text not null default 'memory',
  storage_path text not null,
  thumbnail_path text,
  caption text,
  taken_at timestamptz not null default now(),
  is_private boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_entry_photos_user_taken on public.entry_photos(user_id, taken_at desc);
create index if not exists idx_entry_photos_daily_log on public.entry_photos(daily_log_id);

alter table public.entry_photos enable row level security;

drop policy if exists "entry_photos_select_own" on public.entry_photos;
create policy "entry_photos_select_own"
  on public.entry_photos for select
  using (auth.uid() = user_id);

drop policy if exists "entry_photos_insert_own" on public.entry_photos;
create policy "entry_photos_insert_own"
  on public.entry_photos for insert
  with check (auth.uid() = user_id);

drop policy if exists "entry_photos_update_own" on public.entry_photos;
create policy "entry_photos_update_own"
  on public.entry_photos for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "entry_photos_delete_own" on public.entry_photos;
create policy "entry_photos_delete_own"
  on public.entry_photos for delete
  using (auth.uid() = user_id);

-- Private storage bucket. The Supabase dashboard may already have this bucket;
-- this keeps the migration safe if it exists.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('user-photos', 'user-photos', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Storage object policies. Files should be written under: {user_id}/filename.jpg
-- This matches foldername(name)[1] to auth.uid().
drop policy if exists "user_photos_select_own_folder" on storage.objects;
create policy "user_photos_select_own_folder"
  on storage.objects for select
  using (
    bucket_id = 'user-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "user_photos_insert_own_folder" on storage.objects;
create policy "user_photos_insert_own_folder"
  on storage.objects for insert
  with check (
    bucket_id = 'user-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "user_photos_update_own_folder" on storage.objects;
create policy "user_photos_update_own_folder"
  on storage.objects for update
  using (
    bucket_id = 'user-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  )
  with check (
    bucket_id = 'user-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "user_photos_delete_own_folder" on storage.objects;
create policy "user_photos_delete_own_folder"
  on storage.objects for delete
  using (
    bucket_id = 'user-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
