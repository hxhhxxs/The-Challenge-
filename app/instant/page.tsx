"use client";

import { useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureUserRecord, type ChallengeUserRecord } from "@/lib/supabase/ensure-user-record";

type Stage = "auth" | "onboarding" | "dashboard";
type Mode = "signup" | "login";

type Profile = {
  name: string;
  age: string;
  heightFeet: string;
  heightInches: string;
  currentWeightLbs: string;
  goalWeightLbs: string;
  startDate: string;
  endDate: string;
  wakeTime: string;
  calorieTarget: string;
  stepTarget: string;
  waterTarget: string;
  currentHifdh: string;
  goalHifdh: string;
  quranDailyTarget: string;
  quranReviewTarget: string;
  goal1: string;
  goal1Task: string;
  goal2: string;
  goal2Task: string;
};

type CheckIn = {
  date: string;
  calories: string;
  steps: string;
  water: string;
  exerciseMinutes: string;
  quranMemorized: string;
  quranReviewed: string;
  goal1Done: boolean;
  goal2Done: boolean;
  randomTasksDone: string;
  joyDone: boolean;
  mood: string;
  reflection: string;
  points: number;
};

const emptyProfile: Profile = {
  name: "",
  age: "",
  heightFeet: "",
  heightInches: "",
  currentWeightLbs: "",
  goalWeightLbs: "",
  startDate: "",
  endDate: "",
  wakeTime: "",
  calorieTarget: "2200",
  stepTarget: "10000",
  waterTarget: "5",
  currentHifdh: "",
  goalHifdh: "",
  quranDailyTarget: "5",
  quranReviewTarget: "1",
  goal1: "",
  goal1Task: "",
  goal2: "",
  goal2Task: "",
};

const defaultEntry = {
  date: new Date().toISOString().slice(0, 10),
  calories: "",
  steps: "",
  water: "",
  exerciseMinutes: "",
  quranMemorized: "",
  quranReviewed: "",
  goal1Done: false,
  goal2Done: false,
  randomTasksDone: "0",
  joyDone: false,
  mood: "",
  reflection: "",
};

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600";
const cardClass = "rounded-[2rem] bg-white/90 p-6 shadow-xl shadow-emerald-950/5";
const ages = Array.from({ length: 88 }, (_, index) => String(index + 13));
const feet = ["4", "5", "6", "7"];
const inches = Array.from({ length: 12 }, (_, index) => String(index));
const weights = Array.from({ length: 421 }, (_, index) => String(index + 80));
const steps = ["3000", "5000", "7500", "10000", "12000", "15000", "20000", "25000", "30000", "40000"];
const water = ["3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const hifdhOptions = ["0", "1", "2", "3", "5", "10", "15", "20", "25", "30"];
const commonGoals = ["Boxing", "Hygiene", "School", "Business", "Reading", "Confidence", "Sleep schedule", "Money", "Cleaning", "Family", "Character"];
const commonTasks = ["10 minutes daily", "20 minutes daily", "30 minutes daily", "1 hour daily", "Complete checklist", "Practice skill", "Read and reflect", "Clean one area", "No excuses task"];
const smallTasks = ["Drink water before every meal", "Clean your room for 10 minutes", "Call or text a family member", "No sugary drinks today", "Read 5 pages", "Stretch for 10 minutes", "Make your bed", "Give sadaqah, even $1"];
const weeklyTasks = ["Walk 50,000+ total steps this week", "Visit the masjid 3 times", "Deep clean your room or car", "Meal prep for 3 days", "No restaurant/fast food for 7 days", "Help someone quietly"];
const joyTasks = ["Draw something for 20 minutes", "Make a small glass painting", "Cook one healthy meal", "Take 5 creative photos", "Watch the sunset without your phone"];

function ageFromDob(dob: string) {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return String(age);
}

function errorToMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try { return JSON.stringify(error); } catch { return "Unknown error occurred."; }
}

function n(value: string, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function daysBetween(start: string, end: string) {
  if (!start || !end) return 0;
  return Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1);
}

