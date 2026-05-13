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
  const date = value instanceof Date ? value : value ? new Date(`${String(value).slice(0, 10)}T00:00:00`) : new Date();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function daysBetween(start?: string, end?: string) {
  if (!start || !end) return 0;
  const startDay = localDateOnly(start).getTime();
  const endDay = localDateOnly(end).getTime();
  return Math.max(1, Math.floor((endDay - startDay) / 86400000) + 1);
}

export function dayOfChallenge(start?: string, today: Date = new Date()) {
  if (!start) return 1;
  const startDay = localDateOnly(start).getTime();
  const todayDay = localDateOnly(today).getTime();
  return Math.max(1, Math.floor((todayDay - startDay) / 86400000) + 1);
}

export function daysSinceStart(start?: string, today: Date = new Date()) {
  return dayOfChallenge(start, today) - 1;
}

export function formatNum(value?: string | number) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed.toLocaleString() : "0";
}

export function requiredProfileComplete(profile: StoredProfile) {
  const values = [
    profile.name,
    profile.age,
    profile.heightFeet,
    profile.heightInches,
    profile.currentWeightLbs,
    profile.goalWeightLbs,
    profile.startDate,
    profile.endDate,
    profile.wakeTime,
    profile.calorieTarget,
    profile.stepTarget,
    profile.waterTarget,
    profile.currentHifdh,
    profile.goalHifdh,
    profile.quranDailyTarget,
    profile.quranReviewTarget,
    profile.goal1,
    profile.goal1Task,
    profile.goal2,
    profile.goal2Task,
  ];
  return values.every((value) => String(value || "").trim().length > 0);
}
