"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { cardClass, pageBg } from "@/lib/challenge-ui";
import { getRankFromScore } from "@/lib/ranks";
import { computePillarStats } from "@/lib/pillars";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureUserRecord } from "@/lib/supabase/ensure-user-record";

type LeaderboardUser = { id: string; name?: string; username?: string; display_name?: string; current_score?: number; pillar_scores?: Record<string, number>; onboarding_draft?: Record<string, any> };

function safeName(user: LeaderboardUser, currentUserId: string) { if (user.id === currentUserId) return "You"; return user.display_name || user.username || user.onboarding_draft?.name || user.name || "Challenger"; }
function scoreFor(user: LeaderboardUser) { return Number(user.current_score ?? user.onboarding_draft?.current_score ?? 0); }
function pillarsFor(user: LeaderboardUser) { return (user.pillar_scores || user.onboarding_draft?.pillar_scores || {}) as Record<string, number>; }
function titleFor(user: LeaderboardUser) { return scoreFor(user) > 0 ? computePillarStats(pillarsFor(user)).title : "Just Starting"; }
function initials(user: LeaderboardUser, currentUserId: string) { return safeName(user, currentUserId).split(/\s+/).slice(0, 2).map((x: string) => x[0]).join("").toUpperCase() || "C"; }

export default function LeaderboardPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<Record<string, any> | null>(null);
  const [currentUserId, setCurrentUserId] = useState("");
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loadMessage, setLoadMessage] = useState("Loading leaderboard…");

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    async function load() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) { router.push("/login"); return; }
      setCurrentUserId(data.user.id);
      const record = await ensureUserRecord(data.user);
      const loadedDraft = (record.onboarding_draft || {}) as Record<string, any>;
      setDraft(loadedDraft);
      const { data: rows } = await supabase.from("users").select("id,name,username,display_name,current_score,pillar_scores,onboarding_draft").order("current_score", { ascending: false });
      let mapped = (rows || []) as LeaderboardUser[];
      if (!mapped.some((user) => user.id === data.user.id)) mapped.push({ id: data.user.id, name: loadedDraft.name, current_score: (record as any).current_score ?? loadedDraft.current_score ?? 0, pillar_scores: (record as any).pillar_scores ?? loadedDraft.pillar_scores ?? {}, onboarding_draft: loadedDraft });
      setUsers(mapped);
      setLoadMessage(`${mapped.length} challengers found • updates live`);
    }
    load();
    const channel = supabase.channel("leaderboard-live").on("postgres_changes", { event: "*", schema: "public", table: "users" }, () => load()).subscribe();
    const timer = setInterval(load, 15_000);
    return () => { clearInterval(timer); supabase.removeChannel(channel); };
  }, [router]);

  const sortedUsers = useMemo(() => [...users].sort((a, b) => scoreFor(b) - scoreFor(a)), [users]);
  const activeUsers = sortedUsers.filter((user) => scoreFor(user) > 0);
  const startingUsers = sortedUsers.filter((user) => scoreFor(user) <= 0);

  if (!draft) return <main className={pageBg}><section className={`${cardClass} mx-auto max-w-xl`}>Loading leaderboard…</section><BottomNav /></main>;

  const yourUser = sortedUsers.find((user) => user.id === currentUserId) || { id: currentUserId, onboarding_draft: draft };
  const yourStats = computePillarStats(pillarsFor(yourUser));
  const yourScore = scoreFor(yourUser);
  const yourRankInfo = getRankFromScore(yourStats.overallScore);
  const yourPosition = Math.max(1, sortedUsers.findIndex((user) => user.id === currentUserId) + 1);

  return <main className={pageBg}><div className="mx-auto max-w-6xl space-y-6"><section className="rounded-[2rem] bg-slate-950 p-6 text-white"><p className="text-sm font-bold text-emerald-300">Leaderboard</p><h1 className="mt-1 text-4xl font-black">Compete in good.</h1><p className="mt-2 text-slate-300">{loadMessage}</p></section>
    <section className={cardClass}><div className="rounded-2xl bg-emerald-50 p-5"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><p className="text-sm font-bold text-slate-500">Your position</p><p className="text-xl font-black text-slate-950">#{yourPosition} You</p><p className="mt-1 text-sm font-black text-emerald-800">{yourScore > 0 ? yourStats.title : "Just Starting"}</p></div><div className="flex flex-wrap items-center gap-3"><span className={`rounded-full px-5 py-3 font-black ${yourRankInfo.color}`}>{yourStats.overallRank}</span><span className="rounded-full bg-white px-5 py-3 font-black text-emerald-700">{yourScore.toFixed(1)}/100</span></div></div></div></section>
    <section className={cardClass}><div className="flex flex-col justify-between gap-3 md:flex-row md:items-end"><div><p className="text-sm font-black text-emerald-700">Active leaderboard</p><h2 className="text-3xl font-black">{activeUsers.length} active challengers</h2></div><p className="text-sm font-bold text-slate-500">Sorted by current score</p></div>{activeUsers.length === 0 ? <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-600">Leaderboard opens when challengers start logging points. Be the first to move.</p> : <div className="mt-5 space-y-3">{activeUsers.map((user, index) => <LeaderboardRow key={user.id} user={user} index={index} currentUserId={currentUserId} />)}</div>}</section>
    {startingUsers.length > 0 && <section className={cardClass}><p className="text-sm font-black text-slate-500">Just starting</p><h2 className="mt-1 text-2xl font-black">{startingUsers.length} challengers have not logged points yet</h2><div className="mt-4 grid gap-3 md:grid-cols-2">{startingUsers.slice(0, 12).map((user) => <div key={user.id} className="rounded-2xl bg-slate-50 p-4"><p className="font-black text-slate-950">{safeName(user, currentUserId)}</p><p className="text-sm font-bold text-slate-500">Just Starting • 0.0/100</p></div>)}</div></section>}
    <div className="flex flex-wrap gap-3"><Link href="/progress" className="inline-block rounded-full bg-emerald-600 px-5 py-3 font-black text-white">View Progress</Link><Link href="/check-in" className="inline-block rounded-full bg-emerald-100 px-5 py-3 font-black text-emerald-900">Log today</Link></div>
  </div><BottomNav /></main>;
}

function LeaderboardRow({ user, index, currentUserId }: { user: LeaderboardUser; index: number; currentUserId: string }) {
  const stats = computePillarStats(pillarsFor(user));
  const rank = getRankFromScore(stats.overallScore);
  const score = scoreFor(user);
  const isYou = user.id === currentUserId;
  return <div className={`rounded-2xl p-4 ${isYou ? "bg-emerald-50 ring-2 ring-emerald-300" : "bg-slate-50"}`}><div className="flex flex-col justify-between gap-3 md:flex-row md:items-center"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white">{isYou ? "You" : initials(user, currentUserId)}</div><div><p className="text-lg font-black text-slate-950">#{index + 1} {safeName(user, currentUserId)}</p><p className="text-sm font-bold text-emerald-700">{titleFor(user)}</p></div></div><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-4 py-2 text-xs font-black ${rank.color}`}>{stats.overallRank}</span><span className="rounded-full bg-white px-4 py-2 text-xs font-black text-slate-700">{score.toFixed(1)}/100</span></div></div></div>;
}
