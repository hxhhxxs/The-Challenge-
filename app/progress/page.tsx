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

type Pillars = { quwwah: number; imaan: number; sabr: number; niyyah: number; adab: number };
type Row = { day: number; date: string; daily: number; actual: number; expected: number; points: any; totals: any; reflection: any; hasLog: boolean };
const empty = (): Pillars => ({ quwwah: 0, imaan: 0, sabr: 0, niyyah: 0, adab: 0 });
const n = (v: unknown) => { const x = Number(v); return Number.isFinite(x) ? x : 0; };
const r3 = (v: number) => Math.round(v * 1000) / 1000;
const r1 = (v: number) => Math.round(v * 10) / 10;
const total = (p: Pillars) => r3(p.quwwah + p.imaan + p.sabr + p.niyyah + p.adab);
const norm = (p: any): Pillars => ({ quwwah: r3(n(p?.quwwah)), imaan: r3(n(p?.imaan)), sabr: r3(n(p?.sabr)), niyyah: r3(n(p?.niyyah)), adab: r3(n(p?.adab)) });
const sumAmount = (a?: any[]) => (a || []).reduce((s, e) => s + n(e?.amount), 0);
const sumPoints = (a?: any[]) => (a || []).reduce((s, e) => s + n(e?.points), 0);
function key(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; }
function addDays(start: string, offset: number) { const d = new Date(`${String(start).slice(0, 10)}T00:00:00`); d.setDate(d.getDate() + offset); return key(d); }
function dayNum(start: string, date: string) { const a = new Date(`${String(start).slice(0, 10)}T00:00:00`); const b = new Date(`${String(date).slice(0, 10)}T00:00:00`); return Math.max(1, Math.floor((b.getTime() - a.getTime()) / 86400000) + 1); }
function totalsFrom(log: any) { const saved = log?.computedPoints?.totals || log?.computed_points?.totals || log?.totals; if (saved) return saved; const e = log?.entries || {}; return { calories: sumAmount(e.calories), water: sumAmount(e.water), steps: sumAmount(e.steps), exercise: sumAmount(e.exercise), quranMemorized: sumAmount(e.quranMemorized), quranReviewed: sumAmount(e.quranReviewed), money: sumAmount(e.money), screen: sumAmount(e.screen) }; }
function pointsFrom(log: any) { const c = log?.computedPoints || log?.computed_points || {}; if (n(c.total) > 0) return c; const e = log?.entries || {}; const body = sumPoints(e.calories) + sumPoints(e.water) + sumPoints(e.steps) + sumPoints(e.exercise); const quran = sumPoints(e.quranMemorized) + sumPoints(e.quranReviewed); const discipline = sumPoints(e.money) + sumPoints(e.screen); const personal = log?.goals ? (log.goals.goal1 === "done" ? 0.05 : log.goals.goal1 === "partial" ? 0.025 : 0) + (log.goals.goal2 === "done" ? 0.05 : log.goals.goal2 === "partial" ? 0.025 : 0) : 0; const character = log?.reflection?.mood || log?.reflection?.wentWell || log?.reflection?.slipped ? 0.01 : 0; return { body: r3(body), quran: r3(quran), discipline: r3(discipline), personal: r3(personal), character: r3(character), total: r3(body + quran + discipline + personal + character) }; }
function addToPillars(acc: Pillars, log: any) { const p = pointsFrom(log); acc.quwwah += n(p.body); acc.imaan += n(p.quran); acc.sabr += n(p.discipline); acc.niyyah += n(p.personal); acc.adab += n(p.character); return acc; }
function pillarsFromLogs(logs: any[]) { return norm(logs.reduce<Pillars>((acc, log) => addToPillars(acc, log), empty())); }
function draftLogs(draft: any): Array<[string, any]> { return Object.entries(draft?.checkins || {}).map(([date, log]: any) => [date, { ...log, date, totals: totalsFrom(log) }]).sort(([a], [b]) => a.localeCompare(b)); }
function dbLogs(rows: any[]): Array<[string, any]> { return (rows || []).map((row) => [String(row.date), { ...row, computedPoints: row.computed_points || row.computedPoints || {}, totals: totalsFrom(row) }] as [string, any]); }
function mergeLogs(a: Array<[string, any]>, b: Array<[string, any]>) { const map = new Map<string, any>(); for (const [date, log] of a) map.set(date, log); for (const [date, log] of b) { const old = map.get(date); map.set(date, n(pointsFrom(log).total) >= n(pointsFrom(old).total) ? log : old); } return Array.from(map.entries()).sort(([x], [y]) => x.localeCompare(y)); }
function pace(score: number, day: number, days: number) { const expected = (day / Math.max(1, days)) * 100; const ratio = expected ? score / expected : 1; if (day <= 2) return { label: "Just getting started", expected, color: "bg-slate-100 text-slate-900" }; if (ratio >= 0.9) return { label: "On track", expected, color: "bg-emerald-100 text-emerald-900" }; if (ratio >= 0.6) return { label: "Catching up", expected, color: "bg-amber-100 text-amber-900" }; if (ratio >= 0.3) return { label: "Behind", expected, color: "bg-orange-100 text-orange-900" }; return { label: "Falling behind — recover today", expected, color: "bg-red-100 text-red-900" }; }
function topPillars(points: any) { const rows = [["Body", n(points?.body)], ["Faith", n(points?.quran)], ["Discipline", n(points?.discipline)], ["Mission", n(points?.personal)], ["Character", n(points?.character)]].sort((a: any, b: any) => b[1] - a[1]).filter((x: any) => x[1] > 0); return rows.slice(0, 2).map((x: any) => x[0]).join(", ") || "—"; }
const fmt = (v: number) => Math.round(n(v)).toLocaleString();

