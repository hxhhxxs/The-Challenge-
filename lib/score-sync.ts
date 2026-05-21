export type PillarScores = { quwwah: number; imaan: number; sabr: number; niyyah: number; adab: number };
export type ComputedPoints = { body: number; quran: number; discipline: number; personal: number; character: number; total: number; totals?: Record<string, number> };

export function scoreNumber(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function roundScore(value: number) {
  return Math.round(scoreNumber(value) * 1000) / 1000;
}

export function emptyPillarScores(): PillarScores {
  return { quwwah: 0, imaan: 0, sabr: 0, niyyah: 0, adab: 0 };
}

export function normalizeComputedPoints(points: any): ComputedPoints {
  const body = roundScore(points?.body);
  const quran = roundScore(points?.quran);
  const discipline = roundScore(points?.discipline);
  const personal = roundScore(points?.personal);
  const character = roundScore(points?.character);
  const explicitTotal = scoreNumber(points?.total);
  const total = roundScore(explicitTotal > 0 ? explicitTotal : body + quran + discipline + personal + character);
  return { body, quran, discipline, personal, character, total, totals: points?.totals || {} };
}

export function pillarScoresFromComputed(points: any): PillarScores {
  const p = normalizeComputedPoints(points || {});
  return { quwwah: p.body, imaan: p.quran, sabr: p.discipline, niyyah: p.personal, adab: p.character };
}

export function addPillarScores(a: PillarScores, b: Partial<PillarScores>): PillarScores {
  return {
    quwwah: roundScore(scoreNumber(a.quwwah) + scoreNumber(b.quwwah)),
    imaan: roundScore(scoreNumber(a.imaan) + scoreNumber(b.imaan)),
    sabr: roundScore(scoreNumber(a.sabr) + scoreNumber(b.sabr)),
    niyyah: roundScore(scoreNumber(a.niyyah) + scoreNumber(b.niyyah)),
    adab: roundScore(scoreNumber(a.adab) + scoreNumber(b.adab)),
  };
}

export function totalFromPillars(pillars: Partial<PillarScores>) {
  return roundScore(scoreNumber(pillars.quwwah) + scoreNumber(pillars.imaan) + scoreNumber(pillars.sabr) + scoreNumber(pillars.niyyah) + scoreNumber(pillars.adab));
}

export function aggregateLogsToScores(rows: Array<{ computed_points?: any; computedPoints?: any }>) {
  const pillars = (rows || []).reduce((acc, row) => addPillarScores(acc, pillarScoresFromComputed(row?.computed_points || row?.computedPoints || {})), emptyPillarScores());
  return { pillar_scores: pillars, current_score: totalFromPillars(pillars) };
}

export function sumEntryAmounts(entries: Record<string, Array<{ amount?: number }>> = {}, key: string) {
  return (entries[key] || []).reduce((sum, entry) => sum + scoreNumber(entry?.amount), 0);
}

export function ensureComputedTotals(points: any, entries: Record<string, Array<{ amount?: number }>> = {}) {
  const normalized = normalizeComputedPoints(points || {});
  return {
    ...normalized,
    totals: {
      calories: sumEntryAmounts(entries, "calories"),
      water: sumEntryAmounts(entries, "water"),
      steps: sumEntryAmounts(entries, "steps"),
      exercise: sumEntryAmounts(entries, "exercise"),
      quranMemorized: sumEntryAmounts(entries, "quranMemorized"),
      quranReviewed: sumEntryAmounts(entries, "quranReviewed"),
      money: sumEntryAmounts(entries, "money"),
      screen: sumEntryAmounts(entries, "screen"),
      ...(normalized.totals || {}),
    },
  };
}

export async function syncScoresFromDailyLogs(supabase: any, userId: string, fallbackDraft: Record<string, any> = {}) {
  const { data: rows, error } = await supabase.from("daily_logs").select("computed_points").eq("user_id", userId);
  if (error) throw error;
  const fromLogs = aggregateLogsToScores((rows || []) as Array<{ computed_points?: any }>);
  const current_score = fromLogs.current_score;
  const pillar_scores = fromLogs.pillar_scores;
  const nextDraft = { ...fallbackDraft, current_score, pillar_scores };
  const { error: updateError } = await supabase.from("users").update({ current_score, pillar_scores, onboarding_draft: nextDraft }).eq("id", userId);
  if (updateError) throw updateError;
  return { current_score, pillar_scores, onboarding_draft: nextDraft };
}
