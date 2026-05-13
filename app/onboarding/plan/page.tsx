"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureUserRecord } from "@/lib/supabase/ensure-user-record";
import { cardClass, daysBetween, formatNum, pageBg } from "@/lib/challenge-ui";

function localTodayKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function PlanPreviewPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<Record<string, any> | null>(null);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) { router.push("/login"); return; }
      const record = await ensureUserRecord(data.user);
      setUserId(record.id);
      setDraft((record.onboarding_draft || {}) as Record<string, any>);
    }
    load();
  }, [router]);

  async function start() {
    if (!draft || !userId) return;
    const supabase = createSupabaseBrowserClient();
    const today = localTodayKey();
    const stableStart = draft.challenge_started_at || draft.startDate || today;
    const nextDraft = {
      ...draft,
      startDate: draft.startDate || stableStart,
      challenge_started_at: stableStart,
      challenge_started_local_date: stableStart,
    };
    await supabase.from("users").update({ onboarding_complete: true, onboarding_draft: nextDraft }).eq("id", userId);
    router.push("/dashboard");
  }

  if (!draft) return <main className={pageBg}><section className={`${cardClass} mx-auto max-w-xl`}>Building your challenge…</section></main>;
  const days = daysBetween(draft.startDate, draft.endDate);

  return <main className={pageBg}><section className={`${cardClass} mx-auto max-w-3xl`}><p className="text-sm font-bold text-emerald-700">Plan Preview</p><h1 className="mt-2 text-4xl font-black">Your challenge is ready.</h1><div className="mt-6 grid gap-4 md:grid-cols-2"><PlanItem label="Your challenge" value={`${days} days (${draft.startDate} → ${draft.endDate})`} /><PlanItem label="Weight target" value={`${draft.currentWeightLbs} lbs → ${draft.goalWeightLbs} lbs`} /><PlanItem label="Daily targets" value={`${draft.calorieTarget} cal • ${formatNum(draft.stepTarget)} steps • ${draft.waterTarget} water`} /><PlanItem label="Qur'an target" value={`${draft.dailyMemorizeGoal || draft.quranDailyTarget} ${draft.measurementUnit || "units"} memorize • ${draft.dailyReviewGoal || draft.quranReviewTarget} review`} /><PlanItem label="Personal Goal 1" value={`${draft.goal1}: ${draft.goal1Task}`} /><PlanItem label="Personal Goal 2" value={`${draft.goal2}: ${draft.goal2Task}`} /><PlanItem label="Score pace" value={`~${days ? (100 / days).toFixed(2) : "—"} points/day to hit 100`} /></div><div className="mt-6 flex gap-3"><button onClick={() => router.push("/onboarding")} className="rounded-full bg-slate-100 px-5 py-3 font-bold">Edit</button><button onClick={start} className="rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Start Day 1</button></div></section></main>;
}

function PlanItem({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 font-black text-slate-950">{value}</p></div>;
}
