"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureUserRecord } from "@/lib/supabase/ensure-user-record";
import { cardClass, pageBg } from "@/lib/challenge-ui";
import { computeBodyPlan, computeQuranPlan, daysBetween, generateWeeklyWorkoutPlan } from "@/lib/onboarding-coach";

function localTodayKey() { const date = new Date(); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }

export default function PlanPreviewPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<Record<string, any> | null>(null);
  const [userId, setUserId] = useState("");

  useEffect(() => { async function load() { const supabase = createSupabaseBrowserClient(); const { data } = await supabase.auth.getUser(); if (!data.user) { router.push("/login"); return; } const record = await ensureUserRecord(data.user); setUserId(record.id); setDraft((record.onboarding_draft || {}) as Record<string, any>); } load(); }, [router]);

  const days = useMemo(() => draft ? daysBetween(draft.startDate, draft.endDate) : 0, [draft]);
  const bodyPlan = useMemo(() => draft ? (draft.coachPlan?.bodyPlan || computeBodyPlan({ ...draft, challengeDays: days })) : null, [draft, days]);
  const quranPlan = useMemo(() => draft ? (draft.coachPlan?.quranPlan || computeQuranPlan({ unit: draft.measurementUnit, currentHifdh: draft.currentHifdhAmount, goalHifdh: draft.goalHifdhAmount, challengeDays: days, murajaaCycleDays: draft.murajaaCycleDays })) : null, [draft, days]);
  const workoutPlan = useMemo(() => draft ? (draft.coachPlan?.workoutPlan || generateWeeklyWorkoutPlan(draft.exerciseTypes || [], Number(draft.workoutDays || 4), draft.injuries || [])) : [], [draft]);

  async function start() {
    if (!draft || !userId || !bodyPlan || !quranPlan) return;
    const supabase = createSupabaseBrowserClient();
    const today = localTodayKey();
    const selectedStart = draft.startDate || today;
    const nextDraft = { ...draft, calorieTarget: String(bodyPlan.dailyTarget), stepTarget: String(bodyPlan.dailySteps), waterTarget: String(bodyPlan.dailyWaterCups), workoutMinutes: String(bodyPlan.exerciseMinPerSession), workoutDays: String(bodyPlan.exerciseDaysPerWeek), dailyMemorizeGoal: String(Math.round(quranPlan.newPerDay * 10) / 10), dailyReviewGoal: String(quranPlan.murajaaPerDay), coachPlan: { bodyPlan, quranPlan, workoutPlan }, startDate: selectedStart, challenge_started_at: selectedStart, challenge_started_local_date: selectedStart, challenge_status: selectedStart > today ? "scheduled" : "active" };
    await supabase.from("users").update({ onboarding_complete: true, onboarding_draft: nextDraft }).eq("id", userId);
    router.push("/dashboard");
  }

  if (!draft || !bodyPlan || !quranPlan) return <main className={pageBg}><section className={`${cardClass} mx-auto max-w-xl`}>Building your challenge…</section></main>;
  const startsFuture = draft.startDate && draft.startDate > localTodayKey();
  const totalDailyMinutes = Math.round(quranPlan.dailyMinutes + (bodyPlan.exerciseMinPerSession * bodyPlan.exerciseDaysPerWeek) / 7 + 20);

  return <main className={pageBg}><div className="mx-auto max-w-4xl space-y-5"><section className="rounded-[2rem] bg-slate-950 p-8 text-center text-white"><p className="text-lg font-black text-emerald-300">Bismillāh.</p><h1 className="mt-2 text-4xl font-black">Your {days}-day Challenge is ready.</h1><p className="mt-3 text-slate-300">Review the plan. Adjust if needed. Then commit.</p>{startsFuture && <p className="mx-auto mt-4 max-w-2xl rounded-2xl bg-amber-100 p-4 text-sm font-bold text-amber-950">Your challenge is scheduled to start on {draft.startDate}. Check-ins unlock on that date.</p>}</section>
    <PlanCard title="BODY — Quwwah" items={[`${draft.currentWeightLbs} lbs → ${draft.goalWeightLbs} lbs (${Math.abs(bodyPlan.weeklyChange)} lbs/week)`, `${bodyPlan.dailyTarget} kcal/day • ${bodyPlan.dailySteps.toLocaleString()} steps • ${bodyPlan.dailyWaterCups} cups water`, `${bodyPlan.exerciseDaysPerWeek} workouts/week • ${bodyPlan.exerciseMinPerSession} min/session`]} />
    <PlanCard title="IMAAN — Qur'an & Worship" items={[`${quranPlan.newAmount} new ${quranPlan.unit} over ${days} days`, `Murajaa: ${quranPlan.murajaaPerDay} ${quranPlan.unit}/day (cycle every ${quranPlan.murajaaCycleDays} days)`, `Estimated Qur'an time: ~${quranPlan.dailyMinutes} min/day`, `${(draft.worshipGoals || []).join(" • ") || "Worship goals selected"}`]} />
    <PlanCard title="SABR — Limits" items={[`$${draft.spendingLimit || "300"}/month discretionary spending`, `${draft.restaurantLimit || "4"} restaurant visits/month`, `${draft.screenLimit || "3"} hours/day total screen time`]} />
    <PlanCard title="NIYYAH — Personal Goals" items={[`${draft.goal1 || "Goal 1"}: ${draft.goal1Task || "daily task"} — ${draft.goal1Days || 5} days/week`, `${draft.goal2 || "Goal 2"}: ${draft.goal2Task || "daily task"} — ${draft.goal2Days || 5} days/week`]} />
    <section className={cardClass}><p className="text-sm font-black text-emerald-700">Weekly Workout</p><div className="mt-4 grid gap-2 md:grid-cols-2">{workoutPlan.map((item: any) => <div key={item.day} className="rounded-2xl bg-slate-50 p-3 text-sm"><span className="font-black">{item.day}</span> — {item.minutes ? `${item.minutes} min • ` : ""}{item.name}</div>)}</div></section>
    <PlanCard title="ADAB — Character" items={["3 small daily tasks", "1 weekly big task", "Daily reflection", "Joy task + family/service opportunities"]} />
    <section className="rounded-[2rem] bg-emerald-100 p-5 text-center text-emerald-950"><p className="text-sm font-bold">Estimated daily time</p><p className="mt-1 text-4xl font-black">~{totalDailyMinutes} min/day</p></section>
    <div className="flex flex-wrap justify-center gap-3"><button onClick={() => router.push("/onboarding")} className="rounded-full bg-slate-100 px-5 py-3 font-bold">Adjust my plan</button><button onClick={start} className="rounded-full bg-emerald-600 px-6 py-3 font-black text-white">{startsFuture ? "Bismillāh — Schedule Challenge" : "Bismillāh — Start Day 1"}</button></div>
  </div></main>;
}

function PlanCard({ title, items }: { title: string; items: string[] }) { return <section className={cardClass}><p className="text-sm font-black text-emerald-700">{title}</p><ul className="mt-3 space-y-2">{items.map((item) => <li key={item} className="rounded-2xl bg-slate-50 p-3 text-sm font-bold text-slate-700">• {item}</li>)}</ul></section>; }
