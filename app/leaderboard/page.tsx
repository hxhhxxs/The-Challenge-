"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cardClass, pageBg } from "@/lib/challenge-ui";
import { getRankFromScore } from "@/lib/ranks";
import { computePillarStats } from "@/lib/pillars";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureUserRecord } from "@/lib/supabase/ensure-user-record";

type LeaderboardUser = {
  id: string;
  name?: string;
  username?: string;
  display_name?: string;
  current_score?: number;
  pillar_scores?: Record<string, number>;
  onboarding_draft?: Record<string, any>;
};

function safeName(user: LeaderboardUser, currentUserId: string) {
  if (user.id === currentUserId) return "You";
  return user.display_name || user.username || user.onboarding_draft?.name || user.name || "Challenger";
}

function scoreFor(user: LeaderboardUser) {
  return Number(user.current_score ?? user.onboarding_draft?.current_score ?? 0);
}

function pillarsFor(user: LeaderboardUser) {
  return (user.pillar_scores || user.onboarding_draft?.pillar_scores || {}) as Record<string, number>;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const tabs = ["Overall", "Quwwah", "Imaan", "Sabr", "Niyyah", "Adab", "Streak", "Friends"];
  const [draft, setDraft] = useState<Record<string, any> | null>(null);
  const [currentUserId, setCurrentUserId] = useState("");
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loadMessage, setLoadMessage] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
        return;
      }

      setCurrentUserId(data.user.id);
      const record = await ensureUserRecord(data.user);
      const loadedDraft = (record.onboarding_draft || {}) as Record<string, any>;
      setDraft(loadedDraft);

      const { data: rpcRows, error: rpcError } = await supabase.rpc("get_leaderboard");
      let mapped = (rpcRows || []) as LeaderboardUser[];

      if (rpcError || mapped.length === 0) {
        const { data: rows, error } = await supabase
          .from("users")
          .select("id,name,username,display_name,current_score,pillar_scores,onboarding_draft")
          .order("current_score", { ascending: false });

        if (error || !rows) {
          setLoadMessage(`RPC not ready: ${rpcError?.message || "run migration"}`);
          mapped = [];
        } else {
          mapped = rows as LeaderboardUser[];
          setLoadMessage(`${mapped.length} real users loaded from direct query.`);
        }
      } else {
        setLoadMessage(`${mapped.length} real users loaded from leaderboard RPC.`);
      }

      const hasCurrentUser = mapped.some((user) => user.id === data.user.id);
      if (!hasCurrentUser) {
        mapped.push({ id: data.user.id, name: loadedDraft.name, current_score: (record as any).current_score ?? loadedDraft.current_score ?? 0, pillar_scores: (record as any).pillar_scores ?? loadedDraft.pillar_scores ?? {}, onboarding_draft: loadedDraft });
      }
      setUsers(mapped);
    }
    load();
  }, [router]);

  const sortedUsers = useMemo(() => [...users].sort((a, b) => scoreFor(b) - scoreFor(a)), [users]);

  if (!draft) return <main className={pageBg}><section className={`${cardClass} mx-auto max-w-xl`}>Loading leaderboard…</section></main>;

  const yourUser = sortedUsers.find((user) => user.id === currentUserId) || sortedUsers[0];
  const yourStats = computePillarStats(pillarsFor(yourUser || { id: currentUserId }));
  const yourScore = scoreFor(yourUser || { id: currentUserId });
  const yourRankInfo = getRankFromScore(yourStats.overallScore);
  const yourPosition = Math.max(1, sortedUsers.findIndex((user) => user.id === currentUserId) + 1);

  return (
    <main className={pageBg}>
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[2rem] bg-slate-950 p-6 text-white">
          <p className="text-sm font-bold text-emerald-300">Leaderboard</p>
          <h1 className="mt-1 text-4xl font-black">All real users.</h1>
          <p className="mt-2 text-slate-300">The board loads real users from Supabase and sorts them by saved score.</p>
        </section>

        <section className={cardClass}>
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => <span key={tab} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">{tab}</span>)}
          </div>
          <div className="mt-6 rounded-2xl bg-emerald-50 p-5">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-bold text-slate-500">Your pinned row</p>
                <p className="text-xl font-black text-slate-950">#{yourPosition} You</p>
                <p className="mt-1 text-sm font-black text-emerald-800">{yourStats.title}</p>
                <p className="mt-1 text-sm text-slate-600">{loadMessage}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`rounded-full px-5 py-3 font-black ${yourRankInfo.color}`}>{yourStats.overallRank}</span>
                <span className="rounded-full bg-white px-5 py-3 font-black text-emerald-700">{yourScore.toFixed(1)}/100</span>
              </div>
            </div>
          </div>
        </section>

        <section className={cardClass}>
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div><p className="text-sm font-black text-emerald-700">Overall leaderboard</p><h2 className="text-3xl font-black">Ranked by score</h2></div>
            <p className="text-sm font-bold text-slate-500">{sortedUsers.length} users shown</p>
          </div>
          <div className="mt-5 space-y-3">
            {sortedUsers.map((user, index) => {
              const stats = computePillarStats(pillarsFor(user));
              const rank = getRankFromScore(stats.overallScore);
              const score = scoreFor(user);
              const isYou = user.id === currentUserId;
              return (
                <div key={user.id} className={`rounded-2xl p-4 ${isYou ? "bg-emerald-50 ring-2 ring-emerald-300" : "bg-slate-50"}`}>
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white">#{index + 1}</div>
                      <div><p className="text-lg font-black text-slate-950">{safeName(user, currentUserId)}</p><p className="text-sm font-bold text-emerald-700">{stats.title}</p></div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-4 py-2 text-xs font-black ${rank.color}`}>{stats.overallRank}</span><span className="rounded-full bg-white px-4 py-2 text-xs font-black text-slate-700">{score.toFixed(1)}/100</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="flex flex-wrap gap-3"><Link href="/dashboard" className="inline-block rounded-full bg-slate-950 px-5 py-3 font-black text-white">Back to dashboard</Link><Link href="/profile" className="inline-block rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Open Character Sheet</Link><Link href="/check-in" className="inline-block rounded-full bg-emerald-100 px-5 py-3 font-black text-emerald-900">Log today</Link></div>
      </div>
    </main>
  );
}
