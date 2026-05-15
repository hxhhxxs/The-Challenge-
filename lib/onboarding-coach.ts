export function safeFirstName(fullName?: string | null) {
  if (!fullName || typeof fullName !== "string") return null;
  const first = fullName.trim().split(/\s+/)[0];
  if (first.length < 2 || first.length > 30 || /[\d_]/.test(first)) return null;
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ'’-]+$/.test(first)) return null;
  return first[0].toUpperCase() + first.slice(1).toLowerCase();
}

export function daysBetween(start?: string, end?: string) {
  if (!start || !end) return 0;
  const startDay = new Date(`${String(start).slice(0, 10)}T00:00:00`);
  const endDay = new Date(`${String(end).slice(0, 10)}T00:00:00`);
  return Math.max(1, Math.floor((endDay.getTime() - startDay.getTime()) / 86400000) + 1);
}

export function heightToCm(feet?: string | number, inches?: string | number, heightCm?: string | number) {
  const cm = Number(heightCm || 0);
  if (cm > 0) return cm;
  return Math.round(((Number(feet || 5) * 12) + Number(inches || 8)) * 2.54);
}

export function lbsToKg(lbs?: string | number) {
  return Number(lbs || 0) / 2.20462;
}

export function weightPace(currentWeight?: string | number, goalWeight?: string | number, challengeDays = 90) {
  const current = Number(currentWeight || 0);
  const goal = Number(goalWeight || 0);
  if (!current || !goal || !challengeDays) return null;
  const delta = goal - current;
  const weekly = Math.round((delta / challengeDays) * 7 * 10) / 10;
  const absWeekly = Math.abs(weekly);
  const kind = delta > 0 ? "gain" : delta < 0 ? "loss" : "maintain";
  const safeMax = kind === "gain" ? 1.5 : 2;
  const isFast = absWeekly > safeMax;
  return { delta, weekly, kind, isFast, safeMax };
}

export type BodyPlanInput = {
  gender?: string;
  age?: string | number;
  heightCm?: string | number;
  heightFeet?: string | number;
  heightInches?: string | number;
  currentWeightLbs?: string | number;
  goalWeightLbs?: string | number;
  challengeDays?: number;
  activityLevel?: string;
};

export function computeBodyPlan(input: BodyPlanInput) {
  const gender = String(input.gender || "").toLowerCase();
  const age = Number(input.age || 25);
  const currentLbs = Number(input.currentWeightLbs || 170);
  const currentKg = lbsToKg(currentLbs);
  const goalKg = lbsToKg(input.goalWeightLbs || currentLbs);
  const heightCm = heightToCm(input.heightFeet, input.heightInches, input.heightCm);
  const activity = String(input.activityLevel || "moderate").toLowerCase();
  const activityKey = activity.includes("sedentary") ? "sedentary" : activity.includes("light") ? "light" : activity.includes("active") || activity.includes("very") ? "active" : "moderate";
  const factor: Record<string, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 };
  const bmr = gender.includes("female") ? 10 * currentKg + 6.25 * heightCm - 5 * age - 161 : 10 * currentKg + 6.25 * heightCm - 5 * age + 5;
  const tdee = Math.round(bmr * factor[activityKey]);
  const challengeDays = Math.max(30, Number(input.challengeDays || 90));
  const deltaLbs = (goalKg - currentKg) * 2.20462;
  const weeklyChange = Math.round((deltaLbs / challengeDays) * 7 * 10) / 10;
  let dailyCalorieDelta = Math.round((deltaLbs / challengeDays) * 3500);
  dailyCalorieDelta = Math.max(-1000, Math.min(1000, dailyCalorieDelta));
  const floor = gender.includes("female") ? 1500 : 1800;
  const dailyTarget = Math.max(floor, tdee + dailyCalorieDelta);
  const dailyWaterCups = Math.max(6, Math.round((currentLbs / 2) / 8));
  const dailyStepsByActivity: Record<string, number> = { sedentary: 7000, light: 8000, moderate: 10000, active: 12000 };
  const exerciseDaysPerWeek = activityKey === "sedentary" ? 3 : activityKey === "active" ? 6 : 4;
  return { bmr: Math.round(bmr), tdee, dailyTarget, dailyWaterCups, dailySteps: dailyStepsByActivity[activityKey], exerciseMinPerSession: 45, exerciseDaysPerWeek, weeklyChange, isWeightGain: deltaLbs > 0, activityKey };
}

