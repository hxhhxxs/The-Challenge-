import { getRankFromScore, formatRank } from "@/lib/ranks";

export type PillarKey = "quwwah" | "imaan" | "sabr" | "niyyah" | "adab";

export type PillarStat = {
  key: PillarKey;
  name: string;
  arabic: string;
  meaning: string;
  description: string;
  score: number;
  rank: string;
  title: string;
  titleArabic: string;
};

export type PillarTotals = {
  pillars: PillarStat[];
  totalScore: number;
  overallScore: number;
  overallRank: string;
  strongest: PillarStat;
  title: string;
  titleArabic: string;
  isBalanced: boolean;
};

const definitions: Array<Omit<PillarStat, "score" | "rank">> = [
  {
    key: "quwwah",
    name: "Quwwah",
    arabic: "قُوَّة",
    meaning: "Strength",
    description: "Body, steps, exercise, water, calories.",
    title: "The Strong",
    titleArabic: "القَوِيّ",
  },
  {
    key: "imaan",
    name: "Imaan",
    arabic: "إِيمَان",
    meaning: "Faith",
    description: "Qur'an, salah, worship, dhikr.",
    title: "The Steadfast",
    titleArabic: "الثَّابِت",
  },
  {
    key: "sabr",
    name: "Sabr",
    arabic: "صَبْر",
    meaning: "Discipline",
    description: "Sleep, screen time, money, monthly limits.",
    title: "The Patient",
    titleArabic: "الصَّابِر",
  },
  {
    key: "niyyah",
    name: "Niyyah",
    arabic: "نِيَّة",
    meaning: "Mission",
    description: "Personal goals and implementation intentions.",
    title: "The Sincere",
    titleArabic: "الْمُخْلِص",
  },
  {
    key: "adab",
    name: "Adab",
    arabic: "أَدَب",
    meaning: "Character",
    description: "Reflection, service, family, joy tasks, random tasks.",
    title: "The Refined",
    titleArabic: "الْمُهَذَّب",
  },
];

function clampScore(value: unknown) {
  const score = Number(value || 0);
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function titleForRank(baseTitle: string, score: number) {
  const rank = getRankFromScore(score);
  if (rank.name === "Iron") return `Aspiring ${baseTitle}`;
  if (rank.name === "Bronze") return `Aspiring ${baseTitle}`;
  if (rank.name === "Silver") return baseTitle;
  if (rank.name === "Gold" || rank.name === "Platinum") return `True ${baseTitle}`;
  if (["Diamond", "Master", "Grandmaster", "Challenger"].includes(rank.name)) return `${baseTitle} of the Challenge`;
  return baseTitle;
}

export function computePillarStats(raw?: Partial<Record<PillarKey, number>>): PillarTotals {
  const pillars = definitions.map((definition) => {
    const score = clampScore(raw?.[definition.key]);
    return {
      ...definition,
      score,
      rank: formatRank(score),
      title: titleForRank(definition.title, score),
    };
  });

  const scores = pillars.map((pillar) => pillar.score);
  const totalScore = scores.reduce((sum, score) => sum + score, 0);
  const overallScore = Math.round(totalScore / pillars.length);
  const highest = Math.max(...scores);
  const lowest = Math.min(...scores);
  const isBalanced = highest - lowest <= 5;
  const strongest = [...pillars].sort((a, b) => b.score - a.score)[0] || pillars[0];

  return {
    pillars,
    totalScore,
    overallScore,
    overallRank: formatRank(overallScore),
    strongest,
    title: isBalanced ? "Al-Muwazin — The Balanced" : strongest.title,
    titleArabic: isBalanced ? "المُوَازِن" : strongest.titleArabic,
    isBalanced,
  };
}

export function demoPillarStats() {
  // Presentation-safe demo values. Replace with real daily_logs aggregation in the backend phase.
  return computePillarStats({
    quwwah: 0,
    imaan: 0,
    sabr: 0,
    niyyah: 0,
    adab: 0,
  });
}
