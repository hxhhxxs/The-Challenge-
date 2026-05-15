export type Gender = "male" | "female" | "prefer_not_to_say";
export type GoalResult = "done" | "partial" | "missed";

export type ChallengeScoringInput = {
  totalDays: number;
  dayNumber: number;
  gender: Gender;
  startingWeight?: number;
  goalWeight?: number;
  currentWeight?: number;
  calorieTarget: number;
  stepGoal: number;
  waterGoal: number;
  exerciseMinuteGoal: number;
  memorizeGoal: number;
  reviewGoal: number;
  screenTimeLimit: number;
  moneyDailyPaceLimit: number;
  monthlyLimitScoreAverage: number;
  wakeTargetMinutes?: number;
};

export type DailyLogScoringInput = {
  weight?: number;
  calories?: number;
  water?: number;
  steps?: number;
  exerciseMinutes?: number;
  quranMemorized?: number;
  quranReviewed?: number;
  salahCompleted?: number;
  salahOnTime?: number;
  sleepHours?: number;
  wakeActualMinutes?: number;
  screenTimeHours?: number;
  moneySpent?: number;
  personalGoal1: GoalResult;
  personalGoal2: GoalResult;
  randomTasksCompleted: number;
  joyTaskDone: boolean;
  reflectionSubmitted: boolean;
  serviceOrFamilyExtra: boolean;
};

export type DailyPointBreakdown = {
  body: number;
  quran: number;
  discipline: number;
  personal: number;
  character: number;
  total: number;
  warnings: string[];
};

export type AggregateCheckInScoresResult = {
  total: number;
  pillars: {
    quwwah: number;
    imaan: number;
    sabr: number;
    niyyah: number;
    adab: number;
  };
};

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function roundThree(value: number) {
  return Math.round(value * 1000) / 1000;
}

export function proportionalScore(actual = 0, target = 1, cap = 1) {
  if (target <= 0) return actual > 0 ? 1 : 0;
  return clamp(actual / target, 0, cap);
}

export function moreIsBetterScore(actual = 0, target = 1, bonusCap = 1) {
  return proportionalScore(actual, target, bonusCap) / bonusCap;
}

export function caloriesRangeScore(actual: number | undefined, target: number, gender: Gender, warnings: string[]) {
  if (!actual || actual <= 0 || target <= 0) return 0;

  // Simple proportional scoring while the day is in progress:
  // 500 / 2500 calories = 20% of the calorie points.
  // Once the user reaches the target, they get full calorie credit.
  const ratio = proportionalScore(actual, target, 1);

  const hardFloor = gender === "female" ? 1200 : 1500;
  if (actual < hardFloor) warnings.push("Calories are building toward your target. Keep logging meals honestly.");
  return ratio;
}

export function sleepRangeScore(hours?: number) {
  if (!hours || hours <= 0) return 0;
  if (hours >= 7 && hours <= 9) return 1;
  if (hours < 7) return clamp(hours / 7, 0, 1);
  return clamp(9 / hours, 0, 1);
}

export function lessIsBetterScore(actual = 0, limit = 1) {
  if (!actual || actual <= 0) return 0;
  if (limit <= 0) return actual <= 0 ? 1 : 0;
  if (actual <= limit) return clamp(1 - 0.5 * (actual / limit), 0.25, 1);
  return clamp(1 - (actual - limit) / limit, 0, 1);
}

export function goalResultScore(result: GoalResult) {
  if (result === "done") return 1;
  if (result === "partial") return 0.5;
  return 0;
}

export function computeWeightProgressScore(startingWeight?: number, goalWeight?: number, currentWeight?: number) {
  if (!startingWeight || !goalWeight || !currentWeight) return 0;
  if (startingWeight === goalWeight) return 1;
  const totalNeeded = Math.abs(startingWeight - goalWeight);
  const moved = startingWeight > goalWeight ? startingWeight - currentWeight : currentWeight - startingWeight;
  // Example: goal is lose 10 lb, user lost 5 lb => 5/10 = 50% of weight-progress points.
  return clamp(moved / totalNeeded, 0, 1);
}

export function computeWakeScore(targetMinutes?: number, actualMinutes?: number) {
  if (targetMinutes === undefined || actualMinutes === undefined) return 0;
  const diff = Math.abs(actualMinutes - targetMinutes);
  if (diff <= 30) return 1;
  if (diff <= 90) return 0.5;
  return 0;
}