function dayOfChallenge(start: string) {
  if (!start) return 1;
  return Math.max(1, Math.ceil((Date.now() - new Date(start).getTime()) / 86400000) + 1);
}

function pick<T>(bank: T[], count: number, seed: number) {
  const index = Math.abs(seed) % bank.length;
  return [...bank.slice(index), ...bank.slice(0, index)].slice(0, count);
}

function isComplete(profile: Profile) {
  return Object.values(profile).every((value) => String(value).trim().length > 0);
}

function optionLabel(kind: string, value: string) {
  if (!value) return value;
  if (kind === "age") return `${value} years old`;
  if (kind === "feet") return `${value} ft`;
  if (kind === "inches") return `${value} in`;
  if (kind === "weight") return `${value} lbs`;
  if (kind === "steps") return `${Number(value).toLocaleString()} steps/day`;
  if (kind === "water") return `${value} cups/bottles per day`;
  if (kind === "juz") return `${value} juz`;
  return value;
}

function calculatePoints(profile: Profile, entry: typeof defaultEntry) {
  let points = 0;
  points += Math.min(2, n(entry.steps) / Math.max(1, n(profile.stepTarget, 10000)) * 2);
  points += Math.min(1, n(entry.water) / Math.max(1, n(profile.waterTarget, 5)));
  points += Math.min(1.5, n(entry.exerciseMinutes) / 45 * 1.5);
  const target = n(profile.calorieTarget, 2200);
  const calories = n(entry.calories);
  if (calories > 0) points += calories >= target * 0.9 && calories <= target * 1.1 ? 1.5 : 0.5;
  points += Math.min(1.5, n(entry.quranMemorized) / Math.max(1, n(profile.quranDailyTarget, 5)) * 1.5);
  points += Math.min(1, n(entry.quranReviewed) / Math.max(1, n(profile.quranReviewTarget, 1)));
  if (entry.goal1Done) points += 1;
  if (entry.goal2Done) points += 1;
  points += n(entry.randomTasksDone) * 0.5;
  if (entry.joyDone) points += 0.75;
  if (entry.reflection.trim()) points += 0.75;
  return Math.round(points * 10) / 10;
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return <label className="block"><span className="text-sm font-bold text-slate-700">{label}</span><div className="mt-1">{children}</div>{hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}</label>;
}

function SelectField({ label, value, onChange, options, kind = "default", hint }: { label: string; value: string; onChange: (value: string) => void; options: string[]; kind?: string; hint?: string }) {
  return <Field label={label} hint={hint}><select className={inputClass} value={value} onChange={(e) => onChange(e.target.value)}><option value="">Select</option>{options.map((option) => <option key={option} value={option}>{optionLabel(kind, option)}</option>)}</select></Field>;
}

function NumberField({ label, value, onChange, hint, min = 0, max }: { label: string; value: string; onChange: (value: string) => void; hint?: string; min?: number; max?: number }) {
  return <Field label={label} hint={hint}><input className={inputClass} type="number" min={min} max={max} value={value} onChange={(e) => onChange(e.target.value)} /></Field>;
}

function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return <div className="rounded-2xl border border-slate-100 bg-white p-4"><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-black text-slate-950">{value}</p><p className="mt-1 text-xs text-slate-500">{hint}</p></div>;
}

