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

const rankColors: Record<string, string> = {
  Iron: "bg-stone-600 text-white",
  Bronze: "bg-orange-700 text-white",
  Silver: "bg-slate-300 text-slate-950",
  Gold: "bg-yellow-400 text-slate-950",
  Platinum: "bg-cyan-300 text-slate-950",
  Emerald: "bg-emerald-500 text-white",
  Diamond: "bg-blue-500 text-white",
  Master: "bg-purple-600 text-white",
  Grandmaster: "bg-red-600 text-white",
  Challenger: "bg-sky-500 text-white",
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