export function computeDailyPoints(challenge: ChallengeScoringInput, log: DailyLogScoringInput): DailyPointBreakdown {
  const warnings: string[] = [];
  const dailyMax = 100 / Math.max(1, challenge.totalDays);

  const bodyMax = dailyMax * 0.28;
  const quranMax = dailyMax * 0.24;
  const disciplineMax = dailyMax * 0.18;
  const personalMax = dailyMax * 0.2;
  const characterMax = dailyMax * 0.1;

  // Body points are proportional to each target. If steps are 20% of body and the user
  // walks 1,000/10,000, they earn 10% of that steps slice.
  const weightScore = computeWeightProgressScore(challenge.startingWeight, challenge.goalWeight, challenge.currentWeight ?? log.weight);
  const caloriesScore = caloriesRangeScore(log.calories, challenge.calorieTarget, challenge.gender, warnings);
  const stepsScore = proportionalScore(log.steps, challenge.stepGoal);
  const waterScore = proportionalScore(log.water, challenge.waterGoal);
  const exerciseScore = proportionalScore(log.exerciseMinutes, challenge.exerciseMinuteGoal);
  const bodyRaw =
    weightScore * 0.1 +
    caloriesScore * 0.25 +
    stepsScore * 0.2 +
    waterScore * 0.25 +
    exerciseScore * 0.2;

  const salahScore = proportionalScore(log.salahCompleted, 5);
  const salahOnTimeBonus = Math.min(0.1, proportionalScore(log.salahOnTime, 5) * 0.1);
  const quranRaw =
    proportionalScore(log.quranMemorized, challenge.memorizeGoal) * 0.35 +
    proportionalScore(log.quranReviewed, challenge.reviewGoal) * 0.3 +
    clamp(salahScore + salahOnTimeBonus, 0, 1) * 0.35;

  const disciplineRaw =
    sleepRangeScore(log.sleepHours) * 0.3 +
    computeWakeScore(challenge.wakeTargetMinutes, log.wakeActualMinutes) * 0.15 +
    lessIsBetterScore(log.screenTimeHours, challenge.screenTimeLimit) * 0.25 +
    lessIsBetterScore(log.moneySpent, challenge.moneyDailyPaceLimit) * 0.15 +
    clamp(challenge.monthlyLimitScoreAverage, 0, 1) * 0.15;

  const personalRaw = goalResultScore(log.personalGoal1) * 0.5 + goalResultScore(log.personalGoal2) * 0.5;
  const characterRaw =
    proportionalScore(log.randomTasksCompleted, 3) * 0.4 +
    (log.joyTaskDone ? 1 : 0) * 0.2 +
    (log.reflectionSubmitted ? 1 : 0) * 0.25 +
    (log.serviceOrFamilyExtra ? 1 : 0) * 0.15;

  const body = bodyRaw * bodyMax;
  const quran = quranRaw * quranMax;
  const discipline = disciplineRaw * disciplineMax;
  const personal = personalRaw * personalMax;
  const character = characterRaw * characterMax;
  const total = body + quran + discipline + personal + character;

  return {
    body: roundThree(body),
    quran: roundThree(quran),
    discipline: roundThree(discipline),
    personal: roundThree(personal),
    character: roundThree(character),
    total: roundThree(total),
    warnings,
  };
}

export function computePaceStatus(currentScore: number, dayNumber: number, totalDays: number) {
  const expected = (dayNumber / Math.max(1, totalDays)) * 100;
  if (currentScore >= expected + 5) return "Ahead";
  if (currentScore >= expected - 5) return "On track";
  if (currentScore >= expected - 15) return "Behind";
  return "Danger";
}

export function isPerfectDay(pointsEarned: number, totalDays: number) {
  const dailyMax = 100 / Math.max(1, totalDays);
  return pointsEarned >= dailyMax * 0.9;
}

function sumEntries(entries?: Array<{ amount?: number }>) {
  return (entries || []).reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0);
}

function dateDiffDays(start?: string) {
  if (!start) return 1;
  const today = new Date();
  const startDay = new Date(`${String(start).slice(0, 10)}T00:00:00`);
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.max(1, Math.floor((todayDay.getTime() - startDay.getTime()) / 86400000) + 1);
}

function daysBetween(start?: string, end?: string) {
  if (!start || !end) return 90;
  const startDay = new Date(`${String(start).slice(0, 10)}T00:00:00`);
  const endDay = new Date(`${String(end).slice(0, 10)}T00:00:00`);
  return Math.max(1, Math.floor((endDay.getTime() - startDay.getTime()) / 86400000) + 1);
}

