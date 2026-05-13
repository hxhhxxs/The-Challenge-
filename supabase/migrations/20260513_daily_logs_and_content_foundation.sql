-- The Challenge: daily logs, scoring fields, leaderboard fields, and content foundation
-- Run this migration in Supabase before moving check-ins out of onboarding_draft.

create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  entries jsonb not null default '{}'::jsonb,
  weight numeric,
  sleep jsonb not null default '{}'::jsonb,
  goals jsonb not null default '{}'::jsonb,
  salah jsonb not null default '{}'::jsonb,
  reflection jsonb not null default '{}'::jsonb,
  computed_points jsonb not null default '{}'::jsonb,
  locked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

alter table public.daily_logs enable row level security;

drop policy if exists "Users can read their own logs" on public.daily_logs;
create policy "Users can read their own logs"
  on public.daily_logs for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own logs" on public.daily_logs;
create policy "Users can insert their own logs"
  on public.daily_logs for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own logs" on public.daily_logs;
create policy "Users can update their own logs"
  on public.daily_logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists daily_logs_user_date_idx on public.daily_logs(user_id, date desc);

alter table public.users add column if not exists current_score numeric not null default 0;
alter table public.users add column if not exists pillar_scores jsonb not null default '{"quwwah":0,"imaan":0,"sabr":0,"niyyah":0,"adab":0}'::jsonb;
alter table public.users add column if not exists display_name text;
alter table public.users add column if not exists privacy_show_on_leaderboard boolean not null default false;
alter table public.users add column if not exists current_challenge_id uuid;

-- Public leaderboard policy: only opted-in rows should be visible.
-- Keep private data out of the public query by selecting only safe columns in the app.
drop policy if exists "Users can see public leaderboard rows" on public.users;
create policy "Users can see public leaderboard rows"
  on public.users for select
  using (auth.uid() = id or privacy_show_on_leaderboard = true);

-- Content foundation tables.
create table if not exists public.learning_items (
  id text primary key,
  type text not null check (type in ('verse','hadith','sahaba_story','prophet_story','daily_task','weekly_task','joy_task')),
  title text not null,
  arabic_text text,
  short_text text not null,
  full_text text,
  themes text[] not null default '{}',
  reference text,
  reading_time_seconds integer not null default 60,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.user_saved_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  learning_item_id text not null references public.learning_items(id) on delete cascade,
  saved_at timestamptz not null default now(),
  primary key (user_id, learning_item_id)
);

alter table public.learning_items enable row level security;
alter table public.user_saved_items enable row level security;

drop policy if exists "Everyone can read active learning items" on public.learning_items;
create policy "Everyone can read active learning items"
  on public.learning_items for select
  using (active = true);

drop policy if exists "Users can read their saved learning items" on public.user_saved_items;
create policy "Users can read their saved learning items"
  on public.user_saved_items for select
  using (auth.uid() = user_id);

drop policy if exists "Users can save learning items" on public.user_saved_items;
create policy "Users can save learning items"
  on public.user_saved_items for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can unsave learning items" on public.user_saved_items;
create policy "Users can unsave learning items"
  on public.user_saved_items for delete
  using (auth.uid() = user_id);

-- Helper trigger for updated_at on daily_logs.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_daily_logs_updated_at on public.daily_logs;
create trigger set_daily_logs_updated_at
before update on public.daily_logs
for each row execute function public.set_updated_at();
