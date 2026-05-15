"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { cardClass, pageBg } from "@/lib/challenge-ui";
import { getProfileChallengeStatus } from "@/lib/challenge";
import { computePillarStats } from "@/lib/pillars";
import { getRankFromScore } from "@/lib/ranks";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureUserRecord } from "@/lib/supabase/ensure-user-record";

type HistoryRow = {
  day: number;
  date: string;
  daily: number;
  actual: number;
  expected: number;
  points: Record<string, number>;
  totals: Record<string, number>;
  reflection: Record<string, any>;
  hasLog: boolean;
};

function paceStatus(currentScore: number, day: number, totalDays: number) {
  const expected = (day / Math.max(1, totalDays)) * 100;
  if (currentScore >= expected + 5) return { label: "Ahead", expected, color: "bg-emerald-100 text-emerald-900" };
  if (currentScore >= expected - 5) return { label: "On track", expected, color: "bg-emerald-100 text-emerald-900" };
  if (currentScore >= expected - 15) return { label: "Behind", expected, color: "bg-amber-100 text-amber-900" };
  return { label: "Needs focus", expected, color: "bg-red-100 text-red-900" };
}
function localDateKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function addDays(start: string, offset: number) { const d = new Date(`${String(start).slice(0, 10)}T00:00:00`); d.setDate(d.getDate() + offset); return localDateKey(d); }
function sumEntries(entries?: Array<{ amount?: number }>) { return (entries || []).reduce((total, entry) => total + (Number(entry.amount) || 0), 0); }
function sumEntryPoints(entries?: Array<{ points?: number }>) { return (entries || []).reduce((total, entry) => total + (Number(entry.points) || 0), 0); }
function totalsFromCheckin(checkin: any) { const savedTotals = checkin.computedPoints?.totals || checkin.computed_points?.totals || checkin.totals; if (savedTotals) return savedTotals; const entries = checkin.entries || {}; return { calories: sumEntries(entries.calories), water: sumEntries(entries.water), steps: sumEntries(entries.steps), exercise: sumEntries(entries.exercise), quranMemorized: sumEntries(entries.quranMemorized), quranReviewed: sumEntries(entries.quranReviewed), money: sumEntries(entries.money), screen: sumEntries(entries.screen) }; }
function pointsFromCheckin(checkin: any) { const computed = checkin.computedPoints || checkin.computed_points || {}; if (Number(computed.total || 0) > 0) return computed; const entries = checkin.entries || {}; const body = sumEntryPoints(entries.calories) + sumEntryPoints(entries.water) + sumEntryPoints(entries.steps) + sumEntryPoints(entries.exercise); const quran = sumEntryPoints(entries.quranMemorized) + sumEntryPoints(entries.quranReviewed); const discipline = sumEntryPoints(entries.money) + sumEntryPoints(entries.screen); const total = body + quran + discipline; return { body, quran, discipline, personal: 0, character: 0, total }; }
function normalizeLog(row: any): [string, any] { const computed = row.computed_points || row.computedPoints || {}; return [String(row.date), { ...row, computedPoints: computed, totals: totalsFromCheckin({ ...row, computedPoints: computed }) }]; }
function getDayNumber(startDate: string, date: string) { const start = new Date(`${String(startDate).slice(0, 10)}T00:00:00`); const day = new Date(`${String(date).slice(0, 10)}T00:00:00`); return Math.max(1, Math.floor((day.getTime() - start.getTime()) / 86400000) + 1); }
function topPillars(points: any) { const rows = [["Body", points?.body || 0], ["Faith", points?.quran || 0], ["Discipline", points?.discipline || 0], ["Mission", points?.personal || 0], ["Character", points?.character || 0]].sort((a: any, b: any) => b[1] - a[1]).filter((x: any) => x[1] > 0); return rows.slice(0, 2).map((x: any) => x[0]).join(", ") || "—"; }
function round1(n: number) { return Math.round(n * 10) / 10; }

