# The Challenge — Full Build Spec

This document is the source of truth for building The Challenge into a real app.

## Tech Decisions

- Frontend: Next.js
- Backend/DB/Auth: Supabase
- Hosting: Vercel
- State: React Context or Zustand
- Charts: Recharts
- Date/time: date-fns
- Forms: React Hook Form + Zod
- Design rule: mobile-first at 375px width

## App Flow

```text
LANDING
  ├─→ SIGN UP ─→ EMAIL VERIFY ─→ ONBOARDING (10 steps) ─→ PLAN PREVIEW ─→ DASHBOARD
  └─→ LOGIN ─────────────────────────────────────────────────────────────→ DASHBOARD

DASHBOARD ─→ DAILY CHECK-IN
          ─→ SCORE / PROGRESS
          ─→ MONTHLY LIMITS
          ─→ LEADERBOARD
          ─→ BADGES
          ─→ SETTINGS
          ─→ ADMIN if user.role = admin
```

Rule: if a logged-in user has `onboarding_complete = false`, every protected route redirects them to `/onboarding`.

## MVP Build Order

1. Auth + signup + login + email verify.
2. Onboarding flow with draft-save.
3. Dashboard read-only mission generated from onboarding data.
4. Daily check-in form writing to `daily_logs`.
5. Scoring engine with unit tests.
6. Progress page with score, category breakdown, and pace.
7. Deterministic random task assignment.
8. Joy task and weekly big task assignment.
9. Monthly limits page.
10. Badges.
11. Settings.
12. Admin task bank.
13. Leaderboard last.

## Screens

### Landing `/`

- Logo top center.
- Headline: `100 points. One challenge. A new you.`
- Subheadline: `Rebuild your body, faith, discipline, and goals in one daily mission.`
- Feature cards:
  - Daily personalized mission
  - Honest 0–100 scoring
  - Compete or stay private
- Primary CTA: Start My Challenge → `/signup`
- Secondary CTA: I already have an account → `/login`
- Footer: Privacy, Terms, Contact
- Logged-in users redirect to `/dashboard`.

### Signup `/signup`

Fields:

| Field | Validation |
|---|---|
| Full name | required, 2–60 chars |
| Email | required, valid email, unique |
| Username | required, 3–20 chars, lowercase, no spaces, unique |
| Password | min 8 chars, 1 letter, 1 number |
| Confirm password | must match |
| Date of birth | required, 13+ |
| Agree to Terms | required |
| Marketing emails | optional, default off |

On submit:
1. Create Supabase Auth user.
2. Insert row in `users` table.
3. Send email verification.
4. Redirect to `/verify-email`.

### Email Verify `/verify-email`

- 6-digit code input.
- Resend code after 30 seconds.
- On verify, set `email_verified = true` and redirect to `/onboarding`.

### Login `/login`

- Email or username.
- Password.
- Remember me.
- Forgot password.
- Route to onboarding if incomplete, dashboard if complete.

### Forgot Password `/forgot-password`

- Email input.
- Always show: `If an account exists for that email, we sent a link.`

## Onboarding `/onboarding`

Single route with step state 1–10. Save draft to `users.onboarding_draft` on every Next.

### Step 1 — Welcome

- Hey [Name] — let's build your challenge.
- This takes about 10 minutes. Be honest.

### Step 2 — Basic Info

- Age 13–100
- Gender
- Height with unit toggle
- Current weight with unit
- Goal weight with unit

### Step 3 — Challenge Length

- Start date default today, cannot be past.
- End date must be 30–365 days after start.
- Presets: 30 / 60 / 90 / 180.
- Show points per day needed.

### Step 4 — Sleep & Wake

- Wake-up time goal.
- Bedtime goal.
- Current average sleep.
- Warn below 6 or above 10 hours.

### Step 5 — Body Goals

