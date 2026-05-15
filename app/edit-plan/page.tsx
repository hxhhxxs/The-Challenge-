"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { cardClass, inputClass, pageBg } from "@/lib/challenge-ui";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureUserRecord } from "@/lib/supabase/ensure-user-record";
import { computeBodyPlan, computeQuranPlan, daysBetween, generateWeeklyWorkoutPlan, limitFields } from "@/lib/onboarding-coach";

const exerciseTypes = ["walking", "boxing", "gym", "bodyweight", "swimming", "running", "cycling", "sports", "yoga"];
const injuries = ["none", "knee", "back", "shoulder", "asthma", "low stamina"];

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return <label className="block"><span className="text-sm font-bold text-slate-700">{label}</span><div className="mt-1">{children}</div>{hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}</label>;
}

function ChipGroup({ options, values, onChange }: { options: string[]; values: string[]; onChange: (values: string[]) => void }) {
  const safeValues = Array.isArray(values) ? values : [];
  return <div className="flex flex-wrap gap-2">{options.map((option) => <button type="button" key={option} onClick={() => safeValues.includes(option) ? onChange(safeValues.filter((x) => x !== option)) : onChange([...safeValues, option])} className={`rounded-full px-4 py-2 text-sm font-bold ${safeValues.includes(option) ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"}`}>{option}</button>)}</div>;
}

