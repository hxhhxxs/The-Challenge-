"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureUserRecord } from "@/lib/supabase/ensure-user-record";
import { cardClass, dayOfChallenge, daysBetween, pageBg } from "@/lib/challenge-ui";
import { computePillarStats } from "@/lib/pillars";
import { aggregateLogsToScores, emptyPillarScores, scoreNumber, syncScoresFromDailyLogs, type PillarScores } from "@/lib/score-sync";

type Row = { computed_points?: any };
const scoreText = (n: number) => n > 0 && n < 1 ? n.toFixed(3) : n.toFixed(1);
const clean = (v: unknown) => String(v || "").trim();
function initials(name: string) { return name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "C"; }
function fallbackPillars(record: any, draft: Record<string, any>): PillarScores {
  const p = record?.pillar_scores || draft?.pillar_scores || emptyPillarScores();
  return { quwwah: scoreNumber(p.quwwah), imaan: scoreNumber(p.imaan), sabr: scoreNumber(p.sabr), niyyah: scoreNumber(p.niyyah), adab: scoreNumber(p.adab) };
}
function PillarCard({ label, arabic, value, desc }: { label: string; arabic: string; value: number; desc: string }) { return <div className="rounded-2xl bg-slate-50 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-wide text-emerald-700">{arabic}</p><h3 className="mt-1 text-lg font-black text-slate-950">{label}</h3></div><p className="rounded-full bg-white px-3 py-1 text-sm font-black text-slate-950">{scoreText(value)} pts</p></div><p className="mt-2 text-xs font-bold leading-5 text-slate-500">{desc}</p></div>; }

