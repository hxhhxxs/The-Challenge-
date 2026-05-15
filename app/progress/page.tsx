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

function paceStatus(currentScore: number, day: number, totalDays: number) {
  const expected = (day / Math.max(1, totalDays)) * 100;
  if (currentScore >= expected + 5) return { label: "Ahead", expected, color: "bg-emerald-100 text-emerald-900" };
  if (currentScore >= expected - 5) return { label: "On track", expected, color: "bg-emerald-100 text-emerald-900" };
  if (currentScore >= expected - 15) return { label: "Behind", expected, color: "bg-amber-100 text-amber-900" };
  return { label: "Needs focus", expected, color: "bg-red-100 text-red-900" };
}
function sumEntries(entries?: Array<{ amount?: number }>) { return (entries || []).reduce((total, entry) => total + (Number(entry.amount) || 0), 0); }
function totalsFromCheckin(checkin: any) { const savedTotals = checkin.computedPoints?.totals || checkin.computed_points?.totals; if (savedTotals) return savedTotals; const entries = checkin.entries || {}; return { calories: sumEntries(entries.calories), water: sumEntries(entries.water), steps: sumEntries(entries.steps), exercise: sumEntries(entries.exercise) }; }
function normalizeLog(row: any) { const computed = row.computed_points || row.computedPoints || {}; return [row.date, { ...row, computedPoints: computed, totals: totalsFromCheckin({ ...row, computedPoints: computed }) }]; }
function getDayNumber(startDate: string, date: string) { const start = new Date(`${String(startDate).slice(0, 10)}T00:00:00`); const day = new Date(`${String(date).slice(0, 10)}T00:00:00`); return Math.max(1, Math.floor((day.getTime() - start.getTime()) / 86400000) + 1); }
function topPillars(points: any) { const rows = [["Body", points?.body || 0], ["Faith", points?.quran || 0], ["Discipline", points?.discipline || 0], ["Mission", points?.personal || 0], ["Character", points?.character || 0]].sort((a: any, b: any) => b[1] - a[1]).filter((x: any) => x[1] > 0); return rows.slice(0, 2).map((x: any) => x[0]).join(", ") || "—"; }

export default function ProgressPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<Record<string, any> | null>(null);
  const [userScore, setUserScore] = useState<number | null>(null);
  const [userPillars, setUserPillars] = useState<Record<string, number> | null>(null);
  const [dailyLogs, setDailyLogs] = useState<any[]>([]);

  useEffect(() => { async function load() { const supabase = createSupabaseBrowserClient(); const { data } = await supabase.auth.getUser(); if (!data.user) { router.push("/login"); return; } const record = await ensureUserRecord(data.user); const loadedDraft = (record.onboarding_draft || {}) as Record<string, any>; setDraft(loadedDraft); setUserScore(Number((record as any).current_score ?? loadedDraft.current_score ?? 0)); setUserPillars(((record as any).pillar_scores || loadedDraft.pillar_scores || {}) as Record<string, number>); const { data: rows, error } = await supabase.from("daily_logs").select("*").eq("user_id", data.user.id).order("date", { ascending: true }); if (!error && rows && rows.length > 0) setDailyLogs(rows.map(normalizeLog)); else setDailyLogs(Object.entries(loadedDraft.checkins || {}).sort(([a], [b]) => a.localeCompare(b)).map(([date, checkin]: any) => [date, { ...checkin, totals: totalsFromCheckin(checkin) }]) as any[]); } load(); }, [router]);

  const checkins = useMemo(() => dailyLogs, [dailyLogs]);
  if (!draft) return <main className={pageBg}><section className={`${cardClass} mx-auto max-w-xl`}>Loading progress…</section><BottomNav /></main>;

  const stats = computePillarStats(userPillars || draft.pillar_scores || {});
  const currentScore = Number(userScore ?? draft.current_score ?? stats.totalScore ?? 0);
  const rank = getRankFromScore(stats.overallScore);
  const status = getProfileChallengeStatus(draft);
  const currentDay = status.status === "pre_challenge" ? 0 : status.dayNumber;
  const totalDays = status.totalDays;
  const pace = paceStatus(currentScore, Math.max(1, currentDay), totalDays);
  const history = buildHistory(checkins, draft.startDate, totalDays);

  return <main className={pageBg}><div className="mx-auto max-w-6xl space-y-6"><section className="rounded-[2rem] bg-slate-950 p-6 text-white"><p className="text-sm font-bold text-emerald-300">My Progress</p><div className="mt-3 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><h1 className="text-5xl font-black">{currentScore.toFixed(1)} / 100</h1><p className="mt-2 text-slate-300">{status.status === "pre_challenge" ? "Challenge scheduled" : `Day ${currentDay} of ${totalDays}`} • Expected today: {pace.expected.toFixed(1)}</p></div><span className={`w-fit rounded-full px-4 py-2 text-sm font-black ${pace.color}`}>{status.status === "pre_challenge" ? "Scheduled" : pace.label}</span></div></section>
    <section className={cardClass}><p className="text-sm font-black text-emerald-700">Score over time</p><h2 className="text-3xl font-black">Actual vs expected pace</h2><ScoreChart data={history} /></section>
    <section className={cardClass}><p className="text-sm font-black text-emerald-700">5 Pillars</p><h2 className="text-3xl font-black">Where your growth is happening</h2><div className="mt-6 space-y-4">{stats.pillars.map((pillar) => <div key={pillar.key}><div className="flex justify-between text-sm font-black"><span>{pillar.name}</span><span>{pillar.score.toFixed(1)}/100</span></div><div className="mt-2 h-4 rounded-full bg-slate-100"><div className="h-4 rounded-full bg-emerald-500" style={{ width: `${Math.min(100, pillar.score)}%` }} /></div></div>)}</div></section>
    <section className={cardClass}><p className="text-sm font-black text-emerald-700">Consistency</p><h2 className="text-3xl font-black">Daily heatmap</h2><Heatmap data={history} /></section>
    <section className={cardClass}><div className="flex flex-col justify-between gap-3 md:flex-row md:items-end"><div><p className="text-sm font-black text-emerald-700">Daily history</p><h2 className="text-3xl font-black">What changed each day</h2></div><Link href="/leaderboard" className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white">Compete in good →</Link></div><HistoryTable rows={history} /></section>
    <section className="grid gap-4 md:grid-cols-2"><div className={cardClass}><p className="text-sm font-bold text-slate-500">Rank & title</p><p className="mt-1 text-3xl font-black">{stats.overallRank}</p><p className="mt-1 text-lg font-black text-emerald-700">{currentScore > 0 ? stats.title : "Just Starting"}</p><p className="mt-1 text-sm font-bold text-slate-500">Next: {rank.nextRank}</p></div><Link href="/check-in" className={`${cardClass} block transition hover:-translate-y-1 hover:shadow-2xl`}><p className="text-sm font-bold text-slate-500">Next action</p><p className="mt-1 text-3xl font-black">Log today</p><p className="mt-1 text-sm font-bold text-emerald-700">Open Log →</p></Link></section>
  </div><BottomNav /></main>;
}

