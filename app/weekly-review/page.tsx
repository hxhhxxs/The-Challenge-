"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureUserRecord } from "@/lib/supabase/ensure-user-record";
import { cardClass, pageBg } from "@/lib/challenge-ui";
import { formatStartDate, getProfileChallengeStatus } from "@/lib/challenge";

type DailyLogRow = {
  id?: string;
  date: string;
  computed_points?: { total?: number; body?: number; quran?: number; discipline?: number; personal?: number; character?: number };
  computedPoints?: { total?: number; body?: number; quran?: number; discipline?: number; personal?: number; character?: number };
  reflection?: Record<string, any>;
};

function totalFor(row: DailyLogRow) {
  return Number(row.computed_points?.total ?? row.computedPoints?.total ?? 0);
}

export default function WeeklyReviewPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<Record<string, any> | null>(null);
  const [logs, setLogs] = useState<DailyLogRow[]>([]);
  const [source, setSource] = useState("loading");

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
        .select("id,date,computed_points,reflection")
        .eq("user_id", data.user.id)
        .order("date", { ascending: true });

      if (!error && rows) {
        setLogs(rows as DailyLogRow[]);
        setSource("daily_logs");
        return;
      }

      const fallbackLogs = Object.entries(loadedDraft.checkins || {}).map(([date, value]: any) => ({ date, ...value })) as DailyLogRow[];
      setLogs(fallbackLogs.sort((a, b) => a.date.localeCompare(b.date)));
      setSource("profile backup");
    }
    load();
  }, [router]);

  const reviewStats = useMemo(() => {
    const latestSeven = logs.slice(-7);
    const scoreThisWeek = latestSeven.reduce((sum, row) => sum + totalFor(row), 0);
    const previousSeven = logs.slice(-14, -7);
    const scoreLastWeek = previousSeven.reduce((sum, row) => sum + totalFor(row), 0);
    const perfectDays = latestSeven.filter((row) => totalFor(row) >= 0.9).length;
    const reflectedDays = latestSeven.filter((row) => Boolean(row.reflection && Object.keys(row.reflection).length > 0)).length;
    return { latestSeven, scoreThisWeek, scoreLastWeek, perfectDays, reflectedDays };
  }, [logs]);

  if (!draft) return <main className={pageBg}><section className={`${cardClass} mx-auto max-w-xl`}>Loading weekly review…</section></main>;

  const status = getProfileChallengeStatus(draft);
  const unlockDate = new Date(draft.startDate || new Date());
  unlockDate.setDate(unlockDate.getDate() + 6);
  const unlockLabel = unlockDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  if (status.status === "pre_challenge") {
    return (
      <main className={pageBg}>
        <section className={`${cardClass} mx-auto max-w-3xl text-center`}>
          <p className="text-sm font-black text-amber-700">Weekly Review locked</p>
          <h1 className="mt-2 text-4xl font-black">Your challenge has not started yet.</h1>
          <p className="mt-3 text-slate-600">Your first review unlocks after you start on {formatStartDate(draft.startDate)} and complete enough real check-ins.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/dashboard" className="rounded-full bg-slate-950 px-5 py-3 font-black text-white">Back to dashboard</Link>
            <Link href="/goals" className="rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Prepare Goals</Link>
          </div>
        </section>
      </main>
    );
  }

  if (status.status === "active" && status.dayNumber < 7) {
    return (
      <main className={pageBg}>
        <div className="mx-auto max-w-5xl space-y-6">
          <section className="rounded-[2rem] bg-slate-950 p-6 text-white">
            <p className="text-sm font-bold text-emerald-300">Weekly Review</p>
            <h1 className="mt-1 text-4xl font-black">Your first review is not ready yet.</h1>
            <p className="mt-2 max-w-2xl text-slate-300">No fake stats. Your review appears after real check-ins exist.</p>
          </section>

          <section className={cardClass}>
            <p className="text-sm font-black text-emerald-700">Locked</p>
            <h2 className="mt-1 text-3xl font-black">Your first weekly review unlocks on {unlockLabel}.</h2>
            <p className="mt-3 text-slate-600">Keep logging each day. Once you have enough real data, this page will show your actual wins, slips, score change, and next-week focus.</p>
            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-black text-slate-500">Current progress</p>
              <p className="mt-1 text-2xl font-black text-slate-950">Day {status.dayNumber} / 7 needed</p>
              <p className="mt-1 text-sm text-slate-600">Saved logs: {logs.length} from {source}</p>
            </div>
          </section>

          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard" className="rounded-full bg-slate-950 px-5 py-3 font-black text-white">Back to dashboard</Link>
            <Link href="/check-in" className="rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Log today</Link>
          </div>
        </div>
      </main>
    );
  }

  if (logs.length < 5) {
    return (
      <main className={pageBg}>
        <div className="mx-auto max-w-5xl space-y-6">
          <section className="rounded-[2rem] bg-slate-950 p-6 text-white">
            <p className="text-sm font-bold text-emerald-300">Weekly Review</p>
            <h1 className="mt-1 text-4xl font-black">Not enough check-ins yet.</h1>
            <p className="mt-2 max-w-2xl text-slate-300">You need at least 5 real saved check-ins before this page can generate a trustworthy review.</p>
          </section>
          <section className={cardClass}>
            <p className="text-sm font-black text-amber-700">Need more data</p>
            <h2 className="mt-1 text-3xl font-black">{logs.length} / 5 check-ins saved</h2>
            <p className="mt-3 text-slate-600">Source: {source}. Keep logging; this page will unlock automatically when there is enough real data.</p>
          </section>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard" className="rounded-full bg-slate-950 px-5 py-3 font-black text-white">Back to dashboard</Link>
            <Link href="/check-in" className="rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Log today</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={pageBg}>
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[2rem] bg-slate-950 p-6 text-white">
          <p className="text-sm font-bold text-emerald-300">Weekly Review</p>
          <h1 className="mt-1 text-4xl font-black">Your real weekly review.</h1>
          <p className="mt-2 max-w-2xl text-slate-300">Generated only from saved check-ins. Source: {source}.</p>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          <div className={cardClass}><p className="text-sm font-bold text-slate-500">Score this week</p><p className="mt-1 text-3xl font-black">{reviewStats.scoreThisWeek.toFixed(2)}</p></div>
          <div className={cardClass}><p className="text-sm font-bold text-slate-500">Score last week</p><p className="mt-1 text-3xl font-black">{reviewStats.scoreLastWeek.toFixed(2)}</p></div>
          <div className={cardClass}><p className="text-sm font-bold text-slate-500">Strong days</p><p className="mt-1 text-3xl font-black">{reviewStats.perfectDays}</p></div>
          <div className={cardClass}><p className="text-sm font-bold text-slate-500">Reflection days</p><p className="mt-1 text-3xl font-black">{reviewStats.reflectedDays}</p></div>
        </section>

        <section className={cardClass}>
          <h2 className="text-2xl font-black">Recent check-ins</h2>
          <div className="mt-4 space-y-3">
            {reviewStats.latestSeven.map((row) => (
              <div key={row.date} className="flex justify-between rounded-2xl bg-slate-50 p-4">
                <span className="font-black">{row.date}</span>
                <span className="font-black text-emerald-700">{totalFor(row).toFixed(3)} pts</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] bg-emerald-100 p-5 text-emerald-950">
          <p className="font-black">AI reflection still disabled</p>
          <p className="mt-1 text-sm font-semibold">This page now shows real numbers only. AI summary can be added later from server-side real data.</p>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard" className="rounded-full bg-slate-950 px-5 py-3 font-black text-white">Back to dashboard</Link>
          <Link href="/check-in" className="rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Log today</Link>
        </div>
      </div>
    </main>
  );
}
