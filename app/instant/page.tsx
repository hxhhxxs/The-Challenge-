"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureUserRecord, type ChallengeUserRecord } from "@/lib/supabase/ensure-user-record";

type Stage = "auth" | "onboarding" | "dashboard";
type Mode = "signup" | "login";

type Profile = {
  name: string;
  age: string;
  height: string;
  currentWeight: string;
  goalWeight: string;
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
  height: "",
  currentWeight: "",
  goalWeight: "",
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
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
    const onboardingDraft = {
      ...profile,
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
            <p className="mt-5 text-lg leading-8 text-slate-300">No email verification flow. If Supabase allows instant login, you go straight to onboarding.</p>
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
            <p className="mt-2 text-slate-300">Every field is required before you can enter the dashboard.</p>
          </header>
          <section className={cardClass}>
            <div className="grid gap-4 md:grid-cols-3">
              {(Object.keys(emptyProfile) as Array<keyof Profile>).filter((key) => key !== "goal1" && key !== "goal1Task" && key !== "goal2" && key !== "goal2Task").map((key) => (
                <Field key={key} label={key}>
                  <input className={inputClass} type={key.includes("Date") ? "date" : key === "wakeTime" ? "time" : "text"} value={String(profile[key])} onChange={(e) => setProfile({ ...profile, [key]: e.target.value })} />
                </Field>
              ))}
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-emerald-50 p-4">
                <h3 className="font-black">Personal Goal 1</h3>
                <input className={`${inputClass} mt-3`} placeholder="Goal name" value={profile.goal1} onChange={(e) => setProfile({ ...profile, goal1: e.target.value })} />
                <input className={`${inputClass} mt-3`} placeholder="Daily task" value={profile.goal1Task} onChange={(e) => setProfile({ ...profile, goal1Task: e.target.value })} />
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4">
                <h3 className="font-black">Personal Goal 2</h3>
                <input className={`${inputClass} mt-3`} placeholder="Goal name" value={profile.goal2} onChange={(e) => setProfile({ ...profile, goal2: e.target.value })} />
                <input className={`${inputClass} mt-3`} placeholder="Daily task" value={profile.goal2Task} onChange={(e) => setProfile({ ...profile, goal2Task: e.target.value })} />
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
          <p className="mt-3">Walk {profile.stepTarget} steps, stay near {profile.calorieTarget} calories, memorize {profile.quranDailyTarget}, and complete {profile.goal1} + {profile.goal2}.</p>
        </section>
      </div>
    </main>
  );
}
