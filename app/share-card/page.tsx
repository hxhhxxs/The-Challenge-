"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureUserRecord } from "@/lib/supabase/ensure-user-record";
import { cardClass, pageBg } from "@/lib/challenge-ui";
import { formatStartDate, getProfileChallengeStatus } from "@/lib/challenge";
import { computePillarStats } from "@/lib/pillars";

type DailyLogRow = {
  id?: string;
  date: string;
  computed_points?: { total?: number };
  computedPoints?: { total?: number };
  reflection?: Record<string, any>;
};

function totalFor(row: DailyLogRow) {
  return Number(row.computed_points?.total ?? row.computedPoints?.total ?? 0);
}

function milestoneFor(dayNumber: number) {
  if (dayNumber >= 90) return 90;
  if (dayNumber >= 60) return 60;
  if (dayNumber >= 30) return 30;
  return 30;
}

export default function ShareCardPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<Record<string, any> | null>(null);
  const [userScore, setUserScore] = useState(0);
  const [pillarScores, setPillarScores] = useState<Record<string, number>>({});
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
      setUserScore(Number((record as any).current_score ?? loadedDraft.current_score ?? 0));
      setPillarScores(((record as any).pillar_scores || loadedDraft.pillar_scores || {}) as Record<string, number>);

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

  const stats = useMemo(() => {
    const scoredLogs = logs.filter((row) => totalFor(row) > 0);
    const totalPointsFromLogs = logs.reduce((sum, row) => sum + totalFor(row), 0);
    const reflectedDays = logs.filter((row) => row.reflection && Object.keys(row.reflection).length > 0).length;
    const longestLoggedStreak = scoredLogs.length;
    return { scoredLogs, totalPointsFromLogs, reflectedDays, longestLoggedStreak };
  }, [logs]);

  if (!draft) return <main className={pageBg}><section className={`${cardClass} mx-auto max-w-xl`}>Loading share card…</section></main>;

  const challengeStatus = getProfileChallengeStatus(draft);

  if (challengeStatus.status === "pre_challenge") {
    return (
      <main className={pageBg}>
        <section className={`${cardClass} mx-auto max-w-3xl text-center`}>
          <p className="text-sm font-black text-amber-700">Milestone cards locked</p>
          <h1 className="mt-2 text-4xl font-black">Your challenge has not started yet.</h1>
          <p className="mt-3 text-slate-600">Your first milestone card unlocks after Day 30. Your challenge starts on {formatStartDate(draft.startDate)}.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/dashboard" className="rounded-full bg-slate-950 px-5 py-3 font-black text-white">Back to dashboard</Link>
            <Link href="/goals" className="rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Prepare Goals</Link>
          </div>
        </section>
      </main>
    );
  }

  const currentDay = challengeStatus.status === "active" ? challengeStatus.dayNumber : challengeStatus.totalDays;
  const nextMilestone = milestoneFor(currentDay);
  const daysToGo = Math.max(0, 30 - currentDay);
  const unlocked = currentDay >= 30;

  if (!unlocked) {
    return (
      <main className={pageBg}>
        <div className="mx-auto max-w-5xl space-y-6">
          <section className="rounded-[2rem] bg-slate-950 p-6 text-white">
            <p className="text-sm font-bold text-emerald-300">Milestone Share Cards</p>
            <h1 className="mt-1 text-4xl font-black">Your first share card unlocks at Day 30.</h1>
            <p className="mt-2 max-w-2xl text-slate-300">No fake milestones. Your card will use real stats from your challenge.</p>
          </section>

          <section className={cardClass}>
            <p className="text-sm font-black text-emerald-700">Locked</p>
            <h2 className="mt-1 text-3xl font-black">{daysToGo} days to go.</h2>
            <p className="mt-3 text-slate-600">You are on Day {currentDay}. Keep logging honestly. When Day 30 arrives, this page will generate a public-safe card with real stats only.</p>
            <div className="mt-5 h-3 rounded-full bg-slate-100">
              <div className="h-3 rounded-full bg-emerald-500" style={{ width: `${Math.min(100, (currentDay / 30) * 100)}%` }} />
            </div>
            <p className="mt-3 text-xs font-bold text-slate-500">Saved logs: {logs.length} from {source}</p>
          </section>

          <div className="flex gap-3">
            <Link href="/dashboard" className="rounded-full bg-slate-950 px-5 py-3 font-black text-white">Back to dashboard</Link>
            <Link href="/check-in" className="rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Log today</Link>
          </div>
        </div>
      </main>
    );
  }

  const pillarStats = computePillarStats(pillarScores);
  const safeScore = Number(userScore || stats.totalPointsFromLogs || 0);
  const milestoneLogs = logs.filter((row) => row.date <= String(draft.startDate || "9999-12-31") || true).slice(0, nextMilestone);
  const loggedDays = milestoneLogs.length;

  return (
    <main className={pageBg}>
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[2rem] bg-slate-950 p-6 text-white">
          <p className="text-sm font-bold text-emerald-300">Milestone Share Cards</p>
          <h1 className="mt-1 text-4xl font-black">Day {nextMilestone} card unlocked.</h1>
          <p className="mt-2 max-w-2xl text-slate-300">This card uses your real saved challenge data. Source: {source}.</p>
        </section>

        <section className="rounded-[2rem] bg-gradient-to-br from-emerald-950 to-slate-950 p-8 text-white shadow-2xl">
          <p className="text-sm font-black text-emerald-300">THE CHALLENGE</p>
          <h2 className="mt-2 text-5xl font-black">Day {nextMilestone}</h2>
          <p className="mt-2 text-lg font-bold text-emerald-100">{draft.name || "Challenger"} • {pillarStats.overallRank}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-white/10 p-4"><p className="text-xs font-bold text-emerald-200">Score</p><p className="mt-1 text-3xl font-black">{safeScore.toFixed(1)}</p></div>
            <div className="rounded-2xl bg-white/10 p-4"><p className="text-xs font-bold text-emerald-200">Logged days</p><p className="mt-1 text-3xl font-black">{loggedDays}</p></div>
            <div className="rounded-2xl bg-white/10 p-4"><p className="text-xs font-bold text-emerald-200">Reflection days</p><p className="mt-1 text-3xl font-black">{stats.reflectedDays}</p></div>
            <div className="rounded-2xl bg-white/10 p-4"><p className="text-xs font-bold text-emerald-200">Title</p><p className="mt-1 text-xl font-black">{pillarStats.title}</p></div>
          </div>
          <p className="mt-8 text-sm font-bold text-emerald-200">Public-safe card: no weight, money, calories, private notes, or sensitive details shown.</p>
        </section>

        <section className={cardClass}>
          <h2 className="text-2xl font-black">Share-card privacy</h2>
          <p className="mt-2 text-slate-600">Only safe high-level stats are displayed: milestone day, score, logged days, reflections, rank, and title. Sensitive health and worship details stay private.</p>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard" className="inline-block rounded-full bg-slate-950 px-5 py-3 font-black text-white">Back to dashboard</Link>
          <Link href="/progress" className="inline-block rounded-full bg-emerald-600 px-5 py-3 font-black text-white">View Progress</Link>
        </div>
      </div>
    </main>
  );
}
