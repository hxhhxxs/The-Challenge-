export type ChallengeRank = {
  name: string;
  division: "III" | "II" | "I" | "";
  min: number;
  max: number;
  color: string;
  nextRank: string;
  progressToNext: number;
};

const rankNames = [
  "Iron",
  "Bronze",
  "Silver",
  "Gold",
  "Platinum",
  "Emerald",
  "Diamond",
  "Master",
  "Grandmaster",
  "Challenger",
];

// Use light backgrounds + dark text everywhere so rank labels are readable on white cards and mobile screens.
const rankColors: Record<string, string> = {
  Iron: "bg-stone-200 text-stone-950 border border-stone-400",
  Bronze: "bg-orange-200 text-orange-950 border border-orange-400",
  Silver: "bg-slate-200 text-slate-950 border border-slate-400",
  Gold: "bg-yellow-200 text-yellow-950 border border-yellow-400",
  Platinum: "bg-cyan-200 text-cyan-950 border border-cyan-400",
  Emerald: "bg-emerald-200 text-emerald-950 border border-emerald-400",
  Diamond: "bg-blue-200 text-blue-950 border border-blue-400",
  Master: "bg-purple-200 text-purple-950 border border-purple-400",
  Grandmaster: "bg-red-200 text-red-950 border border-red-400",
  Challenger: "bg-sky-200 text-sky-950 border border-sky-400",
};

export function getRankFromScore(rawScore: number): ChallengeRank {
  const score = Math.max(0, Math.min(100, Number.isFinite(rawScore) ? rawScore : 0));
  const rankIndex = Math.min(9, Math.floor(score / 10));
  const name = rankNames[rankIndex];
  const rankStart = rankIndex * 10;
  const rankEnd = rankIndex === 9 ? 100 : rankStart + 9;
  const withinRank = score - rankStart;
  const division = rankIndex === 9 && score === 100 ? "" : withinRank <= 2 ? "III" : withinRank <= 5 ? "II" : "I";
  const nextRank = score >= 100 ? "Perfect Challenger" : withinRank <= 2 ? `${name} II` : withinRank <= 5 ? `${name} I` : `${rankNames[Math.min(9, rankIndex + 1)]} III`;
  const nextThreshold = score >= 100 ? 100 : withinRank <= 2 ? rankStart + 3 : withinRank <= 5 ? rankStart + 6 : Math.min(100, rankStart + 10);
  const prevThreshold = withinRank <= 2 ? rankStart : withinRank <= 5 ? rankStart + 3 : rankStart + 6;
  const progressToNext = score >= 100 ? 100 : Math.round(((score - prevThreshold) / Math.max(1, nextThreshold - prevThreshold)) * 100);

  return {
    name,
    division,
    min: rankStart,
    max: rankEnd,
    color: rankColors[name],
    nextRank,
    progressToNext: Math.max(0, Math.min(100, progressToNext)),
  };
}

export function formatRank(score: number) {
  const rank = getRankFromScore(score);
  return `${rank.name}${rank.division ? ` ${rank.division}` : ""}`;
}