export default function ProfileScoreSafe() {
  const router = useRouter();
  const [draft, setDraft] = useState<Record<string, any> | null>(null);
  const [score, setScore] = useState(0);
  const [pillars, setPillars] = useState<PillarScores>(emptyPillarScores());
  const [source, setSource] = useState("Loading saved scores");

  useEffect(() => { async function load() { const supabase = createSupabaseBrowserClient(); const { data } = await supabase.auth.getUser(); if (!data.user) { router.push("/login"); return; } const record = await ensureUserRecord(data.user); const d = (record.onboarding_draft || {}) as Record<string, any>; const { data: rows, error } = await supabase.from("daily_logs").select("computed_points").eq("user_id", record.id); if (!error && rows && rows.length > 0) { const agg = aggregateLogsToScores(rows as Row[]); setPillars(agg.pillar_scores); setScore(agg.current_score); setSource("Synced from saved daily logs"); await syncScoresFromDailyLogs(supabase, record.id, d); setDraft({ ...d, current_score: agg.current_score, pillar_scores: agg.pillar_scores }); return; } const fp = fallbackPillars(record, d); const fallbackScore = scoreNumber((record as any).current_score || d.current_score || fp.quwwah + fp.imaan + fp.sabr + fp.niyyah + fp.adab); setPillars(fp); setScore(fallbackScore); setSource("Saved profile totals"); setDraft(d); } load(); }, [router]);

  if (!draft) return <main className={pageBg}><section className={`${cardClass} mx-auto max-w-xl`}>Loading profile…</section><BottomNav /></main>;
  const name = draft.name || "Challenger";
  const stats = computePillarStats(pillars);
  const isStarter = score < 5;
  const title = isStarter ? "Mubtadi' — Just Starting" : stats.title;
  const titleArabic = isStarter ? "مُبتدئ" : stats.titleArabic;
  const currentDay = Math.min(daysBetween(draft.startDate, draft.endDate) || 1, dayOfChallenge(draft.startDate));
  const totalDays = daysBetween(draft.startDate, draft.endDate) || 1;
  const niyyah = draft.niyyah || {};
  const whyItems = [
    ["Why", clean(niyyah.why)],
    ["90-day vision", clean(niyyah.vision)],
    ["What stopped me before", clean(niyyah.stoppedBefore)],
    ["What scared me", clean(niyyah.fear)],
  ].filter((item) => item[1]);

  return <main className={pageBg}><div className="mx-auto max-w-6xl space-y-6"><section className="rounded-[2rem] bg-slate-950 p-6 text-white"><div className="flex flex-col items-center gap-5 text-center"><div className="flex h-28 w-28 items-center justify-center rounded-[2rem] bg-gradient-to-br from-emerald-300 via-white to-amber-200 text-4xl font-black text-slate-950 shadow-2xl">{initials(name)}</div><div><p className="text-sm font-bold text-emerald-300">Character Sheet</p><h1 className="mt-1 text-4xl font-black">{name}</h1><p className="mt-2 text-xl font-black text-emerald-200">{title}</p><p className="mt-1 text-lg font-black" dir="rtl">{titleArabic}</p><p className="mt-2 text-sm font-bold text-slate-300">{isStarter ? "Reach 5 points to earn your first real title." : `Title earned with ${scoreText(score)} total points.`}</p><p className="mt-2 text-sm font-bold text-slate-300">Challenge Day {currentDay} of {totalDays} • {scoreText(score)} / 100</p></div></div></section>
    <section className={cardClass}><div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm font-black text-emerald-700">Point Categories</p><h2 className="text-3xl font-black">Where your points are going</h2><p className="mt-2 text-sm text-slate-600">These are your cumulative points by category. They are rebuilt from saved daily logs so Profile matches Log, Progress, Dashboard, and Leaderboard.</p><p className="mt-1 text-xs font-black uppercase tracking-wide text-slate-400">{source}</p></div><Link href="/check-in" className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white">Add points</Link></div><div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-5"><PillarCard label="Quwwah" arabic="القوة" value={pillars.quwwah} desc="Body, calories, water, steps, exercise, and sleep." /><PillarCard label="Imaan" arabic="الإيمان" value={pillars.imaan} desc="Salah, Qur'an memorization, review, dhikr, and worship." /><PillarCard label="Sabr" arabic="الصبر" value={pillars.sabr} desc="Money discipline, screen discipline, and limits." /><PillarCard label="Niyyah" arabic="النية" value={pillars.niyyah} desc="Personal goals, daily missions, and intention-based work." /><PillarCard label="Adab" arabic="الأدب" value={pillars.adab} desc="Reflection, mood check-ins, character tasks, and photo proof." /></div></section>
    <section className={cardClass}><h2 className="text-3xl font-black">The 5 Pillars</h2><p className="mt-2 text-sm text-slate-600">Same values, shown as growth bars.</p><div className="mt-6 space-y-4">{stats.pillars.map((p) => <div key={p.key} className="rounded-2xl bg-slate-50 p-4"><div className="flex justify-between gap-4"><div><p className="text-sm font-black text-emerald-700">{p.arabic}</p><h3 className="text-xl font-black">{p.name} — {p.meaning}</h3><p className="mt-1 text-sm text-slate-600">{p.description}</p></div><div className="text-right"><p className="text-sm font-black text-slate-950">{p.rank}</p><p className="text-xs font-bold text-slate-500">{scoreText(p.score)} pts</p></div></div><div className="mt-3 h-3 rounded-full bg-white"><div className="h-3 rounded-full bg-emerald-500" style={{ width: `${Math.min(100, p.score)}%` }} /></div></div>)}</div></section>
    <section className={cardClass}><h2 className="text-3xl font-black">My Why</h2>{whyItems.length === 0 ? <p className="mt-3 rounded-2xl bg-amber-100 p-4 font-bold text-amber-950">No Niyyah written yet.</p> : <details className="mt-4 rounded-2xl bg-slate-50 p-4"><summary className="cursor-pointer font-black">Open My Why</summary><div className="mt-4 grid gap-4 md:grid-cols-2">{whyItems.map(([label, text]) => <div key={label} className="rounded-2xl bg-white p-4"><p className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-sm font-bold leading-6 text-slate-950">{text}</p></div>)}</div></details>}</section>
    <section className="grid gap-4 md:grid-cols-3"><div className={cardClass}><p className="text-sm font-bold text-slate-500">Challenge Score</p><p className="mt-1 text-3xl font-black">{scoreText(score)} / 100</p></div><div className={cardClass}><p className="text-sm font-bold text-slate-500">Strongest Pillar</p><p className="mt-1 text-3xl font-black">{isStarter ? "Not earned yet" : stats.strongest.name}</p></div><div className={cardClass}><p className="text-sm font-bold text-slate-500">Current Title</p><p className="mt-1 text-2xl font-black">{title}</p></div></section>
    <div className="flex flex-wrap gap-3"><Link href="/check-in" className="rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Log today</Link><Link href="/progress" className="rounded-full bg-emerald-100 px-5 py-3 font-black text-emerald-950">Progress</Link><Link href="/ranks" className="rounded-full bg-white px-5 py-3 font-black text-slate-950">View rank ladder</Link></div></div><BottomNav /></main>;
}