export function generateWeeklyWorkoutPlan(preferences: string[] = [], daysPerWeek = 4, injuries: string[] = []) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const prefs = preferences.length ? preferences : ["walking", "bodyweight"];
  const activeDays = ["Mon", "Wed", "Fri", "Sat", "Tue", "Thu"].slice(0, Math.min(6, Math.max(1, daysPerWeek)));
  const hasInjury = injuries.some((item) => item !== "none");
  const pick = (index: number) => {
    const pref = prefs[index % prefs.length];
    if (hasInjury && ["running", "sports"].includes(pref)) return "Low-impact walk + mobility";
    if (pref === "boxing") return "Boxing drills + shadow work";
    if (pref === "gym") return "Full-body strength session";
    if (pref === "bodyweight") return "Bodyweight strength circuit";
    if (pref === "swimming") return "Swim laps + easy recovery";
    if (pref === "running") return "Easy run + cooldown walk";
    if (pref === "cycling") return "Cycling endurance ride";
    return "Brisk walk + stretching";
  };
  return days.map((day, index) => {
    if (activeDays.includes(day)) return { day, minutes: 45, name: pick(index), type: "active" };
    if (day === "Sat" || day === "Sun") return { day, minutes: 30, name: "Light walk + recovery", type: "walk" };
    return { day, minutes: 0, name: "Rest / mobility", type: "rest" };
  });
}

export type QuranPlanInput = { unit?: string; currentHifdh?: string | number; goalHifdh?: string | number; challengeDays?: number; murajaaCycleDays?: string | number };

export function computeQuranPlan(input: QuranPlanInput) {
  const unit = input.unit || "pages";
  const current = Number(input.currentHifdh || 0);
  const goal = Number(input.goalHifdh || current);
  const challengeDays = Math.max(1, Number(input.challengeDays || 90));
  const cycle = Number(input.murajaaCycleDays || 10);
  const newAmount = Math.max(0, goal - current);
  const newPerDay = newAmount / challengeDays;
  const murajaaPerDay = Math.ceil(Math.max(goal, current) / cycle);
  const newMinutes: Record<string, number> = { lines: 2, pages: 15, surahs: 20, juz: 240 };
  const reviewMinutes: Record<string, number> = { lines: 0.5, pages: 3, surahs: 4, juz: 60 };
  const dailyMinutes = Math.round(newPerDay * (newMinutes[unit] || 2) + murajaaPerDay * (reviewMinutes[unit] || 1));
  const memorizationSchedule = newPerDay >= 1 ? `${Math.round(newPerDay * 10) / 10} ${unit} daily` : newPerDay > 0 ? `1 ${unit.replace(/s$/, "")} every ${Math.max(1, Math.round(1 / newPerDay))} days` : "Review-only plan";
  return { unit, newAmount, newPerDay, memorizationSchedule, murajaaPerDay, murajaaCycleDays: cycle, dailyMinutes };
}

export const limitFields = [
  { key: "spendingLimit", label: "Spending money limit", hint: "Discretionary money per month — $", unit: "$", group: "Money", defaultValue: "300" },
  { key: "restaurantLimit", label: "Restaurant visits per month", hint: "Sit-down restaurants only — count", unit: "count", group: "Money", defaultValue: "4" },
  { key: "fastFoodLimit", label: "Fast food per month", hint: "Delivery, drive-thru, quick meals — count", unit: "count", group: "Money", defaultValue: "4" },
  { key: "goingOutLimit", label: "Going out per month", hint: "Events and social outings — count", unit: "count", group: "Money", defaultValue: "4" },
  { key: "entertainmentLimit", label: "Entertainment spending", hint: "Movies, games, apps — $ per month", unit: "$", group: "Money", defaultValue: "50" },
  { key: "snackLimit", label: "Sweets / snacks per month", hint: "Desserts, chips, junk food — count", unit: "count", group: "Food limits", defaultValue: "8" },
  { key: "cheatMealLimit", label: "Cheat meals per month", hint: "Off-plan meals you give yourself — count", unit: "count", group: "Food limits", defaultValue: "4" },
  { key: "missedWorkoutLimit", label: "Allowed missed workouts", hint: "Per month — count", unit: "count", group: "Food limits", defaultValue: "3" },
  { key: "screenLimit", label: "Total screen time per day", hint: "Hours", unit: "hours", group: "Screens", defaultValue: "3" },
  { key: "socialLimit", label: "Social media per day", hint: "Hours", unit: "hours", group: "Screens", defaultValue: "1" },
  { key: "youtubeLimit", label: "YouTube per day", hint: "Hours", unit: "hours", group: "Screens", defaultValue: "1" },
  { key: "shortsLimit", label: "TikTok / Reels / Shorts per day", hint: "Hours", unit: "hours", group: "Screens", defaultValue: "0.5" },
  { key: "gamingLimit", label: "Gaming per day", hint: "Hours", unit: "hours", group: "Screens", defaultValue: "0.5" },
  { key: "tvLimit", label: "TV / Netflix per day", hint: "Hours", unit: "hours", group: "Screens", defaultValue: "1" },
  { key: "tvEpisodesWeek", label: "TV episodes per week", hint: "Count", unit: "count", group: "Screens", defaultValue: "3" },
];