- Daily calorie target.
- Calculate for me using Mifflin-St Jeor.
- Hard floor: 1500 men, 1200 women.
- Daily step goal.
- Daily water goal.
- Activity level.
- Exercise experience.

### Step 6 — Exercise Preferences

- Preferred types.
- Equipment access.
- Minutes per workout.
- Days per week.
- Injuries/limitations.

### Step 7 — Qur'an & Worship

- Current hifdh juz.
- Additional surahs.
- Goal hifdh.
- Measurement preference.
- Daily memorization goal.
- Daily review goal.
- Tajweed practice.
- Worship goals.

### Step 8 — Personal Goal #1

- Goal name.
- Why.
- End goal.
- Daily task.
- Days per week.
- Proof method.

### Step 9 — Personal Goal #2

Same as Step 8. Exactly two goals required for MVP.

### Step 10 — Monthly Limits + Screen Limits

Monthly limits:
- Spending money.
- Restaurant visits.
- Fast food.
- Going out.
- Sweets/snacks.
- Cheat meals.
- Missed workouts.
- Entertainment spending.

Screen limits:
- Total screen time per day.
- Social media.
- YouTube.
- TikTok/Reels/Shorts.
- Gaming.
- TV/Netflix.
- TV episodes per week.
- No phone after bedtime.

Privacy:
- Display name.
- Show on leaderboard.
- What to show publicly.

## Plan Preview `/onboarding/plan`

Show:
- Challenge length.
- Weight target.
- Daily targets.
- Qur'an target.
- Personal Goal 1.
- Personal Goal 2.
- Score pace.

Buttons:
- Edit.
- Start Day 1.

## Dashboard `/dashboard`

Mobile-first sections:
- Top bar.
- Hero score card.
- Today's mission.
- Monthly limits widget.
- Leaderboard preview.
- Recent badges.
- Daily reflection.
- Sticky end-of-day check-in CTA.

## Daily Check-In `/check-in`

Sections:
- Body.
- Qur'an & Worship.
- Personal Goals.
- Random + Joy.
- Discipline & limits.
- Sleep.
- Reflection.
- Honesty pledge.

On submit:
- Compute points.
- Write to `daily_logs`.
- Update aggregate score.
- Update streak.
- Lock the day.

## Scoring Engine

The scoring engine must be a pure function:

```ts
computeDailyPoints(challenge, dailyLog) => {
  body,
  quran,
  discipline,
  personal,
  character,
  total
}
```

Formula:

```text
daily_max_points = 100 / total_challenge_days
body_day_max       = daily_max_points × 0.25
quran_day_max      = daily_max_points × 0.25
discipline_day_max = daily_max_points × 0.20
personal_day_max   = daily_max_points × 0.20
character_day_max  = daily_max_points × 0.10
```

Status:

```text
expected_score_today = (days_elapsed / total_days) × 100
Ahead    if current >= expected + 5
On track if expected - 5 <= current < expected + 5
Behind   if expected - 15 <= current < expected - 5
Danger   if current < expected - 15
```

## Data Model

Use Supabase/Postgres tables:

- users
- challenges
- personal_goals
- daily_logs
- random_task_bank
- weekly_task_bank
- joy_task_bank
- assigned_tasks
- badges
- user_badges
- groups
- group_members

See `docs/SUPABASE_SCHEMA.sql` for the actual schema.

## Anti-Cheating Rules

- Daily log locks 6 hours after submission.
- Cannot submit future-dated logs.
- Cannot submit more than one log per date.
- Calorie target edits limited to ±10% per week.
- End date cannot be extended once started.
- Only today and yesterday can be logged.
- Leaderboard pace is computed server-side.

## Tone

Use mission-themed copy:

- Submit → Lock in today.
- Empty leaderboard → No one here yet. Show up first.
- Behind → Behind. You can still hit 100 — increase pace.
- Danger → Danger. Reset starts now. One good day.
- Ahead → Ahead. Keep moving.