function buildHistory(checkins: any[], startDate: string, totalDays: number) { let cumulative = 0; return checkins.map(([date, checkin]: any) => { const points = checkin.computedPoints || {}; const total = Number(points.total || 0); cumulative += total; const day = getDayNumber(startDate, date); return { day, date, daily: total, actual: Math.round(cumulative * 10) / 10, expected: Math.round((day / Math.max(1, totalDays)) * 100 * 10) / 10, points, totals: checkin.totals || totalsFromCheckin(checkin), reflection: checkin.reflection || {} }; }); }
function ScoreChart({ data }: any) { const points = data.length ? data : [{ day: 1, actual: 0, expected: 1 }]; const maxDay = Math.max(...points.map((p: any) => p.day), 1); const actualPath = points.map((p: any, i: number) => `${i ? "L" : "M"}${(p.day / maxDay) * 100},${100 - Math.min(100, p.actual)}`).join(" "); const expectedPath = points.map((p: any, i: number) => `${i ? "L" : "M"}${(p.day / maxDay) * 100},${100 - Math.min(100, p.expected)}`).join(" "); return <div className="mt-6 rounded-2xl bg-slate-50 p-4"><svg viewBox="0 0 100 100" className="h-64 w-full overflow-visible"><path d={expectedPath} fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 4" /><path d={actualPath} fill="none" stroke="#16a34a" strokeWidth="2.5" /><line x1="0" x2="100" y1="100" y2="100" stroke="#cbd5e1" /></svg><div className="mt-2 flex justify-between text-xs font-bold text-slate-500"><span>Day 1</span><span>Actual score vs expected pace</span><span>Latest</span></div></div>; }
function Heatmap({ data }: any) { const days = Array.from({ length: Math.max(84, data.length || 1) }, (_, i) => data[i]); return <div className="mt-5 grid grid-cols-14 gap-1 md:grid-cols-21">{days.map((row: any, i) => { const score = Number(row?.daily || 0); const bg = score <= 0 ? "bg-slate-100" : score < 0.5 ? "bg-emerald-100" : score < 1 ? "bg-emerald-300" : "bg-emerald-600"; return <div key={i} title={row ? `${row.date}: ${score.toFixed(1)} pts` : "No log"} className={`h-4 rounded ${bg}`} />; })}</div>; }
function HistoryTable({ rows }: any) { return <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead><tr className="border-b text-slate-500"><th className="py-3">Day</th><th>Date</th><th>Score</th><th>Pillar wins</th><th>What slipped</th><th>Logged</th></tr></thead><tbody>{rows.length === 0 ? <tr><td colSpan={6} className="py-5 text-slate-500">No saved history yet.</td></tr> : rows.slice().reverse().map((row: any) => <tr key={row.date} className="border-b border-slate-100"><td className="py-3 font-black">{row.day}</td><td>{row.date}</td><td>{Number(row.daily || 0).toFixed(1)}</td><td>{topPillars(row.points)}</td><td>{row.reflection?.slipped || "—"}</td><td>Cal {row.totals.calories || 0} • Water {row.totals.water || 0} • Steps {row.totals.steps || 0}</td></tr>)}</tbody></table></div>; }