export default function ProgressPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<any>(null);
  const [pillars, setPillars] = useState<Pillars>(empty());
  const [score, setScore] = useState(0);
  const [logs, setLogs] = useState<Array<[string, any]>>([]);

  useEffect(() => { async function load() {
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user) { router.push("/login"); return; }
    const record = await ensureUserRecord(data.user);
    const d = (record.onboarding_draft || {}) as any;
    const { data: rows } = await supabase.from("daily_logs").select("*").eq("user_id", record.id).order("date", { ascending: true });
    const merged = mergeLogs(draftLogs(d), dbLogs(rows || []));
    const fromEntries = pillarsFromLogs(merged.map(([, log]) => log));
    const saved = norm((record as any).pillar_scores || d.pillar_scores || {});
    const finalPillars = total(fromEntries) > 0 ? fromEntries : saved;
    const finalScore = Math.max(total(finalPillars), n((record as any).current_score), n(d.current_score));
    if (finalScore > n((record as any).current_score) || total(saved) === 0) await supabase.from("users").update({ current_score: finalScore, pillar_scores: finalPillars }).eq("id", record.id);
    setDraft(d); setLogs(merged); setPillars(finalPillars); setScore(finalScore);
  } load(); }, [router]);

  const history = useMemo(() => buildHistory(logs, draft?.startDate || key(new Date()), draft ? getProfileChallengeStatus(draft).totalDays || 90 : 90, Math.max(1, draft ? getProfileChallengeStatus(draft).dayNumber || 1 : 1)), [logs, draft]);
  if (!draft) return <main className={pageBg}><section className={`${cardClass} mx-auto max-w-xl`}>Loading progress…</section><BottomNav /></main>;

  const status = getProfileChallengeStatus(draft);
  const currentDay = status.status === "pre_challenge" ? 0 : status.dayNumber;
  const totalDays = status.totalDays || 90;
  const stats = computePillarStats(pillars);
  const rank = getRankFromScore(stats.overallScore);
  const statusPace = pace(score, Math.max(1, currentDay), totalDays);

  return <main className={pageBg}><div className="mx-auto max-w-6xl space-y-6"><section className="rounded-[2rem] bg-slate-950 p-6 text-white"><p className="text-sm font-bold text-emerald-300">My Progress</p><div className="mt-3 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><h1 className="text-5xl font-black">{score.toFixed(1)} / 100</h1><p className="mt-2 text-slate-300">{status.status === "pre_challenge" ? "Challenge scheduled" : `Day ${currentDay} of ${totalDays}`} • Expected today: {statusPace.expected.toFixed(1)}</p></div><span className={`w-fit rounded-full px-4 py-2 text-sm font-black ${status.status === "pre_challenge" ? "bg-slate-100 text-slate-900" : statusPace.color}`}>{status.status === "pre_challenge" ? "Scheduled" : statusPace.label}</span></div></section>
    <section className={cardClass}><p className="text-sm font-black text-emerald-700">Score over time</p><h2 className="text-3xl font-black">Actual vs expected pace</h2><ScoreChart data={history} totalDays={totalDays} /></section>
    <section className={cardClass}><p className="text-sm font-black text-emerald-700">5 Pillars — Challenge total</p><h2 className="text-3xl font-black">Cumulative pillar points</h2><p className="mt-1 text-sm font-bold text-slate-500">These are rebuilt from saved entries, not today's Log-page percentages.</p><div className="mt-6 space-y-4">{stats.pillars.map((p) => <div key={p.key}><div className="flex justify-between text-sm font-black"><span>{p.name}</span><span>{p.score.toFixed(3)} pts</span></div><div className="mt-2 h-4 rounded-full bg-slate-100"><div className="h-4 rounded-full bg-emerald-500" style={{ width: `${Math.min(100, p.score)}%` }} /></div></div>)}</div></section>
    <section className={cardClass}><p className="text-sm font-black text-emerald-700">Consistency</p><h2 className="text-3xl font-black">Daily heatmap</h2><Heatmap data={history} totalDays={totalDays} /></section>
    <section className={cardClass}><div className="flex flex-col justify-between gap-3 md:flex-row md:items-end"><div><p className="text-sm font-black text-emerald-700">Daily history</p><h2 className="text-3xl font-black">Every day from Day 1 to today</h2></div><Link href="/leaderboard" className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white">Compete in good →</Link></div><HistoryTable rows={history} /></section>
    <section className="grid gap-4 md:grid-cols-2"><div className={cardClass}><p className="text-sm font-bold text-slate-500">Rank & title</p><p className="mt-1 text-3xl font-black">{stats.overallRank}</p><p className="mt-1 text-lg font-black text-emerald-700">{score > 0 ? stats.title : "Just Starting"}</p><p className="mt-1 text-sm font-bold text-slate-500">Next: {rank.nextRank}</p></div><Link href="/check-in" className={`${cardClass} block`}><p className="text-sm font-bold text-slate-500">Next action</p><p className="mt-1 text-3xl font-black">Log today</p><p className="mt-1 text-sm font-bold text-emerald-700">Open Log →</p></Link></section>
  </div><BottomNav /></main>;
}

