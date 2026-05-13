"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cardClass, dayOfChallenge, daysBetween, pageBg } from "@/lib/challenge-ui";
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
  return { label: "Danger", expected, color: "bg-red-100 text-red-900" };
}

function normalizeLog(row: any) {
  const computed = row.computed_points || row.computedPoints || {};
  return [row.date, { ...row, computedPoints: computed }];
}

export default function ProgressPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<Record<string, any> | null>(null);
  const [dailyLogs, setDailyLogs] = useState<any[]>([]);
  const [sourceLabel, setSourceLabel] = useState("profile backup");

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
        return;
      }
      const record = await ensureUserRecord(data.user);
      const loadedDraft = (record.onboarding_draft || {}) as Record<string, any>;
      setDraft(loadedDraft);

      const { data: rows, error } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", data.user.id)
        .order("date", { ascending: true });

      if (!error && rows && rows.length > 0) {
        setDailyLogs(rows.map(normalizeLog));
        setSourceLabel("daily_logs");
      } else {
        setDailyLogs(Object.entries(loadedDraft.checkins || {}).sort(([a], [b]) => a.localeCompare(b)) as any[]);
        setSourceLabel("profile backup");
      }
    }
    load();
  }, [router]);

  const checkins = useMemo(() => dailyLogs, [dailyLogs]);

  if (!draft) return <main className={pageBg}><section className={`${cardClass} mx-auto max-w-xl`}>Loading progress…</section></main>;

  const stats = computePillarStats(draft.pillar_scores || {});
  const currentScore = Number(draft.current_score || stats.totalScore || 0);
  const rank = getRankFromScore(stats.overallScore);
  const currentDay = Math.min(daysBetween(draft.startDate, draft.endDate) || 1, dayOfChallenge(draft.startDate));
  const totalDays = daysBetween(draft.startDate, draft.endDate) || 1;
  const pace = paceStatus(currentScore, currentDay, totalDays);

  return (
    <main className={pageBg}>
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[2rem] bg-slate-950 p-6 text-white">
          <p className="text-sm font-bold text-emerald-300">Score / Progress</p>
          <h1 className="mt-1 text-4xl font-black">{currentScore.toFixed(1)} / 100</h1>
          <p className="mt-2 text-slate-300">Day {currentDay} of {totalDays} • Expected today: {pace.expected.toFixed(1)} / 100</p>
          <span className={`mt-4 inline-block rounded-full px-4 py-2 text-sm font-black ${pace.color}`}>{pace.label}</span>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className={cardClass}>
            <p className="text-sm font-bold text-slate-500">Current rank</p>
            <p className="mt-1 text-3xl font-black">{stats.overallRank}</p>
            <p className="mt-1 text-sm font-bold text-emerald-700">Next: {rank.nextRank}</p>
          </div>
          <div className={cardClass}>
            <p className="text-sm font-bold text-slate-500">Current title</p>
            <p className="mt-1 text-2xl font-black">{stats.title}</p>
            <p className="mt-1 text-sm font-bold text-emerald-700" dir="rtl">{stats.titleArabic}</p>
          </div>
          <div className={cardClass}>
            <p className="text-sm font-bold text-slate-500">Check-ins saved</p>
            <p className="mt-1 text-3xl font-black">{checkins.length}</p>
            <p className="mt-1 text-sm font-bold text-emerald-700">Source: {sourceLabel}</p>
          </div>
        </section>

        <section className={cardClass}>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-black text-emerald-700">5 Pillars breakdown</p>
              <h2 className="text-3xl font-black">Where your points are coming from</h2>
            </div>
            <Link href="/profile" className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white">Open Character Sheet</Link>
          </div>
          <div className="mt-6 space-y-4">
            {stats.pillars.map((pillar) => (
              <div key={pillar.key} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-black text-emerald-700">{pillar.arabic}</p>
                    <h3 className="text-xl font-black">{pillar.name} — {pillar.meaning}</h3>
                    <p className="text-sm text-slate-600">{pillar.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black">{pillar.score.toFixed(1)}/100</p>
                    <p className="text-xs font-bold text-slate-500">{pillar.rank}</p>
                  </div>
                </div>
                <div className="mt-3 h-3 rounded-full bg-white">
                  <div className="h-3 rounded-full bg-emerald-500" style={{ width: `${Math.min(100, pillar.score)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={cardClass}>
          <h2 className="text-2xl font-black">Recent saved check-ins</h2>
          {checkins.length === 0 ? (
            <p className="mt-2 text-sm text-slate-600">No check-ins yet. Log water, steps, Qur'an, salah, or reflection to see points move.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {checkins.slice(-7).reverse().map(([date, checkin]: any) => (
                <div key={date} className="flex flex-col justify-between gap-2 rounded-2xl bg-slate-50 p-4 md:flex-row md:items-center">
                  <div>
                    <p className="font-black text-slate-950">{date}</p>
                    <p className="text-sm text-slate-600">Calories: {checkin.computedPoints?.totals?.calories || 0} • Water: {checkin.computedPoints?.totals?.water || 0} • Steps: {checkin.computedPoints?.totals?.steps || 0}</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-800">{Number(checkin.computedPoints?.total || 0).toFixed(3)} pts</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard" className="rounded-full bg-slate-950 px-5 py-3 font-black text-white">Back to dashboard</Link>
          <Link href="/check-in" className="rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Log today</Link>
        </div>
      </div>
    </main>
  );
}