export default function ProgressPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<Record<string, any> | null>(null);
  const [userScore, setUserScore] = useState<number | null>(null);
  const [userPillars, setUserPillars] = useState<Record<string, number> | null>(null);
  const [dailyLogs, setDailyLogs] = useState<Array<[string, any]>>([]);

  useEffect(() => { async function load() { const supabase = createSupabaseBrowserClient(); const { data } = await supabase.auth.getUser(); if (!data.user) { router.push("/login"); return; } const record = await ensureUserRecord(data.user); const loadedDraft = (record.onboarding_draft || {}) as Record<string, any>; setDraft(loadedDraft); setUserScore(Number((record as any).current_score ?? loadedDraft.current_score ?? 0)); setUserPillars(((record as any).pillar_scores || loadedDraft.pillar_scores || {}) as Record<string, number>); const { data: rows, error } = await supabase.from("daily_logs").select("*").eq("user_id", data.user.id).order("date", { ascending: true }); if (!error && rows && rows.length > 0) setDailyLogs(rows.map(normalizeLog)); else setDailyLogs(Object.entries(loadedDraft.checkins || {}).sort(([a], [b]) => a.localeCompare(b)).map(([date, checkin]: any) => [date, { ...checkin, totals: totalsFromCheckin(checkin) }]) as Array<[string, any]>); } load(); }, [router]);

  const checkins = useMemo(() => dailyLogs, [dailyLogs]);
  if (!draft) return <main className={pageBg}><section className={`${cardClass} mx-auto max-w-xl`}>Loading progress…</section><BottomNav /></main>;

  const status = getProfileChallengeStatus(draft);
  const currentDay = status.status === "pre_challenge" ? 0 : status.dayNumber;
  const totalDays = status.totalDays || 90;
  const history = buildHistory(checkins, draft.startDate || localDateKey(new Date()), totalDays, Math.max(1, currentDay || 1));
  const historyScore = history.length ? history[history.length - 1].actual : 0;
  const stats = computePillarStats(userPillars || draft.pillar_scores || {});
  const currentScore = Number(userScore ?? draft.current_score ?? historyScore ?? stats.totalScore ?? 0);
  const rank = getRankFromScore(stats.overallScore);
  const pace = paceStatus(currentScore, Math.max(1, currentDay), totalDays);

  return <main className={pageBg}><div className="mx-auto max-w-6xl space-y-6"><section className="rounded-[2rem] bg-slate-950 p-6 text-white"><p className="text-sm font-bold text-emerald-300">My Progress</p><div className="mt-3 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><h1 className="text-5xl font-black">{currentScore.toFixed(1)} / 100</h1><p className="mt-2 text-slate-300">{status.status === "pre_challenge" ? "Challenge scheduled" : `Day ${currentDay} of ${totalDays}`} • Expected today: {pace.expected.toFixed(1)}</p></div><span className={`w-fit rounded-full px-4 py-2 text-sm font-black ${pace.color}`}>{status.status === "pre_challenge" ? "Scheduled" : pace.label}</span></div></section>
    <section className={cardClass}><p className="text-sm font-black text-emerald-700">Score over time</p><h2 className="text-3xl font-black">Actual vs expected pace</h2><ScoreChart data={history} totalDays={totalDays} /></section>
    <section className={cardClass}><p className="text-sm font-black text-emerald-700">5 Pillars</p><h2 className="text-3xl font-black">Where your growth is happening</h2><div className="mt-6 space-y-4">{stats.pillars.map((pillar) => <div key={pillar.key}><div className="flex justify-between text-sm font-black"><span>{pillar.name}</span><span>{pillar.score.toFixed(1)}/100</span></div><div className="mt-2 h-4 rounded-full bg-slate-100"><div className="h-4 rounded-full bg-emerald-500" style={{ width: `${Math.min(100, pillar.score)}%` }} /></div></div>)}</div></section>
    <section className={cardClass}><p className="text-sm font-black text-emerald-700">Consistency</p><h2 className="text-3xl font-black">Daily heatmap</h2><Heatmap data={history} totalDays={totalDays} /></section>
    <section className={cardClass}><div className="flex flex-col justify-between gap-3 md:flex-row md:items-end"><div><p className="text-sm font-black text-emerald-700">Daily history</p><h2 className="text-3xl font-black">What changed each day</h2></div><Link href="/leaderboard" className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white">Compete in good →</Link></div><HistoryTable rows={history.filter((row) => row.hasLog)} /></section>
    <section className="grid gap-4 md:grid-cols-2"><div className={cardClass}><p className="text-sm font-bold text-slate-500">Rank & title</p><p className="mt-1 text-3xl font-black">{stats.overallRank}</p><p className="mt-1 text-lg font-black text-emerald-700">{currentScore > 0 ? stats.title : "Just Starting"}</p><p className="mt-1 text-sm font-bold text-slate-500">Next: {rank.nextRank}</p></div><Link href="/check-in" className={`${cardClass} block transition hover:-translate-y-1 hover:shadow-2xl`}><p className="text-sm font-bold text-slate-500">Next action</p><p className="mt-1 text-3xl font-black">Log today</p><p className="mt-1 text-sm font-bold text-emerald-700">Open Log →</p></Link></section>
  </div><BottomNav /></main>;
}

