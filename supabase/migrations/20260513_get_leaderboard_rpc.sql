-- The Challenge leaderboard RPC
-- Use this when RLS blocks direct users table reads.
-- Returns only safe public leaderboard fields.

create or replace function public.get_leaderboard()
returns table (
  id uuid,
  name text,
  username text,
  display_name text,
  current_score numeric,
  pillar_scores jsonb,
  onboarding_draft jsonb
)
language sql
security definer
set search_path = public
as $$
  select
    u.id,
    u.name,
    u.username,
    u.display_name,
    coalesce(u.current_score, 0) as current_score,
    coalesce(u.pillar_scores, '{"quwwah":0,"imaan":0,"sabr":0,"niyyah":0,"adab":0}'::jsonb) as pillar_scores,
    jsonb_build_object(
      'name', coalesce(u.display_name, u.username, u.name, 'Challenger'),
      'current_score', coalesce(u.current_score, 0),
      'pillar_scores', coalesce(u.pillar_scores, '{"quwwah":0,"imaan":0,"sabr":0,"niyyah":0,"adab":0}'::jsonb)
    ) as onboarding_draft
  from public.users u
  where coalesce(u.privacy_show_on_leaderboard, true) = true
  order by coalesce(u.current_score, 0) desc, u.created_at asc
  limit 100;
$$;

grant execute on function public.get_leaderboard() to authenticated;
