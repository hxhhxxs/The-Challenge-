-- Leaderboard read policy for The Challenge
-- Allows authenticated users to read safe leaderboard fields from users table.
-- The frontend must only select public fields: id, name, username, display_name, current_score, pillar_scores, onboarding_draft.

alter table public.users enable row level security;

drop policy if exists "Users can see public leaderboard rows" on public.users;
create policy "Users can see public leaderboard rows"
  on public.users
  for select
  using (
    auth.uid() = id
    or coalesce(privacy_show_on_leaderboard, true) = true
  );

-- Optional: for beta, make existing users visible unless they later opt out.
update public.users
set privacy_show_on_leaderboard = true
where privacy_show_on_leaderboard is null;