function buildHistory(checkins: Array<[string, any]>, startDate: string, totalDays: number, currentDay: number): HistoryRow[] {
  const byDate = new Map<string, any>(checkins.map(([date, checkin]) => [date, checkin]));
  const rows: HistoryRow[] = [];
  let cumulative = 0;
  const daysToShow = Math.max(currentDay, ...checkins.map(([date]) => getDayNumber(startDate, date)), 1);
  for (let day = 1; day <= Math.min(totalDays, daysToShow); day++) {
    const date = addDays(startDate, day - 1);
    const checkin = byDate.get(date);
    const points = checkin ? pointsFromCheckin(checkin) : {};
    const daily = Number(points.total || 0);
    cumulative += daily;
    rows.push({ day, date, daily, actual: round1(cumulative), expected: round1((day / Math.max(1, totalDays)) * 100), points, totals: checkin ? totalsFromCheckin(checkin) : {}, reflection: checkin?.reflection || {}, hasLog: Boolean(checkin) });
  }
  return rows;
}

function ScoreChart({ data, totalDays }: { data: HistoryRow[]; totalDays: number }) {
  const points = data.length ? data : [{ day: 1, actual: 0, expected: round1(100 / Math.max(1, totalDays)), daily: 0, date: "", points: {}, totals: {}, reflection: {}, hasLog: false }];
  const width = 760;
  const height = 260;
  const pad = 28;
  const maxDay = Math.max(totalDays, points[points.length - 1]?.day || 1, 1);
  function x(day: number) { return pad + ((day - 1) / Math.max(1, maxDay - 1)) * (width - pad * 2); }
  function y(score: number) { return height - pad - (Math.max(0, Math.min(100, score)) / 100) * (height - pad * 2); }
  const actualPath = points.map((p, i) => `${i ? "L" : "M"}${x(p.day)},${y(p.actual)}`).join(" ");
  const expectedPath = `M${x(1)},${y(100 / maxDay)} L${x(maxDay)},${y(100)}`;
  return <div className="mt-6 rounded-2xl bg-slate-50 p-4"><svg viewBox={`0 0 ${width} ${height}`} className="h-72 w-full overflow-visible"><line x1={pad} x2={width - pad} y1={height - pad} y2={height - pad} stroke="currentColor" opacity="0.18" /><line x1={pad} x2={pad} y1={pad} y2={height - pad} stroke="currentColor" opacity="0.18" /><path d={expectedPath} fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="8 8" opacity="0.35" /><path d={actualPath} fill="none" stroke="var(--theme-accent)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />{points.filter((p) => p.hasLog).map((p) => <circle key={p.date} cx={x(p.day)} cy={y(p.actual)} r="5" fill="var(--theme-accent)" />)}</svg><div className="mt-2 flex justify-between text-xs font-bold text-slate-500"><span>Day 1</span><span>Actual score vs expected pace</span><span>Day {points[points.length - 1]?.day || 1}</span></div></div>;
}
function Heatmap({ data, totalDays }: { data: HistoryRow[]; totalDays: number }) {
  const daysToShow = Math.max(84, Math.min(totalDays, Math.max(data.length, 1)));
  const byDay = new Map<number, HistoryRow>(data.map((row) => [row.day, row]));
  const days = Array.from({ length: daysToShow }, (_, i) => byDay.get(i + 1));
  return <div className="mt-5 rounded-2xl bg-slate-50 p-4"><div className="grid gap-1" style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}>{days.map((row, i) => { const score = Number(row?.daily || 0); const style = !row?.hasLog ? { backgroundColor: "rgba(148,163,184,0.25)" } : score < 0.25 ? { backgroundColor: "rgba(16,185,129,0.25)" } : score < 0.75 ? { backgroundColor: "rgba(16,185,129,0.50)" } : { backgroundColor: "var(--theme-accent)" }; return <div key={i} title={row ? `${row.date}: ${score.toFixed(3)} pts` : "No log"} className="aspect-square rounded-md" style={style} />; })}</div><div className="mt-3 flex items-center justify-between text-xs font-bold text-slate-500"><span>No log</span><span>More points = stronger color</span><span>{data.filter((r) => r.hasLog).length} logged day(s)</span></div></div>;
}
function HistoryTable({ rows }: { rows: HistoryRow[] }) { return <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead><tr className="border-b text-slate-500"><th className="py-3">Day</th><th>Date</th><th>Score</th><th>Pillar wins</th><th>What slipped</th><th>Logged</th></tr></thead><tbody>{rows.length === 0 ? <tr><td colSpan={6} className="py-5 text-slate-500">No saved history yet. Log water, steps, or a prayer and this table will fill in.</td></tr> : rows.slice().reverse().map((row) => <tr key={row.date} className="border-b border-slate-100"><td className="py-3 font-black">{row.day}</td><td>{row.date}</td><td>{Number(row.daily || 0).toFixed(3)}</td><td>{topPillars(row.points)}</td><td>{row.reflection?.slipped || "—"}</td><td>Cal {row.totals.calories || 0} • Water {row.totals.water || 0} • Steps {row.totals.steps || 0}</td></tr>)}</tbody></table></div>; }