function timeToMinutes(value?: string) {
  if (!value || !value.includes(":")) return undefined;
  const [hours, minutes] = value.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return undefined;
  return hours * 60 + minutes;
}

function normalizeGoalResult(value: any): GoalResult {
  if (value === "done" || value === "partial" || value === "missed") return value;
  return "missed";
}

export function computePointsFromSavedCheckIn(draft: Record<string, any>, saved: Record<string, any>): DailyPointBreakdown {
  const entries = saved.entries || {};
  const screenLimit = Number(draft.screenLimit || draft.screenTimeLimit || 3);
  const monthlySpending = Number(draft.spendingLimit || 300);
  const totalDays = daysBetween(draft.startDate, draft.endDate);
  const challenge: ChallengeScoringInput = {
    totalDays,
    dayNumber: dateDiffDays(draft.startDate),
    gender: draft.gender || "prefer_not_to_say",
    startingWeight: Number(draft.currentWeightLbs || draft.currentWeight || 0),
    goalWeight: Number(draft.goalWeightLbs || draft.goalWeight || 0),
    currentWeight: Number(saved.weight || draft.currentWeightLbs || draft.currentWeight || 0),
    calorieTarget: Number(draft.calorieTarget || 2200),
    stepGoal: Number(draft.stepTarget || 10000),
    waterGoal: Number(draft.waterTarget || 8),
    exerciseMinuteGoal: Number(draft.exerciseMinutes || draft.workoutMinutes || 45),
    memorizeGoal: Number(draft.quranDailyTarget || draft.dailyMemorizeGoal || 1),
    reviewGoal: Number(draft.quranReviewTarget || draft.dailyReviewGoal || 1),
    screenTimeLimit: screenLimit,
    moneyDailyPaceLimit: Number(draft.moneyDailyPaceLimit || Math.max(1, Math.round(monthlySpending / 30))),
    monthlyLimitScoreAverage: 0,
    wakeTargetMinutes: timeToMinutes(draft.wakeTime),
  };

  const salahValues = Object.values(saved.salah || {});
  const reflection = saved.reflection || {};
  const log: DailyLogScoringInput = {
    weight: Number(saved.weight || 0),
    calories: sumEntries(entries.calories),
    water: sumEntries(entries.water),
    steps: sumEntries(entries.steps),
    exerciseMinutes: sumEntries(entries.exercise),
    quranMemorized: sumEntries(entries.quranMemorized),
    quranReviewed: sumEntries(entries.quranReviewed),
    salahCompleted: salahValues.filter(Boolean).length,
    salahOnTime: 0,
    sleepHours: Number(saved.sleep?.hours || 0),
    wakeActualMinutes: timeToMinutes(saved.sleep?.wake),
    screenTimeHours: sumEntries(entries.screen),
    moneySpent: sumEntries(entries.money),
    personalGoal1: normalizeGoalResult(saved.goals?.goal1),
    personalGoal2: normalizeGoalResult(saved.goals?.goal2),
    randomTasksCompleted: Number(saved.randomTasksCompleted || 0),
    joyTaskDone: Boolean(saved.joyTaskDone),
    reflectionSubmitted: Boolean(reflection.mood || reflection.notes || reflection.slipped || reflection.wentWell),
    serviceOrFamilyExtra: Boolean(saved.serviceOrFamilyExtra),
  };

  return computeDailyPoints(challenge, log);
}

export function aggregateCheckInScores(draft: Record<string, any>): AggregateCheckInScoresResult {
  const checkins = draft.checkins || {};
  const result = Object.values(checkins).reduce<AggregateCheckInScoresResult>(
    (acc, checkin: any) => {
      const points = checkin.computedPoints || checkin.computed_points || computePointsFromSavedCheckIn(draft, checkin);
      acc.total += Number(points.total || 0);
      acc.pillars.quwwah += Number(points.body || 0);
      acc.pillars.imaan += Number(points.quran || 0);
      acc.pillars.sabr += Number(points.discipline || 0);
      acc.pillars.niyyah += Number(points.personal || 0);
      acc.pillars.adab += Number(points.character || 0);
      return acc;
    },
    { total: 0, pillars: { quwwah: 0, imaan: 0, sabr: 0, niyyah: 0, adab: 0 } }
  );
  return {
    total: roundThree(result.total),
    pillars: {
      quwwah: roundThree(result.pillars.quwwah),
      imaan: roundThree(result.pillars.imaan),
      sabr: roundThree(result.pillars.sabr),
      niyyah: roundThree(result.pillars.niyyah),
      adab: roundThree(result.pillars.adab),
    },
  };
}
