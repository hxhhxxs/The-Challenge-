# The Challenge — Spec Compliance Checklist

This file tracks whether the live app matches the full product spec. The goal is to stop patching randomly and build in the correct MVP order.

## Current State

The current deployed `/instant` app is a working prototype only. It proves:

- Supabase account creation/login can work.
- User can enter onboarding data.
- User can reach a basic dashboard.
- A basic local daily check-in can calculate temporary points.

It does **not** yet fully match the full build spec.

---

## Required App Flow

```text
LANDING
  ├─→ SIGN UP ─→ EMAIL VERIFY/INSTANT AUTH ─→ ONBOARDING (10 steps) ─→ PLAN PREVIEW ─→ DASHBOARD
  └─→ LOGIN ─────────────────────────────────────────────────────────────→ DASHBOARD

DASHBOARD ─→ DAILY CHECK-IN
          ─→ SCORE / PROGRESS
          ─→ MONTHLY LIMITS
          ─→ LEADERBOARD
          ─→ BADGES
          ─→ SETTINGS
          ─→ ADMIN if user.role = admin
```

## Current Route Status

| Route | Required | Current Status | Notes |
|---|---:|---|---|
| `/` | Yes | Partial | Redirects to prototype flow instead of full landing page. |
| `/signup` | Yes | Missing | Signup is embedded in `/instant`. Needs real route. |
| `/login` | Yes | Missing | Login is embedded in `/instant`. Needs real route. |
| `/forgot-password` | Yes | Missing | Not built yet. |
| `/verify-email` | Optional for MVP | Skipped | User requested no verification for now. |
| `/onboarding` | Yes | Partial | Needs 10-step flow with draft save. |
| `/onboarding/plan` | Yes | Missing | Plan preview not built yet. |
| `/dashboard` | Yes | Partial | Basic dashboard exists in prototype only. |
| `/check-in` | Yes | Missing | Check-in is embedded in dashboard and not saving to `daily_logs`. |
| `/progress` | Yes | Missing | Not built yet. |
| `/limits` | Yes | Missing | Not built yet. |
| `/leaderboard` | Last | Missing | Correct to leave until real users exist. |
| `/badges` | Yes | Missing | Not built yet. |
| `/settings` | Yes | Missing | Not built yet. |
| `/admin` | Later MVP | Missing | Not built yet. |

---

## MVP Build Order to Follow Now

### 1. Auth + Signup + Login

Status: **Partially working**

Needs:
- Dedicated `/signup` route.
- Dedicated `/login` route.
- Password strength validation.
- Terms checkbox.
- Username uniqueness check before submit.
- Better duplicate account handling.
- Forgot password route.

Decision for MVP: Email verification is disabled because the project owner wants instant account creation.

### 2. Onboarding 10-Step Flow

Status: **Not complete**

Current prototype has one long onboarding page. It must become:

1. Welcome
2. Basic Info
3. Challenge Length
4. Sleep & Wake
5. Body Goals
6. Exercise Preferences
7. Qur'an & Worship
8. Personal Goal #1
9. Personal Goal #2
10. Monthly Limits + Screen Limits + Privacy

Requirements:
- Step progress bar.
- Back/Next buttons.
- Save `users.onboarding_draft` on every Next.
- Cannot skip required steps.
- Resume where user left off.
- Mobile-first 375px.

### 3. Plan Preview

Status: **Missing**

Needs `/onboarding/plan` with:
- Challenge length.
- Weight target.
- Daily targets.
- Qur'an target.
- Personal goals.
- Score pace.
- Edit button.
- Start Day 1 button.

### 4. Dashboard Read-Only Mission

Status: **Partial**

Needs:
- Top bar with initials, app name, streak.
- Hero score circle.
- Today's Mission rows with target/current/checkmark.
- Monthly limits widget.
- Leaderboard placeholder.
- Badge preview.
- Daily reflection prompt.
- Sticky check-in CTA.

### 5. Daily Check-In Form

Status: **Partial/local only**

Needs:
- Dedicated `/check-in` route.
- Write to `daily_logs` Supabase table.
- Enforce one log per date.
- Lock log after submission.
- Prevent future dates.
- Only today/yesterday allowed.

### 6. Scoring Engine

Status: **Started**

Existing file: `lib/scoring.ts`

Needs:
- Replace temporary dashboard scoring with the real pure function.
- Add unit tests.
- Use 25/25/20/20/10 category weights.
- Save computed category breakdown to `daily_logs.computed_points`.

### 7. Progress Page

Status: **Missing**

Needs:
- Big score.
- Pace chart.
- Category breakdown.
- Last 7 days mini chart.
- Insight panel.

### 8. Random Task Assignment

Status: **Temporary local array**

Needs:
- Read from `random_task_bank`.
- Deterministic assignment by user/date.
- Save assignments.

### 9. Joy + Weekly Task Assignment

Status: **Temporary local array**

Needs:
- Read from `joy_task_bank` and `weekly_task_bank`.
- Weekly task persists all week.

### 10. Monthly Limits Page

Status: **Missing**

Needs:
- Use monthly limit fields from onboarding.
- Progress bars.
- Lock edits except allowed dates.

### 11. Badges

Status: **Missing**

Start with:
- Perfect Day
- 7-Day Streak
- 10K Steps
- Qur'an Warrior
- Screen Control

### 12. Settings

Status: **Missing**

Needs:
- Profile settings.
- Privacy settings.
- Notification times.
- Logout.
- Data export.

### 13. Leaderboard

Status: **Correctly delayed**

Do not build final leaderboard until there are enough real users.

---

## Current Main Problems to Fix Next

1. Stop building everything inside `/instant`.
2. Create real routes.
3. Build the 10-step onboarding properly.
4. Save onboarding draft after each step.
5. Create the plan preview.
6. Build dashboard from saved Supabase data.
7. Write daily check-ins to Supabase.
8. Use the real scoring engine instead of local temporary scoring.

---

## Immediate Next Coding Task

Build the actual route structure:

```text
/
/signup
/login
/forgot-password
/onboarding
/onboarding/plan
/dashboard
/check-in
/progress
/limits
/badges
/settings
/admin
```

Then move the current `/instant` code into the correct pages step-by-step.

---

## Non-Negotiable Rules

- Mobile-first at 375px.
- Users cannot skip onboarding.
- No fake leaderboard users.
- Daily points must eventually be server/database trusted, not only client-calculated.
- Logs must be locked.
- The scoring engine must be pure and tested.
- The app should use mission-themed copy: `Lock in today`, `Build my plan`, `Start Day 1`.
