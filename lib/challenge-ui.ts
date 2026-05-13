export const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600 placeholder:text-slate-400";
export const cardClass = "rounded-[2rem] bg-white/90 p-6 shadow-xl shadow-emerald-950/5";
export const pageBg = "min-h-screen bg-[radial-gradient(circle_at_top_left,#dcfce7,transparent_32%),#fff8ed] px-4 py-8 text-slate-900";

export type StoredProfile = {
  name?: string;
  age?: string;
  heightFeet?: string;
  heightInches?: string;
  currentWeightLbs?: string;
  goalWeightLbs?: string;
  startDate?: string;
  challenge_started_at?: string;
  challenge_started_local_date?: string;
  endDate?: string;
  wakeTime?: string;
  calorieTarget?: string;
  stepTarget?: string;
  waterTarget?: string;
  currentHifdh?: string;
  goalHifdh?: string;
  quranDailyTarget?: string;
  quranReviewTarget?: string;
  goal1?: string;
  goal1Task?: string;
  goal2?: string;
  goal2Task?: string;
  personalGoals?: Array<{ name: string; endGoal: string; dailyTask: string; frequency: string; tracking?: string }>;
};

function localDateOnly(value?: string | Date) {
  if (!value) {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }
  if (value instanceof Date) return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  const text = String(value).slice(0, 10);
  const parts = text.split("-").map(Number);
  if (parts.length === 3 && parts.every(Number.isFinite)) return new Date(parts[0], parts[1] - 1, parts[2]);
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function localTodayKey(today: Date = new Date()) {
  const day = localDateOnly(today);
  const year = day.getFullYear();
  const month = String(day.getMonth() + 1).padStart(2, "0");
  const date = String(day.getDate()).padStart(2, "0");
  return `${year}-${month}-${date}`;
}

export function getStableChallengeStart(profile?: Record<string, any>) {
  // IMPORTANT: startDate is the user's selected start date and is the source of truth.
  // Older builds sometimes saved challenge_started_at as the day onboarding was completed,
  // which broke future starts. Never let that override the selected startDate.
  return profile?.startDate || profile?.challenge_started_local_date || profile?.challenge_started_at || "";
}

export function daysBetween(start?: string, end?: string) {
  if (!start || !end) return 0;
  const startDay = localDateOnly(start).getTime();
  const endDay = localDateOnly(end).getTime();
  return Math.max(1, Math.floor((endDay - startDay) / 86400000) + 1);
}

export function rawDayDiffFromStart(start?: string, today: Date = new Date()) {
  if (!start) return 0;
  const startDay = localDateOnly(start).getTime();
  const todayDay = localDateOnly(today).getTime();
  return Math.floor((todayDay - startDay) / 86400000);
}

export function isChallengeStarted(start?: string, today: Date = new Date()) {
  return rawDayDiffFromStart(start, today) >= 0;
}

export function isChallengeStartedFromProfile(profile?: Record<string, any>, today: Date = new Date()) {
  return isChallengeStarted(getStableChallengeStart(profile), today);
}

export function daysUntilChallengeStart(start?: string, today: Date = new Date()) {
  return Math.max(0, -rawDayDiffFromStart(start, today));
}

export function dayOfChallenge(start?: string, today: Date = new Date()) {
  if (!start) return 1;
  const diff = rawDayDiffFromStart(start, today);
  return diff < 0 ? 0 : diff + 1;
}

export function challengeDisplayLabel(profile?: Record<string, any>, today: Date = new Date()) {
  const start = getStableChallengeStart(profile);
  const total = totalChallengeDaysFromProfile(profile);
  const day = dayOfChallenge(start, today);
  if (!start) return `Day 1 of ${total || 1}`;
  if (day === 0) {
    const days = daysUntilChallengeStart(start, today);
    const startLabel = localDateOnly(start).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `Starts ${startLabel}${days > 0 ? ` • ${days} day${days === 1 ? "" : "s"} left` : ""}`;
  }
  return `Day ${Math.min(day, total || day)} of ${total || day}`;
}

export function dayOfChallengeFromProfile(profile?: Record<string, any>, today: Date = new Date()) {
  return dayOfChallenge(getStableChallengeStart(profile), today);
}

export function totalChallengeDaysFromProfile(profile?: Record<string, any>) {
  return daysBetween(getStableChallengeStart(profile), profile?.endDate);
}

export function daysSinceStart(start?: string, today: Date = new Date()) {
  return Math.max(0, dayOfChallenge(start, today) - 1);
}

export function formatNum(value?: string | number) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed.toLocaleString() : "0";
}

export function requiredProfileComplete(profile: StoredProfile) {
  const values = [profile.name, profile.age, profile.heightFeet, profile.heightInches, profile.currentWeightLbs, profile.goalWeightLbs, profile.startDate, profile.endDate, profile.wakeTime, profile.calorieTarget, profile.stepTarget, profile.waterTarget, profile.currentHifdh, profile.goalHifdh, profile.quranDailyTarget, profile.quranReviewTarget, profile.goal1, profile.goal1Task, profile.goal2, profile.goal2Task];
  return values.every((value) => String(value || "").trim().length > 0);
}