function buildHistory(checkins: Array<[string, any]>, startDate: string, totalDays: number, currentDay: number): Row[] { const byDate = new Map(checkins); const rows: Row[] = []; let cumulative = 0; const last = Math.max(currentDay, ...checkins.map(([date]) => dayNum(startDate, date)), 1); for (let day = 1; day <= Math.min(totalDays, last); day++) { const date = addDays(startDate, day - 1); const log = byDate.get(date); const points = log ? pointsFrom(log) : {}; const daily = n(points.total); cumulative += daily; rows.push({ day, date, daily, actual: r1(cumulative), expected: r1((day / Math.max(1, totalDays)) * 100), points, totals: log ? totalsFrom(log) : {}, reflection: log?.reflection || {}, hasLog: Boolean(log) }); } return rows; }
function ScoreChart({ data, totalDays }: { data: Row[]; totalDays: number }) { const points = data.length ? data : [{ day: 1, actual: 0, expected: r1(100 / Math.max(1, totalDays)), daily: 0, date: "", points: {}, totals: {}, reflection: {}, hasLog: false }]; const width = 760, height = 260, pad = 28, maxDay = Math.max(totalDays, points[points.length - 1]?.day || 1, 1); const x = (d: number) => pad + ((d - 1) / Math.max(1, maxDay - 1)) * (width - pad * 2); const y = (s: number) => height - pad - (Math.max(0, Math.min(100, s)) / 100) * (height - pad * 2); const actualPath = points.map((p, i) => `${i ? "L" : "M"}${x(p.day)},${y(p.actual)}`).join(" "); return <div className="mt-6 rounded-2xl bg-slate-50 p-4"><svg viewBox={`0 0 ${width} ${height}`} className="h-72 w-full overflow-visible"><line x1={pad} x2={width - pad} y1={height - pad} y2={height - pad} stroke="currentColor" opacity="0.18" /><line x1={pad} x2={pad} y1={pad} y2={height - pad} stroke="currentColor" opacity="0.18" /><path d={`M${x(1)},${y(100 / maxDay)} L${x(maxDay)},${y(100)}`} fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="8 8" opacity="0.35" /><path d={actualPath} fill="none" stroke="var(--theme-accent)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />{points.filter((p) => p.hasLog).map((p) => <circle key={p.date} cx={x(p.day)} cy={y(p.actual)} r="5" fill="var(--theme-accent)" />)}</svg></div>; }
function Heatmap({ data, totalDays }: { data: Row[]; totalDays: number }) { const byDay = new Map(data.map((row) => [row.day, row])); const days = Array.from({ length: Math.max(84, Math.min(totalDays, Math.max(data.length, 1))) }, (_, i) => byDay.get(i + 1)); return <div className="mt-5 rounded-2xl bg-slate-50 p-4"><div className="grid gap-1" style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}>{days.map((row, i) => { const s = n(row?.daily); const style = !row?.hasLog ? { backgroundColor: "rgba(148,163,184,0.25)" } : s < 0.25 ? { backgroundColor: "color-mix(in srgb, var(--theme-accent) 25%, white)" } : s < 0.75 ? { backgroundColor: "color-mix(in srgb, var(--theme-accent) 60%, white)" } : { backgroundColor: "var(--theme-accent)" }; return <div key={i} title={row ? `${row.date}: ${s.toFixed(3)} pts` : "No log"} className="aspect-square rounded-md" style={style} />; })}</div></div>; }
function HistoryTable({ rows }: { rows: Row[] }) { return <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead><tr className="border-b text-slate-500"><th className="py-3">Day</th><th>Date</th><th>Score</th><th>Pillar wins</th><th>What slipped</th><th>Logged</th></tr></thead><tbody>{rows.length === 0 ? <tr><td colSpan={6} className="py-5 text-slate-500">No saved history yet.</td></tr> : rows.slice().reverse().map((row) => <tr key={row.date} className={`border-b border-slate-100 ${row.hasLog ? "" : "text-slate-400"}`}><td className="py-3 font-black">{row.day}</td><td>{row.date}</td><td>{row.hasLog ? n(row.daily).toFixed(3) : "— not logged"}</td><td>{row.hasLog ? topPillars(row.points) : "—"}</td><td>{row.hasLog ? row.reflection?.slipped || "—" : "—"}</td><td>{row.hasLog ? `Cal ${fmt(row.totals.calories || 0)} • Water ${fmt(row.totals.water || 0)} • Steps ${fmt(row.totals.steps || 0)}` : "No check-in saved"}</td></tr>)}</tbody></table></div>; }
