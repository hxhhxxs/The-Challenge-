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
  if (day <= 2) return { label: "Start strong", expected, color: "bg-emerald-100 text-emerald-900" };
  if (currentScore >= expected + 5) return { label: "Ahead", expected, color: "bg-emerald-100 text-emerald-900" };
  if (currentScore >= expected - 5) return { label: "On track", expected, color: "bg-blue-100 text-blue-900" };
  if (currentScore >= expected - 15) return { label: "Behind", expected, color: "bg-amber-100 text-amber-900" };
  return { label: "Needs focus", expected, color: "bg-red-100 text-red-900" };
}
function sumEntries(entries?: Array<{ amount?: number }>) { return (entries || []).reduce((total, entry) => total + (Number(entry.amount) || 0), 0); }
function totalsFromCheckin(checkin: any) { const savedTotals = checkin.computedPoints?.totals || checkin.computed_points?.totals; if (savedTotals) return savedTotals; const entries = checkin.entries || {}; return { calories: sumEntries(entries.calories), water: sumEntries(entries.water), steps: sumEntries(entries.steps), exercise: sumEntries(entries.exercise) }; }
function normalizeLog(row: any) { const computed = row.computed_points || row.computedPoints || {}; return [row.date, { ...row, computedPoints: computed, totals: totalsFromCheckin({ ...row, computedPoints: computed }) }]; }

export default function ProgressPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<Record<string, any> | null>(null);
  const [userScore, setUserScore] = useState<number | null>(null);
  const [userPillars, setUserPillars] = useState<Record<string, number> | null>(null);
  const [dailyLogs, setDailyLogs] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) { router.push("/login"); return; }
      const record = await ensureUserRecord(data.user);
      const loadedDraft = (record.onboarding_draft || {}) as Record<string, any>;
      setDraft(loadedDraft);
      setUserScore(Number((record as any).current_score ?? loadedDraft.current_score ?? 0));
      setUserPillars(((record as any).pillar_scores || loadedDraft.pillar_scores || {}) as Record<string, number>);
      const { data: rows, error } = await supabase.from("daily_logs").select("*").eq("user_id", data.user.id).order("date", { ascending: true });
      if (!error && rows && rows.length > 0) setDailyLogs(rows.map(normalizeLog));
      else setDailyLogs(Object.entries(loadedDraft.checkins || {}).sort(([a], [b]) => a.localeCompare(b)).map(([date, checkin]: any) => [date, { ...checkin, totals: totalsFromCheckin(checkin) }]) as any[]);
    }
    load();
  }, [router]);

  const checkins = useMemo(() => dailyLogs, [dailyLogs]);
  if (!draft) return <main className={pageBg}><section className={`${cardClass} mx-auto max-w-xl`}>Loading progress…</section><BottomNav /></main>;

  const stats = computePillarStats(userPillars || draft.pillar_scores || {});
  const currentScore = Number(userScore ?? draft.current_score ?? stats.totalScore ?? 0);
  const rank = getRankFromScore(stats.overallScore);
  const status = getProfileChallengeStatus(draft);
  const currentDay = status.status === "pre_challenge" ? 0 : status.dayNumber;
  const totalDays = status.totalDays;
  const pace = paceStatus(currentScore, Math.max(1, currentDay), totalDays);

  return (
    <main className={pageBg}>
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[2rem] bg-slate-950 p-6 text-white">
          <p className="text-sm font-bold text-emerald-300">My Progress</p>
          <div className="mt-3 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div><h1 className="text-5xl font-black">{currentScore.toFixed(1)} / 100</h1><p className="mt-2 text-slate-300">{status.status === "pre_challenge" ? "Challenge scheduled" : `Day ${currentDay} of ${totalDays}`} • Expected today: {pace.expected.toFixed(1)}</p></div>
            <span className={`w-fit rounded-full px-4 py-2 text-sm font-black ${pace.color}`}>{status.status === "pre_challenge" ? "Scheduled" : pace.label}</span>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className={cardClass}><p className="text-sm font-bold text-slate-500">Rank & title</p><p className="mt-1 text-3xl font-black">{stats.overallRank}</p><p className="mt-1 text-lg font-black text-emerald-700">{stats.title}</p><p className="mt-1 text-sm font-bold text-slate-500">Next: {rank.nextRank}</p></div>
          <Link href="/leaderboard" className={`${cardClass} block transition hover:-translate-y-1 hover:shadow-2xl`}><p className="text-sm font-bold text-slate-500">Leaderboard</p><p className="mt-1 text-3xl font-black">Compete in good</p><p className="mt-1 text-sm font-bold text-emerald-700">Open leaderboard →</p></Link>
        </section>

        <section className={cardClass}>
          <p className="text-sm font-black text-emerald-700">5 Pillars</p>
          <h2 className="text-3xl font-black">Your character sheet</h2>
          <div className="mt-6 space-y-4">{stats.pillars.map((pillar) => <div key={pillar.key} className="rounded-2xl bg-slate-50 p-4"><div className="flex items-center justify-between gap-4"><div><p className="text-sm font-black text-emerald-700">{pillar.arabic}</p><h3 className="text-xl font-black">{pillar.name} — {pillar.meaning}</h3><p className="text-sm text-slate-600">{pillar.description}</p></div><div className="text-right"><p className="font-black">{pillar.score.toFixed(1)}/100</p><p className="text-xs font-bold text-slate-500">{pillar.rank}</p></div></div><div className="mt-3 h-3 rounded-full bg-white"><div className="h-3 rounded-full bg-emerald-500" style={{ width: `${Math.min(100, pillar.score)}%` }} /></div></div>)}</div>
        </section>

        <section className={cardClass}>
          <h2 className="text-2xl font-black">Recent saved activity</h2>
          {checkins.length === 0 ? <p className="mt-2 text-sm text-slate-600">No check-ins yet. Log water, steps, Qur'an, salah, or reflection to see points move.</p> : <div className="mt-4 space-y-3">{checkins.slice(-7).reverse().map(([date, checkin]: any) => { const totals = checkin.totals || totalsFromCheckin(checkin); return <div key={date} className="flex flex-col justify-between gap-2 rounded-2xl bg-slate-50 p-4 md:flex-row md:items-center"><div><p className="font-black text-slate-950">{date}</p><p className="text-sm text-slate-600">Calories: {totals.calories || 0} • Water: {totals.water || 0} • Steps: {totals.steps || 0}</p></div><span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-800">{Number(checkin.computedPoints?.total || 0).toFixed(1)} pts</span></div>; })}</div>}
        </section>
      </div>
      <BottomNav />
    </main>
  );
}
