"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { defaultOnboardingDraft, ensureUserRecord } from "@/lib/supabase/ensure-user-record";
import { cardClass, inputClass, pageBg } from "@/lib/challenge-ui";

type Draft = Record<string, any>;

const feet = ["4", "5", "6", "7"];
const inches = Array.from({ length: 12 }, (_, index) => String(index));
const steps = ["3000", "5000", "7500", "10000", "12000", "15000", "20000", "25000", "30000", "40000"];
const water = ["3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const goals = ["Boxing", "Hygiene", "School", "Business", "Reading", "Confidence", "Sleep schedule", "Money", "Cleaning", "Family", "Character"];
const taskSuggestions = ["Practice boxing footwork for 20 min", "Clean the kitchen and do dishes", "Read 10 pages and write one note", "Work on business outreach for 30 min"];
const exerciseTypes = ["walking", "boxing", "gym", "bodyweight", "swimming", "running", "cycling", "sports", "yoga"];
const equipment = ["none", "dumbbells", "full home gym", "gym membership", "boxing gear", "pool"];
const injuries = ["none", "knee", "back", "shoulder", "asthma", "low stamina"];
const worship = ["5 daily salah on time", "daily dhikr", "daily dua", "masjid 3x/week", "Islamic learning daily"];

function daysBetween(start?: string, end?: string) {
  if (!start || !end) return 0;
  return Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1);
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return <label className="block"><span className="text-sm font-bold text-slate-700">{label}</span><div className="mt-1">{children}</div>{hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}</label>;
}

function Select({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: string[]; label: string }) {
  return <Field label={label}><select className={inputClass} value={value || ""} onChange={(e) => onChange(e.target.value)}><option value="">Select</option>{options.map((o) => <option key={o} value={o}>{o}</option>)}</select></Field>;
}

function ChipGroup({ options, values, onChange }: { options: string[]; values: string[]; onChange: (v: string[]) => void }) {
  const safeValues = Array.isArray(values) ? values : values ? [String(values)] : [];
  return <div className="flex flex-wrap gap-2">{options.map((option) => <button type="button" key={option} onClick={() => safeValues.includes(option) ? onChange(safeValues.filter((x) => x !== option)) : onChange([...safeValues, option])} className={`rounded-full px-4 py-2 text-sm font-bold ${safeValues.includes(option) ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"}`}>{option}</button>)}</div>;
}

