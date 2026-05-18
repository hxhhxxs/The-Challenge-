"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureUserRecord } from "@/lib/supabase/ensure-user-record";
import { cardClass, dayOfChallenge, daysBetween, pageBg } from "@/lib/challenge-ui";
import { getRankFromScore } from "@/lib/ranks";
import { computePillarStats } from "@/lib/pillars";

function cleanText(value: unknown) { return String(value || "").trim(); }
function NiyyahBlock({ label, text }: { label: string; text: string }) { return <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-sm font-bold leading-6 text-slate-950">{text}</p></div>; }

export default function ProfilePage() {
  const router = useRouter();
  const [draft, setDraft] = useState<Record<string, any> | null>(null);
  const [userScore, setUserScore] = useState<number | null>(null);
  const [userPillars, setUserPillars] = useState<Record<string, number> | null>(null);

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
    }
    load();
  }, [router]);

  if (!draft) return <main className={pageBg}><section className={`${cardClass} mx-auto max-w-xl`}>Loading profile…</section><BottomNav /></main>;

  const stats = computePillarStats(userPillars || draft.pillar_scores || {});
  const overallRank = getRankFromScore(stats.overallScore);
  const currentScore = Number(userScore ?? draft.current_score ?? stats.totalScore ?? 0);
  const currentDay = Math.min(daysBetween(draft.startDate, draft.endDate) || 1, dayOfChallenge(draft.startDate));
  const totalDays = daysBetween(draft.startDate, draft.endDate) || 1;
  const name = draft.name || "Challenger";
  const initials = String(name).split(/\s+/).map((part: string) => part[0]).join("").slice(0, 2).toUpperCase();
  const isStarter = currentScore < 5;
  const displayTitle = isStarter ? "Mubtadi' — Just Starting" : stats.title;
  const displayArabic = isStarter ? "مُبتدئ" : stats.titleArabic;
  const titleHint = isStarter ? "Reach 5 points to earn your first real title." : `Title earned with ${currentScore.toFixed(1)} total points.`;
  const niyyah = draft.niyyah || {};
  const niyyahItems = [
    { label: "Why", text: cleanText(niyyah.why) },
    { label: "90-day vision", text: cleanText(niyyah.vision) },
    { label: "What stopped me before", text: cleanText(niyyah.stoppedBefore) },
    { label: "What scared me", text: cleanText(niyyah.fear) },
  ].filter((item) => item.text.length > 0);

  return <main className={pageBg}><div className="mx-auto max-w-6xl space-y-6"><section className="rounded-[2rem] bg-slate-950 p-6 text-white"><div className="flex flex-col items-center gap-5 text-center"><div className="flex h-28 w-28 items-center justify-center rounded-[2rem] bg-gradient-to-br from-emerald-300 via-white to-amber-200 text-4xl font-black text-slate-950 shadow-2xl">{initials}</div><div><p className="text-sm font-bold text-emerald-300">Character Sheet</p><h1 className="mt-1 text-4xl font-black">{name}</h1><p className="mt-2 text-xl font-black text-emerald-200">{displayTitle}</p><p className="mt-1 text-lg font-black" dir="rtl">{displayArabic}</p><p className="mt-2 text-sm font-bold text-slate-300">{titleHint}</p><p className="mt-2 text-sm font-bold text-slate-300">Challenge Day {currentDay} of {totalDays} • Overall {stats.overallRank} • {currentScore.toFixed(1)} / 100</p></div></div></section>
    <section className={cardClass}><div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm font-black text-emerald-700">My Why</p><h2 className="text-3xl font-black">Niyyah preview</h2><p className="mt-2 text-sm text-slate-600">These are the words you wrote for hard days and resets.</p></div><Link href="/niyyah" className="rounded-full bg-emerald-100 px-5 py-3 text-sm font-black text-emerald-950">Edit Niyyah</Link></div>{niyyahItems.length === 0 ? <div className="mt-5 rounded-2xl bg-amber-100 p-5 text-amber-950"><p className="font-black">No Niyyah written yet.</p><p className="mt-1 text-sm font-semibold">Write your deeper why so this sheet reflects more than points.</p></div> : <details className="mt-5 rounded-2xl bg-white"><summary className="cursor-pointer rounded-2xl bg-slate-50 p-4 font-black text-slate-950">Open My Why</summary><div className="grid gap-4 p-4 md:grid-cols-2">{niyyahItems.map((item) => <NiyyahBlock key={item.label} label={item.label} text={item.text} />)}</div></details>}</section>
    <section className={cardClass}><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><p className="text-sm font-black text-emerald-700">The 5 Pillars</p><h2 className="text-3xl font-black">Your growth profile</h2><p className="mt-2 text-sm text-slate-600">These are your cumulative challenge pillar points from saved check-ins.</p></div><span className={`rounded-full px-4 py-2 text-sm font-black ${overallRank.color}`}>{stats.overallRank}</span></div><div className="mt-6 space-y-4">{stats.pillars.map((pillar) => <div key={pillar.key} className="rounded-2xl bg-slate-50 p-4"><div className="flex flex-col justify-between gap-3 md:flex-row md:items-center"><div><p className="text-sm font-black text-emerald-700">{pillar.arabic}</p><h3 className="text-xl font-black">{pillar.name} — {pillar.meaning}</h3><p className="mt-1 text-sm text-slate-600">{pillar.description}</p></div><div className="text-left md:text-right"><p className="text-sm font-black text-slate-950">{pillar.rank}</p><p className="text-xs font-bold text-slate-500">{pillar.score.toFixed(1)}/100</p></div></div><div className="mt-3 h-3 rounded-full bg-white"><div className="h-3 rounded-full bg-emerald-500" style={{ width: `${Math.min(100, pillar.score)}%` }} /></div></div>)}</div></section>
    <section className="grid gap-4 md:grid-cols-3"><div className={cardClass}><p className="text-sm font-bold text-slate-500">Challenge Score</p><p className="mt-1 text-3xl font-black">{currentScore.toFixed(1)} / 100</p></div><div className={cardClass}><p className="text-sm font-bold text-slate-500">Strongest Pillar</p><p className="mt-1 text-3xl font-black">{isStarter ? "Not earned yet" : stats.strongest.name}</p></div><div className={cardClass}><p className="text-sm font-bold text-slate-500">Current Title</p><p className="mt-1 text-2xl font-black">{displayTitle}</p></div></section>
    <div className="flex flex-wrap gap-3"><Link href="/check-in" className="rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Log today</Link><Link href="/progress" className="rounded-full bg-emerald-100 px-5 py-3 font-black text-emerald-950">Progress</Link><Link href="/ranks" className="rounded-full bg-white px-5 py-3 font-black text-slate-950">View rank ladder</Link></div></div><BottomNav /></main>;
}
