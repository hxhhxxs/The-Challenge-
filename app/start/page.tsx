"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureUserRecord, type ChallengeUserRecord } from "@/lib/supabase/ensure-user-record";

type Mode = "signup" | "login";
type Stage = "auth" | "onboarding" | "dashboard";

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
  personalGoals: { name: string; endGoal: string; dailyTask: string; frequency: string }[];
};

const defaultProfile: Profile = {
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
  personalGoals: [
    { name: "", endGoal: "", dailyTask: "", frequency: "" },
    { name: "", endGoal: "", dailyTask: "", frequency: "" },
  ],
};

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-600";
const cardClass = "rounded-[2rem] bg-white/90 p-6 shadow-xl shadow-emerald-950/5";
const noVerifyMessage = "Your account was created, but Supabase email confirmation is still ON. To make accounts work instantly: Supabase → Authentication → Sign In / Providers → Email → turn OFF Confirm email. Then create a new account or confirm/delete this test account.";

function ageFromDob(dob: string) {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return String(age);
}

function validProfile(profile: Profile) {
  const required = [
    profile.name,
    profile.age,
    profile.height,
    profile.currentWeight,
    profile.goalWeight,
    profile.startDate,
    profile.endDate,
    profile.wakeTime,
    profile.calorieTarget,
    profile.stepTarget,
    profile.waterTarget,
    profile.currentHifdh,
    profile.goalHifdh,
    profile.quranDailyTarget,
    profile.quranReviewTarget,
    ...profile.personalGoals.flatMap((goal) => [goal.name, goal.endGoal, goal.dailyTask, goal.frequency]),
  ];
  return required.every((value) => String(value).trim().length > 0);
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-700">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

export default function StartPage() {
  const [stage, setStage] = useState<Stage>("auth");
  const [mode, setMode] = useState<Mode>("signup");
  const [user, setUser] = useState<ChallengeUserRecord | null>(null);
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [form, setForm] = useState({ name: "", username: "", dob: "", email: "", password: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase.auth.getUser();
        if (!data.user) return;
        const record = await ensureUserRecord(data.user);
        setUser(record);
        const draft = (record.onboarding_draft || {}) as Partial<Profile>;
        const merged = { ...defaultProfile, ...draft, name: record.name } as Profile;
        setProfile(merged);
        setStage(record.onboarding_complete && validProfile(merged) ? "dashboard" : "onboarding");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not load account.");
      }
    }
    load();
  }, []);

  async function signup() {
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password: form.password,
        options: { data: { name: form.name.trim(), username, dob: form.dob } },
      });
      if (error) throw error;

      if (data.user && data.session) {
        const record = await ensureUserRecord(data.user);
        const nextProfile = { ...defaultProfile, name: form.name.trim(), age: ageFromDob(form.dob) };
        await supabase.from("users").update({ onboarding_draft: nextProfile, onboarding_complete: false }).eq("id", record.id);
        setUser({ ...record, onboarding_draft: nextProfile, onboarding_complete: false });
        setProfile(nextProfile);
        setStage("onboarding");
        return;
      }

      setMessage(noVerifyMessage);
      setMode("login");
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
      if (error) {
        if (error.message.toLowerCase().includes("invalid login")) throw new Error(noVerifyMessage);
        throw error;
      }
      if (!data.user) throw new Error("Could not log in.");
      const record = await ensureUserRecord(data.user);
      const draft = (record.onboarding_draft || {}) as Partial<Profile>;
      const merged = { ...defaultProfile, ...draft, name: record.name } as Profile;
      setUser(record);
      setProfile(merged);
      setStage(record.onboarding_complete && validProfile(merged) ? "dashboard" : "onboarding");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Wrong email or password.");
    } finally {
      setBusy(false);
    }
  }

  async function saveOnboarding() {
    setMessage("");
    if (!user) return;
    if (!validProfile(profile)) {
      setMessage("Finish every required field first. Your plan needs complete info.");
      return;
    }
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("users").update({ onboarding_draft: profile, onboarding_complete: true }).eq("id", user.id);
    if (error) {
      setMessage(error.message);
      return;
    }
    setUser({ ...user, onboarding_complete: true, onboarding_draft: profile });
    setStage("dashboard");
  }

  async function logout() {
    await createSupabaseBrowserClient().auth.signOut();
    setUser(null);
    setStage("auth");
  }

  if (stage === "auth") {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dcfce7,transparent_32%),#fff8ed] px-4 py-8 text-slate-900">
        <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2">
          <section className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl md:p-12">
            <p className="mb-4 inline-flex rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-bold text-emerald-200">The Challenge</p>
            <h1 className="text-5xl font-black tracking-tight">100 points. One challenge. A new you.</h1>
            <p className="mt-5 text-lg leading-8 text-slate-300">Create your account, complete onboarding, and start your personalized mission.</p>
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
              <button disabled={busy} onClick={mode === "signup" ? signup : login} className="w-full rounded-full bg-emerald-600 px-5 py-3 font-black text-white disabled:opacity-50">{busy ? "Working..." : mode === "signup" ? "Create account" : "Log in"}</button>
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
            <h1 className="text-3xl font-black">Build your challenge, {user?.username}</h1>
            <p className="mt-2 text-slate-300">Fill everything in. You cannot advance until your plan has enough information.</p>
          </header>
          <section className={cardClass}>
            <div className="grid gap-4 md:grid-cols-3">
              {Object.keys(defaultProfile).filter((key) => key !== "personalGoals").map((key) => (
                <Field key={key} label={key}>
                  <input className={inputClass} type={key.includes("Date") ? "date" : key === "wakeTime" ? "time" : "text"} value={String(profile[key as keyof Profile])} onChange={(e) => setProfile({ ...profile, [key]: e.target.value })} />
                </Field>
              ))}
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {profile.personalGoals.map((goal, index) => (
                <div key={index} className="rounded-2xl bg-emerald-50 p-4">
                  <h3 className="font-black">Personal Goal {index + 1}</h3>
                  <div className="mt-3 grid gap-3">
                    {(["name", "endGoal", "dailyTask", "frequency"] as const).map((key) => (
                      <input key={key} className={inputClass} placeholder={key} value={goal[key]} onChange={(e) => {
                        const goals = [...profile.personalGoals];
                        goals[index] = { ...goal, [key]: e.target.value };
                        setProfile({ ...profile, personalGoals: goals });
                      }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {message && <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{message}</p>}
            <button onClick={saveOnboarding} className="mt-6 w-full rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Build my plan and enter dashboard</button>
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
          <p className="mt-2 text-slate-300">Your account works. Dashboard build continues from here.</p>
          <button onClick={logout} className="mt-5 rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950">Log out</button>
        </section>
        <section className={cardClass}>
          <h2 className="text-2xl font-black">Today’s Mission</h2>
          <p className="mt-3">Walk {profile.stepTarget} steps, stay near {profile.calorieTarget} calories, memorize {profile.quranDailyTarget}, and complete your two personal goals.</p>
        </section>
      </div>
    </main>
  );
}