export default function EditPlanPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [draft, setDraft] = useState<Record<string, any> | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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

  function set(key: string, value: any) { setDraft((current) => ({ ...(current || {}), [key]: value })); }

  const challengeDays = useMemo(() => draft ? daysBetween(draft.startDate, draft.endDate) : 90, [draft]);
  const bodyPlan = useMemo(() => draft ? computeBodyPlan({ ...draft, challengeDays }) : null, [draft, challengeDays]);
  const quranPlan = useMemo(() => draft ? computeQuranPlan({ unit: draft.measurementUnit, currentHifdh: draft.currentHifdhAmount, goalHifdh: draft.goalHifdhAmount, challengeDays, murajaaCycleDays: draft.murajaaCycleDays }) : null, [draft, challengeDays]);
  const workoutPlan = useMemo(() => draft ? generateWeeklyWorkoutPlan(draft.exerciseTypes || [], Number(draft.workoutDays || bodyPlan?.exerciseDaysPerWeek || 4), draft.injuries || []) : [], [draft, bodyPlan]);

  async function savePlan() {
    if (!draft || !userId || !bodyPlan || !quranPlan) return;
    setSaving(true); setError(""); setMessage("");
    const nextDraft = {
      ...draft,
      calorieTarget: String(bodyPlan.dailyTarget),
      stepTarget: String(bodyPlan.dailySteps),
      waterTarget: String(bodyPlan.dailyWaterCups),
      workoutMinutes: String(bodyPlan.exerciseMinPerSession),
      workoutDays: String(bodyPlan.exerciseDaysPerWeek),
      dailyMemorizeGoal: String(Math.round(quranPlan.newPerDay * 10) / 10),
      dailyReviewGoal: String(quranPlan.murajaaPerDay),
      coachPlan: { bodyPlan, quranPlan, workoutPlan },
      planUpdatedAt: new Date().toISOString(),
    };
    const supabase = createSupabaseBrowserClient();
    const { error: saveError } = await supabase.from("users").update({ onboarding_draft: nextDraft }).eq("id", userId);
    setSaving(false);
    if (saveError) { setError(saveError.message); return; }
    setDraft(nextDraft);
    setMessage("Plan updated. Your Log page will use these targets now.");
    setTimeout(() => setMessage(""), 2500);
  }

  if (!draft || !bodyPlan || !quranPlan) return <main className={pageBg}><section className={`${cardClass} mx-auto max-w-xl`}>Loading your plan…</section><BottomNav /></main>;

  return <main className={pageBg}><div className="mx-auto max-w-6xl space-y-6"><section className="rounded-[2rem] bg-slate-950 p-6 text-white"><p className="text-sm font-bold text-emerald-300">Edit Plan</p><h1 className="mt-1 text-4xl font-black">Adjust your challenge without restarting.</h1><p className="mt-2 max-w-2xl text-slate-300">Change targets, Qur'an plan, workouts, personal goals, and limits. The Log page updates after saving.</p></section>{message && <p className="rounded-2xl bg-emerald-50 p-4 text-sm font-black text-emerald-800">{message}</p>}{error && <p className="rounded-2xl bg-red-50 p-4 text-sm font-black text-red-700">{error}</p>}

    <section className={cardClass}><p className="text-sm font-black text-emerald-700">Challenge dates</p><div className="mt-4 grid gap-4 md:grid-cols-2"><Field label="Start date"><input className={inputClass} type="date" value={draft.startDate || ""} onChange={(e) => set("startDate", e.target.value)} /></Field><Field label="End date" hint={`${challengeDays} total days`}><input className={inputClass} type="date" value={draft.endDate || ""} onChange={(e) => set("endDate", e.target.value)} /></Field></div></section>

    <section className={cardClass}><p className="text-sm font-black text-emerald-700">Body targets</p><div className="mt-4 grid gap-4 md:grid-cols-3"><Field label="Current weight (lbs)"><input className={inputClass} type="number" value={draft.currentWeightLbs || ""} onChange={(e) => set("currentWeightLbs", e.target.value)} /></Field><Field label="Goal weight (lbs)"><input className={inputClass} type="number" value={draft.goalWeightLbs || ""} onChange={(e) => set("goalWeightLbs", e.target.value)} /></Field><Field label="Activity level"><select className={inputClass} value={draft.activityLevel || "Moderate"} onChange={(e) => set("activityLevel", e.target.value)}>{["Sedentary", "Light", "Moderate", "Active"].map((x) => <option key={x}>{x}</option>)}</select></Field></div><div className="mt-5 grid gap-3 md:grid-cols-4"><PlanPill label="Calories" value={`${bodyPlan.dailyTarget} kcal/day`} /><PlanPill label="Water" value={`${bodyPlan.dailyWaterCups} cups/day`} /><PlanPill label="Steps" value={`${bodyPlan.dailySteps.toLocaleString()}/day`} /><PlanPill label="Exercise" value={`${bodyPlan.exerciseMinPerSession} min • ${bodyPlan.exerciseDaysPerWeek}x/wk`} /></div></section>

    <section className={cardClass}><p className="text-sm font-black text-emerald-700">Sleep & Fajr</p><div className="mt-4 grid gap-4 md:grid-cols-3"><Field label="City"><input className={inputClass} value={draft.city || ""} onChange={(e) => set("city", e.target.value)} placeholder="Chicago, US" /></Field><Field label="Target bedtime"><input className={inputClass} type="time" value={draft.bedtime || ""} onChange={(e) => set("bedtime", e.target.value)} /></Field><Field label="Target wake-up"><input className={inputClass} type="time" value={draft.wakeTime || ""} onChange={(e) => set("wakeTime", e.target.value)} /></Field></div></section>

    <section className={cardClass}><p className="text-sm font-black text-emerald-700">Qur'an plan</p><div className="mt-4 grid gap-4 md:grid-cols-4"><Field label="Unit"><select className={inputClass} value={draft.measurementUnit || "pages"} onChange={(e) => set("measurementUnit", e.target.value)}>{["lines", "pages", "surahs", "juz"].map((x) => <option key={x}>{x}</option>)}</select></Field><Field label="Current hifdh"><input className={inputClass} type="number" value={draft.currentHifdhAmount || ""} onChange={(e) => set("currentHifdhAmount", e.target.value)} /></Field><Field label="Goal hifdh"><input className={inputClass} type="number" value={draft.goalHifdhAmount || ""} onChange={(e) => set("goalHifdhAmount", e.target.value)} /></Field><Field label="Murajaa cycle"><select className={inputClass} value={draft.murajaaCycleDays || "10"} onChange={(e) => set("murajaaCycleDays", e.target.value)}>{["5", "7", "10", "14", "30"].map((x) => <option key={x}>{x} days</option>)}</select></Field></div><div className="mt-5 grid gap-3 md:grid-cols-3"><PlanPill label="New memorization" value={quranPlan.memorizationSchedule} /><PlanPill label="Murajaa" value={`${quranPlan.murajaaPerDay} ${quranPlan.unit}/day`} /><PlanPill label="Daily time" value={`~${quranPlan.dailyMinutes} min`} /></div></section>

    <section className={cardClass}><p className="text-sm font-black text-emerald-700">Workout plan</p><div className="mt-4 space-y-4"><Field label="Preferred exercise types"><ChipGroup options={exerciseTypes} values={draft.exerciseTypes || []} onChange={(v) => set("exerciseTypes", v)} /></Field><Field label="Injuries / limitations"><ChipGroup options={injuries} values={draft.injuries || []} onChange={(v) => set("injuries", v)} /></Field></div><div className="mt-5 grid gap-2 md:grid-cols-2">{workoutPlan.map((item: any) => <div key={item.day} className="rounded-2xl bg-slate-50 p-3 text-sm font-bold"><span className="text-emerald-700">{item.day}</span> — {item.minutes ? `${item.minutes} min • ` : ""}{item.name}</div>)}</div></section>

    <section className={cardClass}><p className="text-sm font-black text-emerald-700">Personal goals</p><div className="mt-4 grid gap-4 md:grid-cols-2"><GoalEditor slot="1" draft={draft} set={set} /><GoalEditor slot="2" draft={draft} set={set} /></div></section>

    <section className={cardClass}><p className="text-sm font-black text-emerald-700">Limits</p><div className="mt-4 grid gap-4 md:grid-cols-3">{limitFields.map((field) => <Field key={field.key} label={field.label} hint={field.hint}><input className={inputClass} type="number" value={draft[field.key] || ""} placeholder={field.defaultValue} onChange={(e) => set(field.key, e.target.value)} /></Field>)}</div></section>

    <div className="sticky bottom-24 z-10 rounded-[2rem] bg-white/95 p-4 shadow-2xl backdrop-blur"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><p className="text-sm font-bold text-slate-600">Save to update your daily Log targets.</p><button onClick={savePlan} disabled={saving} className="rounded-full bg-emerald-600 px-6 py-3 font-black text-white disabled:opacity-60">{saving ? "Saving..." : "Save updated plan"}</button></div></div>
  </div><BottomNav /></main>;
}

function PlanPill({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl bg-emerald-50 p-4"><p className="text-xs font-black text-emerald-700">{label}</p><p className="mt-1 text-sm font-black text-slate-950">{value}</p></div>; }
function GoalEditor({ slot, draft, set }: { slot: "1" | "2"; draft: Record<string, any>; set: (key: string, value: any) => void }) { return <div className="rounded-2xl bg-slate-50 p-4"><Field label={`Goal ${slot} name`}><input className={inputClass} value={draft[`goal${slot}`] || ""} onChange={(e) => set(`goal${slot}`, e.target.value)} placeholder="Boxing" /></Field><Field label="Daily task"><input className={inputClass} value={draft[`goal${slot}Task`] || ""} onChange={(e) => set(`goal${slot}Task`, e.target.value)} placeholder="Practice for 20 minutes" /></Field><Field label="Days per week"><input className={inputClass} type="number" min={1} max={7} value={draft[`goal${slot}Days`] || "5"} onChange={(e) => set(`goal${slot}Days`, e.target.value)} /></Field></div>; }
