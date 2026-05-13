"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureUserRecord } from "@/lib/supabase/ensure-user-record";
import { cardClass, pageBg } from "@/lib/challenge-ui";
import { formatStartDate, getProfileChallengeStatus } from "@/lib/challenge";
import { getRankFromScore } from "@/lib/ranks";
import { computePillarStats } from "@/lib/pillars";
import { getDailyLearningItem } from "@/lib/content-library";
import { DashboardHeader, HomeCard, LearningCard, LineIcon, RankEmblem, formatDate, hijriLabel } from "./dashboard-components";

export default function DashboardPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<Record<string, any> | null>(null);
  const [userScore, setUserScore] = useState<number | null>(null);
  const [userPillars, setUserPillars] = useState<Record<string, number> | null>(null);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
        return;
      }
      const record = await ensureUserRecord(data.user);
      if (!record.onboarding_complete) {
        router.push("/onboarding");
        return;
      }
      const loadedDraft = (record.onboarding_draft || {}) as Record<string, any>;
      setUserId(data.user.id);
      setDraft(loadedDraft);
      setUserScore(Number((record as any).current_score ?? loadedDraft.current_score ?? 0));
      setUserPillars(((record as any).pillar_scores || loadedDraft.pillar_scores || {}) as Record<string, number>);
    }
    load();
  }, [router]);

  async function startNow() {
    if (!draft || !userId) return;
    const supabase = createSupabaseBrowserClient();
    const today = new Date();
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const nextDraft = {
      ...draft,
      startDate: key,
      challenge_started_at: key,
      challenge_started_local_date: key,
      challenge_status: "active",
    };
    await supabase.from("users").update({ onboarding_draft: nextDraft }).eq("id", userId);
    setDraft(nextDraft);
  }

  if (!draft) {
    return <main className={pageBg}><section className={`${cardClass} mx-auto max-w-xl`}>Loading dashboard…</section></main>;
  }

  const today = new Date();
  const status = getProfileChallengeStatus(draft, today);
  const stats = computePillarStats(userPillars || draft.pillar_scores || {});
  const rank = getRankFromScore(stats.overallScore);
  const currentScore = Number(userScore ?? draft.current_score ?? stats.totalScore ?? 0);
  const scoreLabel = currentScore.toFixed(1);
  const dailyLearning = getDailyLearningItem(today);
  const isFriday = today.getDay() === 5;
  const customGoalsCount = (draft.custom_personal_goals || []).length;
  const customTasksCount = (draft.custom_daily_tasks || []).length;

  if (status.status === "pre_challenge") {
    return (
      <main className={pageBg}>
        <div className="mx-auto max-w-4xl space-y-6">
          <section className="rounded-[2rem] bg-slate-950 p-8 text-center text-white">
            <p className="text-xs font-black text-emerald-300">Dashboard live build v6 • scheduled challenge</p>
            <h1 className="mt-3 text-4xl font-black">Your challenge starts in</h1>
            <p className="mt-4 text-7xl font-black text-emerald-300">{status.daysUntilStart}</p>
            <p className="mt-2 text-2xl font-black">day{status.daysUntilStart === 1 ? "" : "s"}</p>
            <p className="mt-4 text-lg font-bold text-slate-300">{formatStartDate(draft.startDate)} • {hijriLabel(new Date(draft.startDate))}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button onClick={startNow} className="rounded-full bg-emerald-400 px-5 py-3 font-black text-slate-950">Start now instead</button>
              <Link href="/onboarding" className="rounded-full bg-white/10 px-5 py-3 font-black text-white">Edit my start date</Link>
            </div>
          </section>

          <section className={cardClass}>
            <h2 className="text-2xl font-black">Use these days to prepare</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {["Tell a family member you’re starting", "Stock up on water + healthy food", "Plan your Fajr time", "Re-read your why", "Add extra personal goals", "Set custom daily tasks"].map((item) => <div key={item} className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-700">{item}</div>)}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <HomeCard href="/goals" icon={<LineIcon kind="plus" />} label="My Goals & Tasks" title="Prepare your mission" text="Add extra personal goals and custom daily tasks before Day 1." badge={`${customGoalsCount} goals • ${customTasksCount} tasks`} />
            <HomeCard href="/learning" icon={<LineIcon kind="book" />} label="Learning Library" title="Start with the heart" text="Read the verse, hadith, and story library while you wait." badge="Faith" />
          </section>
        </div>
      </main>
    );
  }

  if (status.status === "completed") {
    return (
      <main className={pageBg}>
        <section className={`${cardClass} mx-auto max-w-3xl text-center`}>
          <p className="text-sm font-black text-emerald-700">Challenge complete</p>
          <h1 className="mt-2 text-4xl font-black">You finished {status.totalDays} days.</h1>
          <p className="mt-3 text-slate-600">Your final score is {scoreLabel}/100. Review your progress or create a share card.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/progress" className="rounded-full bg-emerald-600 px-5 py-3 font-black text-white">View Progress</Link>
            <Link href="/share-card" className="rounded-full bg-slate-950 px-5 py-3 font-black text-white">Create Share Card</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={pageBg}>
      <div className="mx-auto max-w-7xl space-y-6">
        <DashboardHeader draft={draft} router={router} marker="Dashboard live build v6" subtitle={`Day ${status.dayNumber} of ${status.totalDays} • ${formatDate(today)} • ${hijriLabel(today)}`} />
        {isFriday && <section className="rounded-[2rem] bg-emerald-100 p-4 text-sm font-black text-emerald-950">Jumu'ah Mubarak</section>}
        <LearningCard item={dailyLearning} />

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <HomeCard href="/check-in" icon={<LineIcon kind="check" />} label="Tracking Today" title="Log today’s mission" text="Open the full tracking page. Every save updates today’s points." badge={`${scoreLabel}/100`} />
          <HomeCard href="/goals" icon={<LineIcon kind="plus" />} label="My Goals & Tasks" title="Add your own" text="Add extra personal goals and custom daily tasks to your mission." badge={`${customGoalsCount} goals • ${customTasksCount} tasks`} />
          <HomeCard href="/progress" icon={<LineIcon kind="chart" />} label="Progress" title="Score breakdown" text="See your score, pace, 5 Pillars, and recent saved check-ins." badge={`${scoreLabel}/100`} />
          <HomeCard href="/leaderboard" icon={<LineIcon kind="trophy" />} label="Leaderboard" title="See the board" text="View your leaderboard row and the real-user ranking system." badge={stats.overallRank} />
          <HomeCard href="/ranks" icon={<RankEmblem score={stats.overallScore} />} label="Ranking" title={stats.overallRank} text={`Current title: ${stats.title}. Next: ${rank.nextRank}.`} badge={`${rank.progressToNext}%`} />
          <HomeCard href="/profile" icon={<LineIcon kind="profile" />} label="Character Sheet" title="5 Pillars" text="View Quwwah, Imaan, Sabr, Niyyah, and Adab as your growth stats." badge="Profile" />
          <HomeCard href="/learning" icon={<LineIcon kind="book" />} label="Learning Library" title="Verses, hadiths, stories" text="Browse daily verses, hadiths, Sahaba stories, Prophet ﷺ stories, and challenge tasks." badge="Faith" />
          <HomeCard href="/tools" icon={<LineIcon kind="tools" />} label="Tools" title="Challenge tools" text="Open Ramadan Mode, partner, share cards, food photo logging, why reset, and more." badge="Hub" />
        </section>

        <section className={cardClass}>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-black text-emerald-700">Current score</p>
              <h2 className="text-3xl font-black">{scoreLabel} / 100</h2>
              <p className="mt-1 text-sm font-semibold text-slate-600">Challenge day {status.dayNumber} of {status.totalDays} • Current rank: {stats.overallRank} • Title: {stats.title}</p>
            </div>
            <Link href="/progress" className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white">Open Progress</Link>
          </div>
          <div className="mt-5 h-3 rounded-full bg-slate-100"><div className="h-3 rounded-full bg-emerald-500" style={{ width: `${Math.min(100, currentScore)}%` }} /></div>
        </section>
      </div>
    </main>
  );
}
