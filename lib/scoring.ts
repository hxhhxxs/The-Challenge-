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

export function moreIsBetterScore(actual = 0, target = 1, bonusCap = 1.2) {
  if (target <= 0) return 0;
  return clamp(actual / target, 0, bonusCap) / bonusCap;
}

export function caloriesRangeScore(actual: number | undefined, target: number, gender: Gender, warnings: string[]) {
  if (!actual || actual <= 0 || target <= 0) return 0;
  const hardFloor = gender === "female" ? 1200 : 1500;
  if (actual < hardFloor) {
    warnings.push("Eating too little hurts you and your score.");
    return 0;
  }
  const differenceRatio = Math.abs(actual - target) / target;
  if (differenceRatio <= 0.1) return 1;
  if (differenceRatio <= 0.25) return 1 - ((differenceRatio - 0.1) / 0.15) * 0.5;
  return 0;
}

export function sleepRangeScore(hours?: number) {
  if (!hours || hours <= 0) return 0;
  if (hours >= 7 && hours <= 9) return 1;
  if (hours < 7) return clamp((hours - 4) / 3, 0, 1);
  return clamp((12 - hours) / 3, 0, 1);
}

export function lessIsBetterScore(actual = 0, limit = 1) {
  if (limit <= 0) return actual <= 0 ? 1 : 0;
  if (actual <= limit) return clamp(1 - 0.5 * (actual / limit), 0, 1);
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
  const dailyMax = 100 / Math.max(30, challenge.totalDays);
  const bodyMax = dailyMax * 0.25;
  const quranMax = dailyMax * 0.25;
  const disciplineMax = dailyMax * 0.2;
  const personalMax = dailyMax * 0.2;
  const characterMax = dailyMax * 0.1;

  const weightScore = computeWeightProgressScore(challenge.startingWeight, challenge.goalWeight, challenge.currentWeight ?? log.weight);
  const bodyRaw =
    weightScore * 0.3 +
    caloriesRangeScore(log.calories, challenge.calorieTarget, challenge.gender, warnings) * 0.2 +
    moreIsBetterScore(log.steps, challenge.stepGoal) * 0.2 +
    moreIsBetterScore(log.water, challenge.waterGoal) * 0.1 +
    moreIsBetterScore(log.exerciseMinutes, challenge.exerciseMinuteGoal, 1) * 0.2;

  const salahBase = clamp((log.salahCompleted || 0) / 5, 0, 1);
  const salahBonus = (log.salahOnTime || 0) > 0 ? Math.min(0.1, ((log.salahOnTime || 0) / 5) * 0.1) : 0;
  const quranRaw =
    moreIsBetterScore(log.quranMemorized, challenge.memorizeGoal) * 0.4 +
    moreIsBetterScore(log.quranReviewed, challenge.reviewGoal) * 0.3 +
    clamp(salahBase + salahBonus, 0, 1) * 0.3;

  const disciplineRaw =
    sleepRangeScore(log.sleepHours) * 0.25 +
    computeWakeScore(challenge.wakeTargetMinutes, log.wakeActualMinutes) * 0.15 +
    lessIsBetterScore(log.screenTimeHours, challenge.screenTimeLimit) * 0.2 +
    lessIsBetterScore(log.moneySpent, challenge.moneyDailyPaceLimit) * 0.2 +
    clamp(challenge.monthlyLimitScoreAverage, 0, 1) * 0.2;

  const personalRaw = goalResultScore(log.personalGoal1) * 0.5 + goalResultScore(log.personalGoal2) * 0.5;
  const characterRaw =
    clamp(log.randomTasksCompleted / 3, 0, 1) * 0.4 +
    (log.joyTaskDone ? 1 : 0) * 0.2 +
    (log.reflectionSubmitted ? 1 : 0) * 0.2 +
    (log.serviceOrFamilyExtra ? 1 : 0) * 0.2;

  const body = bodyRaw * bodyMax;
  const quran = quranRaw * quranMax;
  const discipline = disciplineRaw * disciplineMax;
  const personal = personalRaw * personalMax;
  const character = characterRaw * characterMax;

  return {
    body: roundThree(body),
    quran: roundThree(quran),
    discipline: roundThree(discipline),
    personal: roundThree(personal),
    character: roundThree(character),
    total: roundThree(body + quran + discipline + personal + character),
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
  const dailyMax = 100 / Math.max(30, totalDays);
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
  return Math.max(30, Math.floor((endDay.getTime() - startDay.getTime()) / 86400000) + 1);
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
  const challenge: ChallengeScoringInput = {
    totalDays: daysBetween(draft.startDate, draft.endDate),
    dayNumber: dateDiffDays(draft.startDate),
    gender: draft.gender || "prefer_not_to_say",
    startingWeight: Number(draft.currentWeightLbs || draft.currentWeight || 0),
    goalWeight: Number(draft.goalWeightLbs || draft.goalWeight || 0),
    currentWeight: Number(saved.weight || draft.currentWeightLbs || 0),
    calorieTarget: Number(draft.calorieTarget || 2200),
    stepGoal: Number(draft.stepTarget || 10000),
    waterGoal: Number(draft.waterTarget || 8),
    exerciseMinuteGoal: Number(draft.exerciseMinutes || draft.workoutMinutes || 45),
    memorizeGoal: Number(draft.quranDailyTarget || draft.dailyMemorizeGoal || 1),
    reviewGoal: Number(draft.quranReviewTarget || draft.dailyReviewGoal || 1),
    screenTimeLimit: Number(draft.screenTimeLimit || 3),
    moneyDailyPaceLimit: Number(draft.moneyDailyPaceLimit || 25),
    monthlyLimitScoreAverage: 1,
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
    randomTasksCompleted: 0,
    joyTaskDone: false,
    reflectionSubmitted: Boolean(reflection.mood || reflection.notes || reflection.slipped || reflection.wentWell),
    serviceOrFamilyExtra: false,
  };

  return computeDailyPoints(challenge, log);
}

export function aggregateCheckInScores(draft: Record<string, any>): AggregateCheckInScoresResult {
  const checkins = draft.checkins || {};
  return Object.values(checkins).reduce<AggregateCheckInScoresResult>(
    (acc, checkin: any) => {
      const points = checkin.computedPoints || computePointsFromSavedCheckIn(draft, checkin);
      acc.total += points.total || 0;
      acc.pillars.quwwah += points.body || 0;
      acc.pillars.imaan += points.quran || 0;
      acc.pillars.sabr += points.discipline || 0;
      acc.pillars.niyyah += points.personal || 0;
      acc.pillars.adab += points.character || 0;
      return acc;
    },
    { total: 0, pillars: { quwwah: 0, imaan: 0, sabr: 0, niyyah: 0, adab: 0 } }
  );
}
