-- The Challenge beta leaderboard fix
-- During beta, authenticated users can read public leaderboard rows for all users.
-- The frontend only selects safe fields for leaderboard display.

alter table public.users enable row level security;

-- Make all existing beta users visible on the leaderboard.
update public.users
set privacy_show_on_leaderboard = true
where privacy_show_on_leaderboard is distinct from true;

-- Replace older stricter policy with a beta-open authenticated read policy.
drop policy if exists "Users can see public leaderboard rows" on public.users;
drop policy if exists "Authenticated users can read beta leaderboard" on public.users;

create policy "Authenticated users can read beta leaderboard"
  on public.users
  for select
  to authenticated
  using (true);

-- Keep anonymous users blocked by not granting anon select here.