const stepTitles = ["Welcome", "Basic Info", "Challenge Length", "Sleep & Wake", "Body Goals", "Exercise", "Qur'an & Worship", "Personal Goal 1", "Personal Goal 2", "Limits & Privacy"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState("");
  const [draft, setDraft] = useState<Draft>({});

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) { router.push("/login"); return; }
      const record = await ensureUserRecord(data.user);
      setUserId(record.id);
      const saved = (record.onboarding_draft || {}) as Draft;
      setDraft({ ...(defaultOnboardingDraft(record.name) as Draft), heightFeet: "5", heightInches: "10", workoutMinutes: "45", workoutDays: "5", measurementUnit: "lines", ...saved });
    }
    load();
  }, [router]);

  async function save(nextStep?: number) {
    if (!userId) return;
    const supabase = createSupabaseBrowserClient();
    await supabase.from("users").update({ onboarding_draft: draft }).eq("id", userId);
    if (nextStep) setStep(nextStep);
  }

  function set(key: string, value: any) { setDraft((d) => ({ ...d, [key]: value })); }

  function validateCurrentStep() {
    if (step === 2 && (!draft.age || Number(draft.age) < 13 || Number(draft.age) > 100 || !draft.gender || !draft.heightFeet || !draft.heightInches || !draft.currentWeightLbs || !draft.goalWeightLbs || Number(draft.currentWeightLbs) < 50 || Number(draft.currentWeightLbs) > 700 || Number(draft.goalWeightLbs) < 50 || Number(draft.goalWeightLbs) > 700)) return "Complete your basic info. Age must be 13–100 and weight must be 50–700 lbs.";
    if (step === 3 && (!draft.startDate || !draft.endDate || daysBetween(draft.startDate, draft.endDate) < 30 || daysBetween(draft.startDate, draft.endDate) > 365)) return "Challenge must be 30 to 365 days.";
    if (step === 4 && (!draft.wakeTime || !draft.bedtime || !draft.currentSleepHours)) return "Complete your sleep and wake goals.";
    if (step === 5 && (!draft.calorieTarget || !draft.stepTarget || !draft.waterTarget || !draft.activityLevel || !draft.exerciseExperience)) return "Complete body goals.";
    if (step === 6 && (!draft.exerciseTypes?.length || !draft.equipment?.length || !draft.workoutMinutes || Number(draft.workoutMinutes) <= 0 || !draft.workoutDays || Number(draft.workoutDays) < 1 || Number(draft.workoutDays) > 7 || !draft.injuries?.length)) return "Complete exercise preferences. Days per week must be 1–7.";
    if (step === 7 && ((!draft.currentHifdhAmount && draft.currentHifdhAmount !== 0) || (!draft.goalHifdhAmount && draft.goalHifdhAmount !== 0) || !draft.measurementUnit || !draft.dailyMemorizeGoal || !draft.dailyReviewGoal || !draft.worshipGoals?.length)) return "Complete Qur'an and worship goals.";
    if (step === 8 && (!draft.goal1 || !draft.goal1Why || String(draft.goal1Why).trim().length < 20 || !draft.goal1End || String(draft.goal1End).trim().length < 20 || !draft.goal1Task || String(draft.goal1Task).trim().length < 10 || !draft.goal1Days || !draft.goal1Proof)) return "Complete Personal Goal 1. Why/end goal need at least one full sentence, and daily task needs at least 10 characters.";
    if (step === 9 && (!draft.goal2 || !draft.goal2Why || String(draft.goal2Why).trim().length < 20 || !draft.goal2End || String(draft.goal2End).trim().length < 20 || !draft.goal2Task || String(draft.goal2Task).trim().length < 10 || !draft.goal2Days || !draft.goal2Proof)) return "Complete Personal Goal 2. Why/end goal need at least one full sentence, and daily task needs at least 10 characters.";
    return "";
  }

  async function next() {
    const error = validateCurrentStep();
    if (error) { setMessage(error); return; }
    setMessage("");
    if (step < 10) await save(step + 1);
    else await save();
  }

  async function buildPlan() {
    const supabase = createSupabaseBrowserClient();
    await supabase.from("users").update({ onboarding_draft: draft, onboarding_complete: false }).eq("id", userId);
    router.push("/onboarding/plan");
  }

  const challengeDays = useMemo(() => daysBetween(draft.startDate, draft.endDate), [draft.startDate, draft.endDate]);
  const qUnit = draft.measurementUnit || "lines";
  const sleepLine = draft.currentSleepHours ? Number(draft.currentSleepHours) < 6 ? `Only ${draft.currentSleepHours} hours — that's low` : Number(draft.currentSleepHours) > 10 ? `${draft.currentSleepHours} hours — that's high` : `That's ${draft.currentSleepHours} hours of sleep ✓` : "";

  return <main className={pageBg}><div className="mx-auto max-w-4xl space-y-5"><section className="rounded-[2rem] bg-slate-950 p-6 text-white"><p className="text-sm font-bold text-emerald-300">Step {step} of 10</p><h1 className="mt-1 text-3xl font-black">{stepTitles[step - 1]}</h1><div className="mt-4 grid grid-cols-10 gap-1">{Array.from({ length: 10 }, (_, i) => <div key={i} className={`h-2 rounded-full ${i < step ? "bg-emerald-400" : "bg-white/10"}`} />)}</div></section><section className={cardClass}>{step === 1 && <div><h2 className="text-2xl font-black">Hey {draft.name || "Challenger"} — let's build your challenge.</h2><p className="mt-3 text-slate-600">This takes about 10 minutes. Be honest. The plan only works if the inputs are real.</p></div>}{step === 2 && <div className="grid gap-4 md:grid-cols-2"><Field label="Unit system"><div className="flex gap-2"><button onClick={() => set("unitSystem", "imperial")} className={`rounded-full px-4 py-2 text-sm font-black ${draft.unitSystem !== "metric" ? "bg-emerald-600 text-white" : "bg-slate-100"}`}>Imperial</button><button onClick={() => set("unitSystem", "metric")} className={`rounded-full px-4 py-2 text-sm font-black ${draft.unitSystem === "metric" ? "bg-emerald-600 text-white" : "bg-slate-100"}`}>Metric</button></div></Field><Field label="Age"><input className={inputClass} type="number" min={13} max={100} value={draft.age || ""} onChange={(e) => set("age", e.target.value)} /></Field><Select label="Gender" value={draft.gender || ""} onChange={(v) => set("gender", v)} options={["Male", "Female", "Prefer not to say"]} />{draft.unitSystem === "metric" ? <Field label="Height (cm)"><input className={inputClass} type="number" value={draft.heightCm || ""} onChange={(e) => set("heightCm", e.target.value)} /></Field> : <><Select label="Height feet" value={draft.heightFeet || "5"} onChange={(v) => set("heightFeet", v)} options={feet} /><Select label="Height inches" value={draft.heightInches || "10"} onChange={(v) => set("heightInches", v)} options={inches} /></>}<Field label={draft.unitSystem === "metric" ? "Current weight (kg)" : "Current weight (lbs)"}><input className={inputClass} type="number" min={draft.unitSystem === "metric" ? 23 : 50} max={draft.unitSystem === "metric" ? 320 : 700} value={draft.currentWeightLbs || ""} onChange={(e) => set("currentWeightLbs", e.target.value)} /></Field><Field label={draft.unitSystem === "metric" ? "Goal weight (kg)" : "Goal weight (lbs)"}><input className={inputClass} type="number" min={draft.unitSystem === "metric" ? 23 : 50} max={draft.unitSystem === "metric" ? 320 : 700} value={draft.goalWeightLbs || ""} onChange={(e) => set("goalWeightLbs", e.target.value)} /></Field></div>}{step === 3 && <div className="grid gap-4 md:grid-cols-2"><Field label="Start date"><input className={inputClass} type="date" value={draft.startDate || ""} onChange={(e) => set("startDate", e.target.value)} /></Field><Field label="End date"><input className={inputClass} type="date" value={draft.endDate || ""} onChange={(e) => set("endDate", e.target.value)} /></Field><div className="md:col-span-2 flex flex-wrap gap-2">{[30,60,90,180].map((days) => <button key={days} onClick={() => { const start = draft.startDate || new Date().toISOString().slice(0,10); const end = new Date(new Date(start).getTime() + (days - 1) * 86400000).toISOString().slice(0,10); setDraft({ ...draft, startDate: start, endDate: end }); }} className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">{days} days</button>)}</div><p className="md:col-span-2 rounded-2xl bg-slate-50 p-4 font-bold">Your challenge is {challengeDays || 0} days. You need about {challengeDays ? (100 / challengeDays).toFixed(1) : "—"} points per day.</p></div>}{step === 4 && <div className="grid gap-4 md:grid-cols-3"><Field label="Wake-up time"><input className={inputClass} type="time" value={draft.wakeTime || "06:30"} onChange={(e) => set("wakeTime", e.target.value)} /></Field><Field label="Bedtime"><input className={inputClass} type="time" value={draft.bedtime || "22:30"} onChange={(e) => set("bedtime", e.target.value)} /></Field><Field label="Current average sleep (hours)"><input className={inputClass} type="number" value={draft.currentSleepHours || ""} onChange={(e) => set("currentSleepHours", e.target.value)} /></Field>{sleepLine && <p className="rounded-2xl bg-slate-50 p-4 font-bold md:col-span-3">{sleepLine}</p>}</div>}{step === 5 && <div className="grid gap-4 md:grid-cols-2"><Field label="Daily calorie target"><div className="flex gap-2"><input className={inputClass} type="number" value={draft.calorieTarget || "2200"} onChange={(e) => set("calorieTarget", e.target.value)} /><button onClick={() => { const base = draft.gender === "Female" ? 1800 : 2200; const activity = draft.activityLevel === "Very active" ? 500 : draft.activityLevel === "Moderate" ? 300 : draft.activityLevel === "Light" ? 150 : 0; set("calorieTarget", String(base + activity)); }} className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-black text-white">Calculate</button></div></Field><Select label="Daily step goal" value={draft.stepTarget || "10000"} onChange={(v) => set("stepTarget", v)} options={steps} /><Select label="Water goal (cups)" value={draft.waterTarget || "8"} onChange={(v) => set("waterTarget", v)} options={water} /><Select label="Activity level" value={draft.activityLevel || ""} onChange={(v) => set("activityLevel", v)} options={["Sedentary", "Light", "Moderate", "Very active"]} /><Select label="Exercise experience" value={draft.exerciseExperience || ""} onChange={(v) => set("exerciseExperience", v)} options={["Beginner", "Intermediate", "Advanced"]} /></div>}{step === 6 && <div className="space-y-5"><Field label="Preferred types"><ChipGroup options={exerciseTypes} values={draft.exerciseTypes || []} onChange={(v) => set("exerciseTypes", v)} /></Field><Field label="Equipment access"><ChipGroup options={equipment} values={draft.equipment || []} onChange={(v) => set("equipment", v)} /></Field><div className="grid gap-4 md:grid-cols-2"><Field label="Minutes per workout"><input className={inputClass} type="number" value={draft.workoutMinutes || "45"} onChange={(e) => set("workoutMinutes", e.target.value)} /></Field><Field label="Days per week"><input className={inputClass} type="number" min={1} max={7} step={1} value={draft.workoutDays || "5"} onChange={(e) => set("workoutDays", e.target.value)} /></Field></div><Field label="Injuries / limitations"><ChipGroup options={injuries} values={draft.injuries || []} onChange={(v) => set("injuries", v)} /></Field></div>}{step === 7 && <div className="grid gap-4 md:grid-cols-2"><Select label="Measurement preference" value={qUnit} onChange={(v) => set("measurementUnit", v)} options={["lines", "pages", "surahs", "juz"]} /><Field label={`Current hifdh — ${qUnit} memorized`}><input className={inputClass} type="number" min={0} value={draft.currentHifdhAmount ?? draft.currentHifdhJuz ?? ""} onChange={(e) => set("currentHifdhAmount", e.target.value)} /></Field><Field label={`Goal hifdh — ${qUnit} by end`}><input className={inputClass} type="number" min={0} value={draft.goalHifdhAmount ?? draft.goalHifdhJuz ?? ""} onChange={(e) => set("goalHifdhAmount", e.target.value)} /></Field><Field label={`Daily memorization goal (${qUnit})`}><input className={inputClass} type="number" value={draft.dailyMemorizeGoal || ""} onChange={(e) => set("dailyMemorizeGoal", e.target.value)} /></Field><Field label={`Daily review goal (${qUnit})`}><input className={inputClass} type="number" value={draft.dailyReviewGoal || ""} onChange={(e) => set("dailyReviewGoal", e.target.value)} /></Field><Select label="Tajweed practice" value={draft.tajweedPractice || ""} onChange={(v) => set("tajweedPractice", v)} options={["No", "Daily", "3x/week", "Weekly"]} /><div className="md:col-span-2"><Field label="Worship goals"><ChipGroup options={worship} values={draft.worshipGoals || []} onChange={(v) => set("worshipGoals", v)} /></Field></div></div>}{step === 8 && <PersonalGoalFields slot="1" draft={draft} set={set} />}{step === 9 && <PersonalGoalFields slot="2" draft={draft} set={set} />}{step === 10 && <div className="grid gap-4 md:grid-cols-2">{["spendingLimit","restaurantLimit","fastFoodLimit","goingOutLimit","snackLimit","cheatMealLimit","missedWorkoutLimit","entertainmentLimit","screenLimit","socialLimit","youtubeLimit","shortsLimit","gamingLimit","tvLimit","tvEpisodesWeek"].map((key) => <Field key={key} label={key}><input className={inputClass} type="number" value={draft[key] || ""} onChange={(e) => set(key, e.target.value)} /></Field>)}<label className="flex gap-2 text-sm font-bold"><input type="checkbox" checked={Boolean(draft.noPhoneAfterBed)} onChange={(e) => set("noPhoneAfterBed", e.target.checked)} /> No phone after bedtime</label><label className="flex gap-2 text-sm font-bold"><input type="checkbox" checked={draft.showLeaderboard !== false} onChange={(e) => set("showLeaderboard", e.target.checked)} /> Show me on leaderboard</label></div>}{message && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{message}</p>}<div className="mt-6 flex justify-between gap-3"><button onClick={() => setStep(Math.max(1, step - 1))} className="rounded-full bg-slate-100 px-5 py-3 font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">Back</button>{step < 10 ? <button onClick={next} className="rounded-full bg-emerald-600 px-5 py-3 font-black text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">Next</button> : <button onClick={buildPlan} className="rounded-full bg-emerald-600 px-5 py-3 font-black text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">Build my plan</button>}</div></section></div></main>;
}

