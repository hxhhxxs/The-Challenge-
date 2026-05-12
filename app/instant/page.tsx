"use client";

import { useState } from "react";
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
  quranDailyTarget: "5 lines",
  quranReviewTarget: "1 page",
  goal1: "",
  goal1Task: "",
  goal2: "",
  goal2Task: "",
};

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600";
const cardClass = "rounded-[2rem] bg-white/90 p-6 shadow-xl shadow-emerald-950/5";
const ages = Array.from({ length: 88 }, (_, index) => String(index + 13));
const feet = ["4", "5", "6", "7"];
const inches = Array.from({ length: 12 }, (_, index) => String(index));
const weights = Array.from({ length: 421 }, (_, index) => String(index + 80));
const calories = Array.from({ length: 25 }, (_, index) => String(1200 + index * 100));
const steps = ["3000", "5000", "7500", "10000", "12000", "15000", "20000", "25000", "30000", "40000"];
const water = ["3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const hifdhOptions = ["None", "Few surahs", "1 juz", "2 juz", "3 juz", "5 juz", "10 juz", "15 juz", "20 juz", "25 juz", "30 juz"];
const quranTargets = ["1 line", "3 lines", "5 lines", "10 lines", "1 page", "2 pages", "1 surah", "Custom later"];
const commonGoals = ["Boxing", "Hygiene", "School", "Business", "Reading", "Confidence", "Sleep schedule", "Money", "Cleaning", "Family", "Character"];
const commonTasks = ["10 minutes daily", "20 minutes daily", "30 minutes daily", "1 hour daily", "Complete checklist", "Practice skill", "Read and reflect", "Clean one area", "No excuses task"];

function ageFromDob(dob: string) {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return String(age);
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
  if (kind === "calories") return `${value} calories/day`;
  if (kind === "steps") return `${Number(value).toLocaleString()} steps/day`;
  if (kind === "water") return `${value} cups/bottles per day`;
  return value;
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <div className="mt-1">{children}</div>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </label>
  );
}

function SelectField({ label, value, onChange, options, kind = "default", hint }: { label: string; value: string; onChange: (value: string) => void; options: string[]; kind?: string; hint?: string }) {
  return (
    <Field label={label} hint={hint}>
      <select className={inputClass} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select</option>
        {options.map((option) => <option key={option} value={option}>{optionLabel(kind, option)}</option>)}
      </select>
    </Field>
  );
}

