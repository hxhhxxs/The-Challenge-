"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureUserRecord } from "@/lib/supabase/ensure-user-record";
import { cardClass, pageBg } from "@/lib/challenge-ui";
import { formatStartDate, getProfileChallengeStatus } from "@/lib/challenge";
import { computePillarStats } from "@/lib/pillars";
import { getDailyLearningItem, getDailyStoryItem } from "@/lib/content-library";
import { DashboardHeader, LearningCard, LineIcon, formatDate, hijriLabel } from "./dashboard-components";
import { CalmDashboardCard, todayDoneCount } from "./calm-cards";
import { DailyDuaCard } from "./dua-card";

type LeaderboardUser = { id: string; name?: string; username?: string; display_name?: string; current_score?: number; pillar_scores?: Record<string, number>; onboarding_complete?: boolean; onboarding_draft?: Record<string, any> };

function scoreFor(user: LeaderboardUser) { return Number(user.current_score ?? user.onboarding_draft?.current_score ?? 0); }
function isActiveUser(user: LeaderboardUser) { const draft = user.onboarding_draft || {}; if (draft.deleted || draft.removed || draft.archived || draft.is_deleted || draft.account_status === "removed") return false; return user.onboarding_complete === true || draft.onboarding_complete === true || Boolean(draft.startDate); }
function nameFor(user: LeaderboardUser, currentUserId: string) { if (user.id === currentUserId) return "You"; return user.display_name || user.username || user.onboarding_draft?.name || user.name || "Challenger"; }
function initialsFor(name: string) { return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "C"; }

async function fetchActiveLeaderboard(supabase: ReturnType<typeof createSupabaseBrowserClient>, currentUser?: LeaderboardUser) {
  const { data: rows } = await supabase.from("users").select("id,name,username,display_name,current_score,pillar_scores,onboarding_complete,onboarding_draft").eq("onboarding_complete", true).order("current_score", { ascending: false }).limit(50);
  let mapped = ((rows || []) as LeaderboardUser[]).filter(isActiveUser);
  if (currentUser && !mapped.some((user) => user.id === currentUser.id)) mapped.push(currentUser);
  return mapped.sort((a, b) => scoreFor(b) - scoreFor(a));
}

export default function DashboardMain() {
  const router = useRouter();
  const [draft, setDraft] = useState<Record<string, any> | null>(null);
  const [userScore, setUserScore] = useState<number | null>(null);
  const [userPillars, setUserPillars] = useState<Record<string, number> | null>(null);
  const [userId, setUserId] = useState("");
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) { router.push("/login"); return; }
      const record = await ensureUserRecord(data.user);
      if (!record.onboarding_complete) { router.push("/onboarding"); return; }
      const loadedDraft = (record.onboarding_draft || {}) as Record<string, any>;
      setUserId(data.user.id);
      setDraft(loadedDraft);
      setUserScore(Number((record as any).current_score ?? loadedDraft.current_score ?? 0));
      setUserPillars(((record as any).pillar_scores || loadedDraft.pillar_scores || {}) as Record<string, number>);

      const currentUser: LeaderboardUser = { id: data.user.id, name: loadedDraft.name, current_score: (record as any).current_score ?? loadedDraft.current_score ?? 0, pillar_scores: (record as any).pillar_scores ?? loadedDraft.pillar_scores ?? {}, onboarding_complete: true, onboarding_draft: loadedDraft };
      setLeaderboardUsers(await fetchActiveLeaderboard(supabase, currentUser));

      timer = setInterval(async () => {
        const { data: freshUser } = await supabase.from("users").select("id,name,username,display_name,current_score,pillar_scores,onboarding_complete,onboarding_draft").eq("id", data.user.id).maybeSingle();
        const freshCurrent = (freshUser || currentUser) as LeaderboardUser;
        setUserScore(scoreFor(freshCurrent));
        setUserPillars((freshCurrent.pillar_scores || freshCurrent.onboarding_draft?.pillar_scores || {}) as Record<string, number>);
        setLeaderboardUsers(await fetchActiveLeaderboard(supabase, freshCurrent));
      }, 8000);
    }
    load();
    return () => { if (timer) clearInterval(timer); };
  }, [router]);

  async function startNow() {
    if (!draft || !userId) return;
    const supabase = createSupabaseBrowserClient();
    const today = new Date();
    const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const nextDraft = { ...draft, startDate: key, challenge_started_at: key, challenge_started_local_date: key, challenge_status: "active" };
    await supabase.from("users").update({ onboarding_draft: nextDraft }).eq("id", userId);
    setDraft(nextDraft);
  }

  if (!draft) return <main className={pageBg}><section className={`${cardClass} mx-auto max-w-xl`}>Loading dashboard…</section><BottomNav /></main>;

  const today = new Date();
  const status = getProfileChallengeStatus(draft, today);
  const stats = computePillarStats(userPillars || draft.pillar_scores || {});
  const score = Number(userScore ?? draft.current_score ?? stats.totalScore ?? 0).toFixed(1);
  const learning = getDailyLearningItem(today);
  const story = getDailyStoryItem(today);

  if (status.status === "pre_challenge") return <PreChallenge draft={draft} status={status} startNow={startNow} />;
  if (status.status === "completed") return <Completed totalDays={status.totalDays} score={score} />;

  return (
    <main className={pageBg}>
      <div className="mx-auto max-w-6xl space-y-6">
        <DashboardHeader draft={draft} router={router} marker="The Challenge" subtitle={`Day ${status.dayNumber} of ${status.totalDays} • ${formatDate(today)} • ${hijriLabel(today)}`} />
        <LearningCard item={learning} />
        <DailyDuaCard date={today} />
        <LearningCard item={story} />
        <section className="grid gap-4 md:grid-cols-2">
          <CalmDashboardCard href="/check-in" icon={<LineIcon kind="check" />} title="Today’s Mission" subtitle={`${todayDoneCount(draft)} actions logged today`} action="Open Tracker" />
          <CalmDashboardCard href="/progress" icon={<LineIcon kind="chart" />} title="Score & Pace" subtitle={`${score}/100 • ${stats.overallRank}`} action="See Progress" />
          <CalmDashboardCard href="/learning" icon={<LineIcon kind="book" />} title="Learning" subtitle="Today’s verse, du’a, hadith, and stories" action="Open Library" />
          <CalmDashboardCard href="/tools" icon={<LineIcon kind="tools" />} title="More" subtitle="Goals, settings, share cards, weekly review" action="Open More" />
        </section>
        <LeaderboardPreview users={leaderboardUsers} currentUserId={userId} />
      </div>
      <BottomNav />
    </main>
  );
}