export default function InstantPage() {
  const [stage, setStage] = useState<Stage>("auth");
  const [mode, setMode] = useState<Mode>("signup");
  const [user, setUser] = useState<ChallengeUserRecord | null>(null);
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [form, setForm] = useState({ name: "", username: "", dob: "", email: "", password: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [entry, setEntry] = useState(defaultEntry);
  const [logs, setLogs] = useState<CheckIn[]>([]);

  async function enterApp(authUser: any, starterProfile?: Partial<Profile>) {
    const record = await ensureUserRecord(authUser);
    const nextProfile = { ...emptyProfile, name: record.name, ...(starterProfile || {}) };
    setUser(record);
    setProfile(nextProfile);
    setStage(record.onboarding_complete ? "dashboard" : "onboarding");
  }

  async function createAccount() {
    setBusy(true);
    setMessage("");
    try {
      const email = form.email.trim().toLowerCase();
      const username = form.username.trim().toLowerCase();
      if (!form.name.trim()) throw new Error("Enter your full name.");
      if (!/^[a-z0-9_]{3,20}$/.test(username)) throw new Error("Username must be 3–20 lowercase letters, numbers, or underscores.");
      if (!email) throw new Error("Enter your email.");
      if (form.password.length < 8) throw new Error("Password must be at least 8 characters.");
      if (form.password !== form.confirmPassword) throw new Error("Passwords do not match.");
      if (!form.dob) throw new Error("Enter your date of birth.");

      const supabase = createSupabaseBrowserClient();
      const { data: signupData, error: signupError } = await supabase.auth.signUp({ email, password: form.password, options: { data: { name: form.name.trim(), username, dob: form.dob } } });
      if (signupError) throw signupError;

      const starter = { name: form.name.trim(), age: ageFromDob(form.dob) };
      if (signupData.user && signupData.session) { await enterApp(signupData.user, starter); return; }

      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password: form.password });
      if (loginError) throw new Error(`Account was created but login is blocked: ${loginError.message}`);
      if (!loginData.user) throw new Error("Account created, but Supabase did not return a user session.");
      await enterApp(loginData.user, starter);
    } catch (error) {
      setMessage(`Create account error: ${errorToMessage(error)}`);
    } finally { setBusy(false); }
  }

  async function login() {
    setBusy(true);
    setMessage("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email: form.email.trim().toLowerCase(), password: form.password });
      if (error) throw error;
      if (!data.user) throw new Error("Could not log in.");
      await enterApp(data.user);
    } catch (error) { setMessage(`Login error: ${errorToMessage(error)}`); }
    finally { setBusy(false); }
  }

  async function finishOnboarding() {
    setMessage("");
    if (!user) return;
    if (!isComplete(profile)) { setMessage("Finish every field first. Your plan needs complete info."); return; }
    const supabase = createSupabaseBrowserClient();
    const height = `${profile.heightFeet} ft ${profile.heightInches} in`;
    const onboardingDraft = {
      ...profile,
      height,
      currentWeight: `${profile.currentWeightLbs} lbs`,
      goalWeight: `${profile.goalWeightLbs} lbs`,
      personalGoals: [
        { name: profile.goal1, endGoal: profile.goal1, dailyTask: profile.goal1Task, frequency: "daily", tracking: "Checklist" },
        { name: profile.goal2, endGoal: profile.goal2, dailyTask: profile.goal2Task, frequency: "daily", tracking: "Checklist" },
      ],
    };
    const { error } = await supabase.from("users").update({ onboarding_draft: onboardingDraft, onboarding_complete: true }).eq("id", user.id);
    if (error) { setMessage(error.message); return; }
    setStage("dashboard");
  }

  function submitCheckIn() {
    const points = calculatePoints(profile, entry);
    setLogs([{ ...entry, points }, ...logs]);
    setEntry(defaultEntry);
  }

  const totalPoints = useMemo(() => Math.round(logs.reduce((sum, log) => sum + log.points, 0) * 10) / 10, [logs]);
  const score = Math.min(100, totalPoints);
  const totalDays = daysBetween(profile.startDate, profile.endDate);
  const currentDay = Math.min(totalDays || 1, dayOfChallenge(profile.startDate));
  const expected = totalDays ? Math.round((currentDay / totalDays) * 100) : 0;
  const status = score >= expected + 5 ? "Ahead 🟢" : score >= expected - 5 ? "On track 🔵" : score >= expected - 15 ? "Behind 🟡" : "Danger 🔴";
  const todaysTasks = pick(smallTasks, 3, currentDay + logs.length);
  const weeklyTask = pick(weeklyTasks, 1, Math.floor(currentDay / 7))[0];
  const joyTask = pick(joyTasks, 1, currentDay + 2)[0];

  if (stage === "auth") {
    return <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dcfce7,transparent_32%),#fff8ed] px-4 py-8 text-slate-900"><div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2"><section className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl md:p-12"><p className="mb-4 inline-flex rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-bold text-emerald-200">The Challenge</p><h1 className="text-5xl font-black tracking-tight">Create account. Start immediately.</h1><p className="mt-5 text-lg leading-8 text-slate-300">Create your account, build your plan, and start your mission.</p></section><section className={cardClass}><div className="mb-5 flex rounded-2xl bg-slate-100 p-1"><button onClick={() => setMode("signup")} className={`flex-1 rounded-xl px-4 py-3 text-sm font-black ${mode === "signup" ? "bg-white shadow" : "text-slate-500"}`}>Create account</button><button onClick={() => setMode("login")} className={`flex-1 rounded-xl px-4 py-3 text-sm font-black ${mode === "login" ? "bg-white shadow" : "text-slate-500"}`}>Log in</button></div><div className="space-y-4">{mode === "signup" && <><Field label="Full name"><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field><Field label="Username"><input className={inputClass} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase() })} /></Field><Field label="Date of birth"><input type="date" className={inputClass} value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} /></Field></>}<Field label="Email"><input type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field><Field label="Password"><input type="password" className={inputClass} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>{mode === "signup" && <Field label="Confirm password"><input type="password" className={inputClass} value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} /></Field>}{message && <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">{message}</p>}<button disabled={busy} onClick={mode === "signup" ? createAccount : login} className="w-full rounded-full bg-emerald-600 px-5 py-3 font-black text-white disabled:opacity-50">{busy ? "Working..." : mode === "signup" ? "Create account" : "Log in"}</button></div></section></div></main>;
  }

  if (stage === "onboarding") {
    return <main className="min-h-screen bg-[#fff8ed] px-4 py-8"><div className="mx-auto max-w-7xl space-y-6"><header className="rounded-[2rem] bg-slate-950 p-6 text-white"><p className="text-sm font-bold text-emerald-300">Onboarding</p><h1 className="text-3xl font-black">Build your challenge</h1><p className="mt-2 text-slate-300">Height uses feet/inches. Weight uses pounds. Qur’an and calories are typed as numbers.</p></header><section className={cardClass}><div className="grid gap-4 md:grid-cols-3"><Field label="Name"><input className={inputClass} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></Field><SelectField label="Age" value={profile.age} onChange={(value) => setProfile({ ...profile, age: value })} options={ages} kind="age" /><SelectField label="Height — feet" value={profile.heightFeet} onChange={(value) => setProfile({ ...profile, heightFeet: value })} options={feet} kind="feet" /><SelectField label="Height — inches" value={profile.heightInches} onChange={(value) => setProfile({ ...profile, heightInches: value })} options={inches} kind="inches" /><SelectField label="Current weight" value={profile.currentWeightLbs} onChange={(value) => setProfile({ ...profile, currentWeightLbs: value })} options={weights} kind="weight" /><SelectField label="Goal weight" value={profile.goalWeightLbs} onChange={(value) => setProfile({ ...profile, goalWeightLbs: value })} options={weights} kind="weight" /><Field label="Start date"><input className={inputClass} type="date" value={profile.startDate} onChange={(e) => setProfile({ ...profile, startDate: e.target.value })} /></Field><Field label="End date"><input className={inputClass} type="date" value={profile.endDate} onChange={(e) => setProfile({ ...profile, endDate: e.target.value })} /></Field><Field label="Wake-up time"><input className={inputClass} type="time" value={profile.wakeTime} onChange={(e) => setProfile({ ...profile, wakeTime: e.target.value })} /></Field><NumberField label="Daily calories" value={profile.calorieTarget} onChange={(value) => setProfile({ ...profile, calorieTarget: value })} hint="Example: 2200" min={1200} /><SelectField label="Daily step goal" value={profile.stepTarget} onChange={(value) => setProfile({ ...profile, stepTarget: value })} options={steps} kind="steps" /><SelectField label="Daily water goal" value={profile.waterTarget} onChange={(value) => setProfile({ ...profile, waterTarget: value })} options={water} kind="water" /><SelectField label="Current Qur’an hifdh" value={profile.currentHifdh} onChange={(value) => setProfile({ ...profile, currentHifdh: value })} options={hifdhOptions} kind="juz" /><SelectField label="Goal Qur’an hifdh" value={profile.goalHifdh} onChange={(value) => setProfile({ ...profile, goalHifdh: value })} options={hifdhOptions} kind="juz" /><NumberField label="Daily memorization amount" value={profile.quranDailyTarget} onChange={(value) => setProfile({ ...profile, quranDailyTarget: value })} hint="Number of lines/pages you choose to track" /><NumberField label="Daily review amount" value={profile.quranReviewTarget} onChange={(value) => setProfile({ ...profile, quranReviewTarget: value })} hint="Number of pages/lines reviewed daily" /></div><div className="mt-6 grid gap-4 md:grid-cols-2"><div className="rounded-2xl bg-emerald-50 p-4"><h3 className="font-black">Personal Goal 1</h3><SelectField label="Goal" value={profile.goal1} onChange={(value) => setProfile({ ...profile, goal1: value })} options={commonGoals} /><div className="mt-3"><SelectField label="Daily task" value={profile.goal1Task} onChange={(value) => setProfile({ ...profile, goal1Task: value })} options={commonTasks} /></div></div><div className="rounded-2xl bg-emerald-50 p-4"><h3 className="font-black">Personal Goal 2</h3><SelectField label="Goal" value={profile.goal2} onChange={(value) => setProfile({ ...profile, goal2: value })} options={commonGoals} /><div className="mt-3"><SelectField label="Daily task" value={profile.goal2Task} onChange={(value) => setProfile({ ...profile, goal2Task: value })} options={commonTasks} /></div></div></div>{message && <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{message}</p>}<button onClick={finishOnboarding} className="mt-6 w-full rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Build my plan and enter dashboard</button></section></div></main>;
  }

  return <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dcfce7,transparent_32%),#fff8ed] px-4 py-8"><div className="mx-auto max-w-7xl space-y-6"><section className="rounded-[2rem] bg-slate-950 p-8 text-white"><p className="text-sm font-bold text-emerald-300">Main Dashboard</p><h1 className="text-4xl font-black">Welcome, {profile.name}</h1><p className="mt-2 text-slate-300">Day {currentDay} of {totalDays || "your challenge"}. {status}</p><div className="mt-5 h-4 rounded-full bg-white/10"><div className="h-4 rounded-full bg-emerald-400" style={{ width: `${score}%` }} /></div></section><section className="grid gap-4 md:grid-cols-4"><StatCard label="Score" value={`${score}/100`} hint={`Expected today: ${expected}`} /><StatCard label="Status" value={status} hint="Pace based on challenge dates" /><StatCard label="Weight" value={`${profile.currentWeightLbs} → ${profile.goalWeightLbs} lbs`} hint={`${profile.heightFeet} ft ${profile.heightInches} in`} /><StatCard label="Streak" value={`${logs.length}`} hint="Logged days" /></section><section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"><div className={cardClass}><h2 className="text-2xl font-black">Today’s Mission</h2><div className="mt-5 grid gap-3 md:grid-cols-2">{[`Wake up by ${profile.wakeTime}`, `Calories: ${profile.calorieTarget}`, `Steps: ${Number(profile.stepTarget).toLocaleString()}`, `Water: ${profile.waterTarget} cups/bottles`, `Memorize: ${profile.quranDailyTarget}`, `Review: ${profile.quranReviewTarget}`, `${profile.goal1}: ${profile.goal1Task}`, `${profile.goal2}: ${profile.goal2Task}`].map((item) => <div key={item} className="rounded-2xl bg-slate-50 p-4 text-sm font-bold">{item}</div>)}</div><div className="mt-5 rounded-2xl bg-slate-950 p-5 text-white"><h3 className="font-black text-emerald-300">Random Tasks</h3><ul className="mt-3 space-y-2 text-sm text-slate-200">{todaysTasks.map((task) => <li key={task}>• {task}</li>)}</ul><p className="mt-4 text-sm"><b>Weekly big task:</b> {weeklyTask}</p><p className="mt-2 text-sm"><b>Joy task:</b> {joyTask}</p></div></div><div className={cardClass}><h2 className="text-2xl font-black">Daily Check-In</h2><div className="mt-4 grid gap-3 md:grid-cols-2"><NumberField label="Calories eaten" value={entry.calories} onChange={(value) => setEntry({ ...entry, calories: value })} /><NumberField label="Steps" value={entry.steps} onChange={(value) => setEntry({ ...entry, steps: value })} /><NumberField label="Water" value={entry.water} onChange={(value) => setEntry({ ...entry, water: value })} /><NumberField label="Exercise minutes" value={entry.exerciseMinutes} onChange={(value) => setEntry({ ...entry, exerciseMinutes: value })} /><NumberField label="Qur’an memorized" value={entry.quranMemorized} onChange={(value) => setEntry({ ...entry, quranMemorized: value })} /><NumberField label="Qur’an reviewed" value={entry.quranReviewed} onChange={(value) => setEntry({ ...entry, quranReviewed: value })} /><SelectField label="Random tasks done" value={entry.randomTasksDone} onChange={(value) => setEntry({ ...entry, randomTasksDone: value })} options={["0", "1", "2", "3"]} /><NumberField label="Mood 1-10" value={entry.mood} onChange={(value) => setEntry({ ...entry, mood: value })} min={1} max={10} /></div><div className="mt-4 grid gap-2 text-sm font-bold"><label><input type="checkbox" checked={entry.goal1Done} onChange={(e) => setEntry({ ...entry, goal1Done: e.target.checked })} /> Goal 1 done</label><label><input type="checkbox" checked={entry.goal2Done} onChange={(e) => setEntry({ ...entry, goal2Done: e.target.checked })} /> Goal 2 done</label><label><input type="checkbox" checked={entry.joyDone} onChange={(e) => setEntry({ ...entry, joyDone: e.target.checked })} /> Joy task done</label><textarea className={inputClass} rows={3} placeholder="One sentence reflection" value={entry.reflection} onChange={(e) => setEntry({ ...entry, reflection: e.target.value })} /></div><button onClick={submitCheckIn} className="mt-5 w-full rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Lock in today</button></div></section><section className="grid gap-6 lg:grid-cols-3"><div className={cardClass}><h2 className="text-xl font-black">Progress</h2><p className="mt-2 text-sm text-slate-600">Body, Qur’an, discipline, personal goals, and character scoring will expand here.</p><div className="mt-4 h-3 rounded-full bg-slate-100"><div className="h-3 rounded-full bg-emerald-500" style={{ width: `${score}%` }} /></div></div><div className={cardClass}><h2 className="text-xl font-black">Monthly Limits</h2><p className="mt-2 text-sm text-slate-600">Spending, restaurants, screen time, and TV limits will be tracked here.</p></div><div className={cardClass}><h2 className="text-xl font-black">Leaderboard</h2><p className="mt-2 rounded-2xl bg-slate-50 p-4 text-sm font-bold text-slate-600">No one here yet. Show up first.</p></div></section><section className="rounded-[2rem] bg-slate-950 p-6 text-white"><h2 className="text-2xl font-black">Recent Check-Ins</h2>{logs.length === 0 ? <p className="mt-4 text-slate-300">No check-ins yet.</p> : logs.map((log, index) => <div key={index} className="mt-3 rounded-2xl bg-white/10 p-4"><p className="font-bold">{log.date} • {log.points} points</p><p className="text-sm text-slate-300">Calories {log.calories || "—"} • Steps {log.steps || "—"} • Qur’an {log.quranMemorized || "—"}</p></div>)}</section></div></main>;
}
