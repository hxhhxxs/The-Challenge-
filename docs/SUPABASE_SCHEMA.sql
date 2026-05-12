-- The Challenge Supabase schema draft
-- Run this later in Supabase SQL editor after the app moves from prototype localStorage to real auth/database.

create table if not exists public.users (
  id uuid primary key,
  email text unique not null,
  username text unique not null,
  name text not null,
  dob date,
  role text default 'user' check (role in ('user', 'admin')),
  email_verified boolean default false,
  onboarding_complete boolean default false,
  onboarding_draft jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  height numeric,
  gender text,
  starting_weight numeric,
  goal_weight numeric,
  daily_calorie_target numeric,
  step_goal numeric,
  water_goal numeric,
  wake_time time,
  bedtime time,
  measurement_unit text check (measurement_unit in ('lines','pages','surahs','juz')),
  current_hifdh_juz numeric default 0,
  current_hifdh_surahs jsonb default '[]'::jsonb,
  goal_hifdh_juz numeric default 0,
  goal_hifdh_surahs jsonb default '[]'::jsonb,
  daily_memorize_goal numeric,
  daily_review_goal numeric,
  exercise_prefs jsonb default '{}'::jsonb,
  equipment jsonb default '{}'::jsonb,
  injuries jsonb default '{}'::jsonb,
  monthly_limits jsonb default '{}'::jsonb,
  screen_limits jsonb default '{}'::jsonb,
  privacy_settings jsonb default '{}'::jsonb,
  status text default 'active' check (status in ('active','completed','abandoned')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint challenge_min_length check (end_date >= start_date + interval '30 days'),
  constraint challenge_max_length check (end_date <= start_date + interval '365 days')
);

create table if not exists public.personal_goals (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid references public.challenges(id) on delete cascade,
  slot integer not null check (slot in (1,2)),
  name text not null,
  why text,
  end_goal text not null,
  daily_task text not null,
  days_per_week integer check (days_per_week between 1 and 7),
  proof_method text,
  created_at timestamptz default now(),
  unique(challenge_id, slot)
);

create table if not exists public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid references public.challenges(id) on delete cascade,
  date date not null,
  weight numeric,
  calories numeric,
  protein numeric,
  water numeric,
  steps numeric,
  exercise_minutes numeric,
  exercise_type text,
  quran_memorized numeric,
  quran_reviewed numeric,
  salah_done jsonb default '{}'::jsonb,
  personal_goal_1 text check (personal_goal_1 in ('done','partial','missed')),
  personal_goal_2 text check (personal_goal_2 in ('done','partial','missed')),
  random_tasks_done jsonb default '[]'::jsonb,
  joy_task_done boolean default false,
  money_spent numeric,
  restaurant_visits integer default 0,
  screen_time jsonb default '{}'::jsonb,
  sleep_hours numeric,
  bedtime_actual timestamptz,
  wake_actual timestamptz,
  mood integer check (mood between 1 and 10),
  reflection_text text,
  what_slipped text,
  what_went_well text,
  computed_points jsonb default '{}'::jsonb,
  locked_at timestamptz,
  created_at timestamptz default now(),
  unique(challenge_id, date)
);

create table if not exists public.random_task_bank (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  difficulty text check (difficulty in ('easy','medium','hard')),
  time_minutes integer,
  repeat_allowed boolean default true,
  points_value numeric default 0,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.weekly_task_bank (like public.random_task_bank including all);
create table if not exists public.joy_task_bank (like public.random_task_bank including all);

create table if not exists public.assigned_tasks (
  id uuid primary key default gen_random_uuid(),
  daily_log_id uuid references public.daily_logs(id) on delete cascade,
  task_id uuid,
  task_type text check (task_type in ('random','weekly','joy')),
  slot integer,
  completed boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text,
  criteria jsonb default '{}'::jsonb,
  description text,
  created_at timestamptz default now()
);

create table if not exists public.user_badges (
  user_id uuid references public.users(id) on delete cascade,
  badge_id uuid references public.badges(id) on delete cascade,
  earned_at timestamptz default now(),
  primary key (user_id, badge_id)
);

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid references public.users(id) on delete cascade,
  created_at timestamptz default now()
);

create table if not exists public.group_members (
  group_id uuid references public.groups(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (group_id, user_id)
);