function LeaderboardPreview({ users, currentUserId }: { users: LeaderboardUser[]; currentUserId: string }) {
  const sorted = [...users].filter(isActiveUser).sort((a, b) => scoreFor(b) - scoreFor(a));
  const active = sorted.filter((user) => scoreFor(user) > 0);
  const preview = (active.length ? active : sorted).slice(0, 5);
  const yourIndex = sorted.findIndex((user) => user.id === currentUserId);
  const yourPosition = yourIndex >= 0 ? yourIndex + 1 : 1;
  return <section className={cardClass}>
    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
      <div><p className="text-sm font-black text-emerald-700">Live leaderboard</p><h2 className="text-3xl font-black text-slate-950">Compete in good</h2><p className="mt-1 text-sm font-bold text-slate-500">Your position: #{yourPosition} • refreshes automatically</p></div>
      <Link href="/leaderboard" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white">View full leaderboard →</Link>
    </div>
    <div className="mt-5 space-y-3">
      {preview.length === 0 ? <p className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-600">Leaderboard opens when challengers start logging points.</p> : preview.map((user, index) => {
        const name = nameFor(user, currentUserId);
        const score = scoreFor(user);
        const isYou = user.id === currentUserId;
        return <div key={user.id} className={`flex items-center justify-between gap-3 rounded-2xl p-4 ${isYou ? "bg-emerald-50 ring-2 ring-emerald-300" : "bg-slate-50"}`}>
          <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-xs font-black text-white">{initialsFor(name)}</div><div><p className="font-black text-slate-950">#{index + 1} {name}</p><p className="text-xs font-bold text-slate-500">{score > 0 ? "Active challenger" : "Just Starting"}</p></div></div>
          <span className="rounded-full bg-white px-4 py-2 text-sm font-black text-emerald-700">{score.toFixed(1)}/100</span>
        </div>;
      })}
    </div>
  </section>;
}

function PreChallenge({ draft, status, startNow }: { draft: Record<string, any>; status: { daysUntilStart: number }; startNow: () => void }) {
  return (
    <main className={pageBg}>
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-[2rem] bg-slate-950 p-8 text-center text-white">
          <p className="text-sm font-black text-emerald-300">Scheduled challenge</p>
          <h1 className="mt-3 text-4xl font-black">Your challenge starts in</h1>
          <p className="mt-4 text-7xl font-black text-emerald-300">{status.daysUntilStart}</p>
          <p className="mt-2 text-2xl font-black">day{status.daysUntilStart === 1 ? "" : "s"}</p>
          <p className="mt-4 text-lg font-bold text-slate-300">{formatStartDate(draft.startDate)} • {hijriLabel(new Date(draft.startDate))}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3"><button onClick={startNow} className="rounded-full bg-emerald-400 px-5 py-3 font-black text-slate-950">Start now instead</button><Link href="/onboarding" className="rounded-full bg-white/10 px-5 py-3 font-black text-white">Edit my start date</Link></div>
        </section>
        <section className={cardClass}><h2 className="text-2xl font-black">Use these days to prepare</h2><div className="mt-4 grid gap-3 md:grid-cols-2">{["Tell a family member you’re starting", "Stock up on water + healthy food", "Plan your Fajr time", "Re-read your why", "Add extra personal goals", "Set custom daily tasks"].map((item) => <div key={item} className="rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-700">{item}</div>)}</div></section>
      </div>
      <BottomNav />
    </main>
  );
}

function Completed({ totalDays, score }: { totalDays: number; score: string }) {
  return <main className={pageBg}><section className={`${cardClass} mx-auto max-w-3xl text-center`}><p className="text-sm font-black text-emerald-700">Challenge complete</p><h1 className="mt-2 text-4xl font-black">You finished {totalDays} days.</h1><p className="mt-3 text-slate-600">Final score: {score}/100</p><div className="mt-6 flex flex-wrap justify-center gap-3"><Link href="/progress" className="rounded-full bg-emerald-600 px-5 py-3 font-black text-white">View Progress</Link><Link href="/share-card" className="rounded-full bg-slate-950 px-5 py-3 font-black text-white">Create Share Card</Link></div></section><BottomNav /></main>;
}
