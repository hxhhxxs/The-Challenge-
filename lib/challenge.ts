export type ChallengeStatus =
  | { status: "pre_challenge"; daysUntilStart: number; totalDays: number }
  | { status: "active"; dayNumber: number; totalDays: number }
  | { status: "completed"; dayNumber: number; totalDays: number };

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function toLocalMidnight(value: string | Date) {
  if (value instanceof Date) {
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  const text = String(value).slice(0, 10);
  const parts = text.split("-").map(Number);

  if (parts.length === 3 && parts.every(Number.isFinite)) {
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  const parsed = new Date(value);
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

export function getChallengeStatus(
  startDate: string | Date,
  endDate: string | Date,
  today: Date = new Date()
): ChallengeStatus {
  const start = toLocalMidnight(startDate);
  const end = toLocalMidnight(endDate);
  const now = toLocalMidnight(today);

  const totalDays = Math.max(1, Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY) + 1);
  const diffFromStart = Math.floor((now.getTime() - start.getTime()) / MS_PER_DAY);

  if (diffFromStart < 0) {
    return {
      status: "pre_challenge",
      daysUntilStart: Math.abs(diffFromStart),
      totalDays,
    };
  }

  if (diffFromStart >= totalDays) {
    return {
      status: "completed",
      dayNumber: totalDays,
      totalDays,
    };
  }

  return {
    status: "active",
    dayNumber: diffFromStart + 1,
    totalDays,
  };
}

export function selectedChallengeStart(profile?: Record<string, any>) {
  return profile?.startDate || profile?.start_date || "";
}

export function selectedChallengeEnd(profile?: Record<string, any>) {
  return profile?.endDate || profile?.end_date || "";
}

export function getProfileChallengeStatus(profile?: Record<string, any>, today: Date = new Date()): ChallengeStatus {
  const start = selectedChallengeStart(profile);
  const end = selectedChallengeEnd(profile);

  if (!start || !end) {
    return getChallengeStatus(today, today, today);
  }

  return getChallengeStatus(start, end, today);
}

export function formatStartDate(startDate: string | Date) {
  return toLocalMidnight(startDate).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