function PersonalGoalFields({ slot, draft, set }: { slot: "1" | "2"; draft: Draft; set: (key: string, value: any) => void }) {
  return <div className="space-y-4"><Select label={`Goal ${slot} name`} value={draft[`goal${slot}`] || ""} onChange={(v) => set(`goal${slot}`, v)} options={goals} /><Field label="Why do you want this?" hint="Tell us a bit more — at least one full sentence."><textarea className={inputClass} placeholder="Because I want to feel in control of my health and build a habit I can trust." value={draft[`goal${slot}Why`] || ""} onChange={(e) => set(`goal${slot}Why`, e.target.value)} /></Field><Field label="End goal by end date" hint="At least one full sentence."><textarea className={inputClass} placeholder="Learn jab, cross, and finish 3 rounds without stopping." value={draft[`goal${slot}End`] || ""} onChange={(e) => set(`goal${slot}End`, e.target.value)} /></Field><Field label="Daily task" hint="Minimum 10 characters. Use your own words."><input className={inputClass} placeholder="Practice boxing footwork for 20 min" value={draft[`goal${slot}Task`] || ""} onChange={(e) => set(`goal${slot}Task`, e.target.value)} /></Field><div className="flex flex-wrap gap-2">{taskSuggestions.map((task) => <button key={task} type="button" onClick={() => set(`goal${slot}Task`, task)} className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">{task}</button>)}</div><Field label="Days per week"><input className={inputClass} type="number" min={1} max={7} value={draft[`goal${slot}Days`] || ""} onChange={(e) => set(`goal${slot}Days`, e.target.value)} /></Field><Select label="Proof method" value={draft[`goal${slot}Proof`] || ""} onChange={(v) => set(`goal${slot}Proof`, v)} options={["photo", "log entry", "time tracked", "count", "free text"]} /></div>;
}