export default function InstantPage() {
  const [stage, setStage] = useState<Stage>("auth");
  const [mode, setMode] = useState<Mode>("signup");
  const [user, setUser] = useState<ChallengeUserRecord | null>(null);
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [form, setForm] = useState({ name: "", username: "", dob: "", email: "", password: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

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
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email,
        password: form.password,
        options: { data: { name: form.name.trim(), username, dob: form.dob } },
      });
      if (signupError) throw signupError;

      const starter = { name: form.name.trim(), age: ageFromDob(form.dob) };
      if (signupData.user && signupData.session) {
        await enterApp(signupData.user, starter);
        return;
      }

      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password: form.password });
      if (loginError) {
        throw new Error(`Account was created but login is still blocked by Supabase: ${loginError.message}. In Supabase, turn OFF Authentication > Sign In / Providers > Email > Confirm email, then create a new test account.`);
      }
      if (!loginData.user) throw new Error("Account created, but Supabase did not return a user session.");
      await enterApp(loginData.user, starter);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create account.");
    } finally {
      setBusy(false);
    }
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
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Wrong email or password.");
    } finally {
      setBusy(false);
    }
  }

  async function finishOnboarding() {
    setMessage("");
    if (!user) return;
    if (!isComplete(profile)) {
      setMessage("Finish every field first. Your plan needs complete info.");
      return;
    }
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
    if (error) {
      setMessage(error.message);
      return;
    }
    setStage("dashboard");
  }

  if (stage === "auth") {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dcfce7,transparent_32%),#fff8ed] px-4 py-8 text-slate-900">
        <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2">
          <section className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl md:p-12">
            <p className="mb-4 inline-flex rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-bold text-emerald-200">The Challenge</p>
            <h1 className="text-5xl font-black tracking-tight">Create account. Start immediately.</h1>
            <p className="mt-5 text-lg leading-8 text-slate-300">No email verification flow. After signup, you go straight to onboarding.</p>
          </section>
          <section className={cardClass}>
            <div className="mb-5 flex rounded-2xl bg-slate-100 p-1">
              <button onClick={() => setMode("signup")} className={`flex-1 rounded-xl px-4 py-3 text-sm font-black ${mode === "signup" ? "bg-white shadow" : "text-slate-500"}`}>Create account</button>
              <button onClick={() => setMode("login")} className={`flex-1 rounded-xl px-4 py-3 text-sm font-black ${mode === "login" ? "bg-white shadow" : "text-slate-500"}`}>Log in</button>
            </div>
            <div className="space-y-4">
              {mode === "signup" && (
                <>
                  <Field label="Full name"><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
                  <Field label="Username"><input className={inputClass} value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase() })} /></Field>
                  <Field label="Date of birth"><input type="date" className={inputClass} value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} /></Field>
                </>
              )}
              <Field label="Email"><input type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
              <Field label="Password"><input type="password" className={inputClass} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
              {mode === "signup" && <Field label="Confirm password"><input type="password" className={inputClass} value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} /></Field>}
              {message && <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">{message}</p>}
              <button disabled={busy} onClick={mode === "signup" ? createAccount : login} className="w-full rounded-full bg-emerald-600 px-5 py-3 font-black text-white disabled:opacity-50">{busy ? "Working..." : mode === "signup" ? "Create account" : "Log in"}</button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (stage === "onboarding") {
    return (
      <main className="min-h-screen bg-[#fff8ed] px-4 py-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <header className="rounded-[2rem] bg-slate-950 p-6 text-white">
            <p className="text-sm font-bold text-emerald-300">Onboarding</p>
            <h1 className="text-3xl font-black">Build your challenge</h1>
            <p className="mt-2 text-slate-300">Select your information. Height is feet/inches and weight is pounds only.</p>
          </header>
          <section className={cardClass}>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Name"><input className={inputClass} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></Field>
              <SelectField label="Age" value={profile.age} onChange={(value) => setProfile({ ...profile, age: value })} options={ages} kind="age" />
              <SelectField label="Height — feet" value={profile.heightFeet} onChange={(value) => setProfile({ ...profile, heightFeet: value })} options={feet} kind="feet" />
              <SelectField label="Height — inches" value={profile.heightInches} onChange={(value) => setProfile({ ...profile, heightInches: value })} options={inches} kind="inches" />
              <SelectField label="Current weight" value={profile.currentWeightLbs} onChange={(value) => setProfile({ ...profile, currentWeightLbs: value })} options={weights} kind="weight" />
              <SelectField label="Goal weight" value={profile.goalWeightLbs} onChange={(value) => setProfile({ ...profile, goalWeightLbs: value })} options={weights} kind="weight" />
              <Field label="Start date"><input className={inputClass} type="date" value={profile.startDate} onChange={(e) => setProfile({ ...profile, startDate: e.target.value })} /></Field>
              <Field label="End date"><input className={inputClass} type="date" value={profile.endDate} onChange={(e) => setProfile({ ...profile, endDate: e.target.value })} /></Field>
              <Field label="Wake-up time"><input className={inputClass} type="time" value={profile.wakeTime} onChange={(e) => setProfile({ ...profile, wakeTime: e.target.value })} /></Field>
              <SelectField label="Daily calories" value={profile.calorieTarget} onChange={(value) => setProfile({ ...profile, calorieTarget: value })} options={calories} kind="calories" />
              <SelectField label="Daily step goal" value={profile.stepTarget} onChange={(value) => setProfile({ ...profile, stepTarget: value })} options={steps} kind="steps" />
              <SelectField label="Daily water goal" value={profile.waterTarget} onChange={(value) => setProfile({ ...profile, waterTarget: value })} options={water} kind="water" />
              <SelectField label="Current Qur’an hifdh" value={profile.currentHifdh} onChange={(value) => setProfile({ ...profile, currentHifdh: value })} options={hifdhOptions} />
              <SelectField label="Goal Qur’an hifdh" value={profile.goalHifdh} onChange={(value) => setProfile({ ...profile, goalHifdh: value })} options={hifdhOptions} />
              <SelectField label="Daily memorization" value={profile.quranDailyTarget} onChange={(value) => setProfile({ ...profile, quranDailyTarget: value })} options={quranTargets} />
              <SelectField label="Daily review" value={profile.quranReviewTarget} onChange={(value) => setProfile({ ...profile, quranReviewTarget: value })} options={quranTargets} />
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-emerald-50 p-4">
                <h3 className="font-black">Personal Goal 1</h3>
                <SelectField label="Goal" value={profile.goal1} onChange={(value) => setProfile({ ...profile, goal1: value })} options={commonGoals} />
                <div className="mt-3"><SelectField label="Daily task" value={profile.goal1Task} onChange={(value) => setProfile({ ...profile, goal1Task: value })} options={commonTasks} /></div>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4">
                <h3 className="font-black">Personal Goal 2</h3>
                <SelectField label="Goal" value={profile.goal2} onChange={(value) => setProfile({ ...profile, goal2: value })} options={commonGoals} />
                <div className="mt-3"><SelectField label="Daily task" value={profile.goal2Task} onChange={(value) => setProfile({ ...profile, goal2Task: value })} options={commonTasks} /></div>
              </div>
            </div>
            {message && <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{message}</p>}
            <button onClick={finishOnboarding} className="mt-6 w-full rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Build my plan and enter dashboard</button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fff8ed] px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[2rem] bg-slate-950 p-8 text-white">
          <h1 className="text-4xl font-black">Welcome, {profile.name}</h1>
          <p className="mt-2 text-slate-300">Your account works. Now we build the full dashboard.</p>
        </section>
        <section className={cardClass}>
          <h2 className="text-2xl font-black">Today’s Mission</h2>
          <p className="mt-3">Walk {Number(profile.stepTarget).toLocaleString()} steps, stay near {profile.calorieTarget} calories, memorize {profile.quranDailyTarget}, and complete {profile.goal1} + {profile.goal2}.</p>
        </section>
      </div>
    </main>
  );
}
