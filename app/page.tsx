"use client";

import { useEffect, useMemo, useState } from "react";

type Account = { username: string; password: string };
type PersonalGoal = { name: string; endGoal: string; dailyTask: string; frequency: string; tracking: string };
type Profile = {
  name: string; age: string; height: string; currentWeight: string; goalWeight: string;
  startDate: string; endDate: string; wakeTime: string; sleepGoal: string;
  currentHifdh: string; goalHifdh: string; quranDailyTarget: string; quranReviewTarget: string;
  calorieTarget: string; stepTarget: string; waterTarget: string; exerciseLevel: string;
  preferredExercise: string; limitations: string; spendingLimit: string; restaurantLimit: string;
  screenLimit: string; tvLimit: string; personalGoals: PersonalGoal[];
};
type CheckIn = {
  date: string; weight: string; calories: string; steps: string; water: string; exerciseMinutes: string;
  quranMemorized: string; quranReviewed: string; personalOneDone: boolean; personalTwoDone: boolean;
  randomTasksDone: number; joyTaskDone: boolean; moneySpent: string; restaurantVisit: boolean;
  screenTime: string; tvTime: string; sleepHours: string; mood: string; notes: string; points: number;
};

type Stage = "auth" | "onboarding" | "dashboard";
type AuthMode = "create" | "login";

const defaultProfile: Profile = {
  name: "", age: "", height: "", currentWeight: "", goalWeight: "", startDate: "", endDate: "",
  wakeTime: "", sleepGoal: "8", currentHifdh: "", goalHifdh: "", quranDailyTarget: "5 lines",
  quranReviewTarget: "1 page", calorieTarget: "2200", stepTarget: "10000", waterTarget: "5",
  exerciseLevel: "Beginner", preferredExercise: "Walking + bodyweight", limitations: "", spendingLimit: "300",
  restaurantLimit: "4", screenLimit: "3", tvLimit: "3",
  personalGoals: [
    { name: "Boxing", endGoal: "Learn stance, footwork, jab, and cross", dailyTask: "20 minutes of boxing drills", frequency: "5 days/week", tracking: "Checklist" },
    { name: "Hygiene", endGoal: "Build a consistent morning and night routine", dailyTask: "Complete hygiene checklist", frequency: "Daily", tracking: "Checklist" },
  ],
};

const defaultEntry: Omit<CheckIn, "points"> = {
  date: new Date().toISOString().slice(0, 10), weight: "", calories: "", steps: "", water: "", exerciseMinutes: "",
  quranMemorized: "", quranReviewed: "", personalOneDone: false, personalTwoDone: false, randomTasksDone: 0,
  joyTaskDone: false, moneySpent: "", restaurantVisit: false, screenTime: "", tvTime: "", sleepHours: "", mood: "", notes: "",
};

const smallTaskBank = ["Drink water before every meal", "Clean your room for 10 minutes", "Call or text a family member", "No sugary drinks today", "Read 5 pages", "Stretch for 10 minutes", "Review yesterday's Qur'an", "Make your bed", "Give sadaqah, even $1", "Walk 10 minutes after a meal"];
const weeklyTaskBank = ["Fast one day this week", "Walk 50,000+ total steps this week", "Visit the masjid 3 times", "Deep clean your room or car", "Meal prep for 3 days", "No restaurant/fast food for 7 days", "Help someone quietly", "Memorize one page or assigned amount"];
const joyTaskBank = ["Draw something for 20 minutes", "Make a small glass painting", "Cook one healthy meal", "Go shopping with a $10 limit", "Take 5 creative photos", "Watch the sunset without your phone", "Make tea or coffee for someone", "Redesign one small corner of your room"];
const mockLeaders = [{ name: "Ahmad", points: 82, streak: 14, status: "Ahead" }, { name: "Omar", points: 69, streak: 9, status: "On track" }, { name: "Yusuf", points: 51, streak: 5, status: "Behind" }];

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-600";
const cardClass = "rounded-[2rem] bg-white/90 p-6 shadow-xl shadow-emerald-950/5";

function n(value: string, fallback = 0) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : fallback; }
function daysBetween(start: string, end: string) { if (!start || !end) return 0; return Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1); }
function dayOfChallenge(start: string) { if (!start) return 1; return Math.max(1, Math.ceil((Date.now() - new Date(start).getTime()) / 86400000) + 1); }
function pickTasks(bank: string[], count: number, seed: number) { const index = Math.abs(seed) % bank.length; return [...bank.slice(index), ...bank.slice(0, index)].slice(0, count); }
function accountKey(username: string) { return `challenge-user-${username.toLowerCase().trim()}`; }

function calculatePoints(profile: Profile, data: Omit<CheckIn, "points">) {
  let points = 0;
  points += Math.min(2, n(data.steps) / Math.max(1, n(profile.stepTarget, 10000)));
  points += Math.min(1.25, n(data.water) / Math.max(1, n(profile.waterTarget, 5)));
  const exercise = n(data.exerciseMinutes); points += exercise >= 45 ? 1.5 : exercise >= 20 ? 1 : exercise > 0 ? 0.5 : -1;
  const calories = n(data.calories); const target = n(profile.calorieTarget, 2200);
  if (calories > 0) points += calories >= target * 0.75 && calories <= target * 1.12 ? 1.5 : calories < target * 0.75 ? -0.75 : -Math.min(2, (calories - target * 1.12) / 500);
  const sleep = n(data.sleepHours); const sleepGoal = n(profile.sleepGoal, 8);
  if (sleep >= Math.max(6.5, sleepGoal - 1) && sleep <= 9.5) points += 1; else if (sleep > 0) points -= 0.5;
  if (data.quranMemorized.trim()) points += 1.25; if (data.quranReviewed.trim()) points += 1;
  if (data.personalOneDone) points += 1; if (data.personalTwoDone) points += 1;
  points += data.randomTasksDone * 0.5; if (data.joyTaskDone) points += 0.75;
  points += n(data.screenTime) <= n(profile.screenLimit, 3) ? 0.75 : -Math.min(2, (n(data.screenTime) - n(profile.screenLimit, 3)) * 0.5);
  points += n(data.tvTime) <= n(profile.tvLimit, 3) / 7 ? 0.4 : -0.4;
  if (data.restaurantVisit) points -= 0.75;
  return Math.round(points * 10) / 10;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="text-sm font-bold text-slate-700">{label}</span><div className="mt-1">{children}</div></label>; }
function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) { return <div className="rounded-2xl border border-white/70 bg-white/85 p-4"><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-black">{value}</p><p className="mt-1 text-xs text-slate-500">{hint}</p></div>; }

export default function Home() {
  const [stage, setStage] = useState<Stage>("auth");
  const [authMode, setAuthMode] = useState<AuthMode>("create");
  const [auth, setAuth] = useState<Account>({ username: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [entry, setEntry] = useState<Omit<CheckIn, "points">>(defaultEntry);

  useEffect(() => {
    const session = localStorage.getItem("challenge-current-user");
    if (!session) return;
    const stored = localStorage.getItem(accountKey(session));
    if (!stored) return;
    const data = JSON.parse(stored) as { profile?: Profile; checkIns?: CheckIn[]; onboarded?: boolean };
    setCurrentUser(session); setProfile(data.profile || defaultProfile); setCheckIns(data.checkIns || []); setStage(data.onboarded ? "dashboard" : "onboarding");
  }, []);

  function saveUser(nextProfile = profile, nextCheckIns = checkIns, onboarded = stage === "dashboard") {
    if (!currentUser) return;
    const existing = JSON.parse(localStorage.getItem(accountKey(currentUser)) || "{}");
    localStorage.setItem(accountKey(currentUser), JSON.stringify({ ...existing, profile: nextProfile, checkIns: nextCheckIns, onboarded }));
  }

  function handleAuth() {
    const username = auth.username.trim();
    if (!username || !auth.password) { setAuthError("Enter a username and password."); return; }
    const key = accountKey(username); const existing = localStorage.getItem(key);
    if (authMode === "create") {
      if (existing) { setAuthError("That username already exists on this device. Log in instead."); return; }
      localStorage.setItem(key, JSON.stringify({ password: auth.password, profile: defaultProfile, checkIns: [], onboarded: false }));
      localStorage.setItem("challenge-current-user", username); setCurrentUser(username); setProfile(defaultProfile); setCheckIns([]); setAuthError(""); setStage("onboarding");
      return;
    }
    if (!existing) { setAuthError("No account found with that username on this device."); return; }
    const data = JSON.parse(existing);
    if (data.password !== auth.password) { setAuthError("Wrong password."); return; }
    localStorage.setItem("challenge-current-user", username); setCurrentUser(username); setProfile(data.profile || defaultProfile); setCheckIns(data.checkIns || []); setAuthError(""); setStage(data.onboarded ? "dashboard" : "onboarding");
  }

  function logout() { localStorage.removeItem("challenge-current-user"); setCurrentUser(""); setAuth({ username: "", password: "" }); setStage("auth"); }
  function updateProfile<K extends keyof Profile>(key: K, value: Profile[K]) { setProfile((prev) => ({ ...prev, [key]: value })); }
  function finishOnboarding() { saveUser(profile, checkIns, true); setStage("dashboard"); }
  function submitCheckIn() { const points = calculatePoints(profile, entry); const updated = [{ ...entry, points }, ...checkIns]; setCheckIns(updated); saveUser(profile, updated, true); setEntry(defaultEntry); }

  const totalPoints = useMemo(() => Math.round(checkIns.reduce((sum, item) => sum + item.points, 0) * 10) / 10, [checkIns]);
  const cappedPoints = Math.min(100, Math.max(0, totalPoints));
  const totalDays = daysBetween(profile.startDate, profile.endDate);
  const currentDay = Math.min(totalDays || 1, dayOfChallenge(profile.startDate));
  const expectedPoints = totalDays ? Math.round((currentDay / totalDays) * 100) : 0;
  const status = cappedPoints >= expectedPoints + 5 ? "Ahead" : cappedPoints >= expectedPoints - 5 ? "On track" : "Behind";
  const todayTasks = pickTasks(smallTaskBank, 3, currentDay + checkIns.length);
  const weeklyTask = pickTasks(weeklyTaskBank, 1, Math.floor(currentDay / 7))[0];
  const joyTask = pickTasks(joyTaskBank, 1, currentDay + 2)[0];
  const leaders = [...mockLeaders, { name: profile.name || currentUser || "You", points: cappedPoints, streak: checkIns.length, status }].sort((a, b) => b.points - a.points);

  if (stage === "auth") {
    return <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dcfce7,transparent_32%),#fff8ed] px-4 py-8 text-slate-900"><div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2">
      <section className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl md:p-12"><p className="mb-4 inline-flex rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-bold text-emerald-200">The Challenge</p><h1 className="text-5xl font-black tracking-tight">Create your account first.</h1><p className="mt-5 text-lg leading-8 text-slate-300">Then the app will collect your information, build your personalized plan, and send you to your main dashboard.</p><div className="mt-8 grid gap-3 text-sm text-slate-200"><p>1. Username + password</p><p>2. Personal onboarding</p><p>3. Main dashboard + daily missions</p></div></section>
      <section className={cardClass}><div className="mb-5 flex rounded-2xl bg-slate-100 p-1"><button onClick={() => setAuthMode("create")} className={`flex-1 rounded-xl px-4 py-3 text-sm font-black ${authMode === "create" ? "bg-white shadow" : "text-slate-500"}`}>Create account</button><button onClick={() => setAuthMode("login")} className={`flex-1 rounded-xl px-4 py-3 text-sm font-black ${authMode === "login" ? "bg-white shadow" : "text-slate-500"}`}>Log in</button></div><div className="space-y-4"><Field label="Username"><input className={inputClass} value={auth.username} onChange={(e) => setAuth({ ...auth, username: e.target.value })} placeholder="Choose a username" /></Field><Field label="Password"><input className={inputClass} type="password" value={auth.password} onChange={(e) => setAuth({ ...auth, password: e.target.value })} placeholder="Create a password" /></Field>{authError && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{authError}</p>}<button onClick={handleAuth} className="w-full rounded-full bg-emerald-600 px-5 py-3 font-black text-white">{authMode === "create" ? "Create account and start" : "Log in"}</button><p className="text-xs text-slate-500">Prototype note: this MVP saves accounts only in this browser with localStorage. Real secure auth comes later with Supabase.</p></div></section>
    </div></main>;
  }

  if (stage === "onboarding") {
    return <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dcfce7,transparent_32%),#fff8ed] px-4 py-8 text-slate-900"><div className="mx-auto max-w-7xl space-y-6"><header className="flex flex-col justify-between gap-4 rounded-[2rem] bg-slate-950 p-6 text-white md:flex-row md:items-center"><div><p className="text-sm font-bold text-emerald-300">Step 2 of 3</p><h1 className="text-3xl font-black">Tell us who you are, {currentUser}</h1><p className="mt-2 text-slate-300">The Challenge will use this to create your custom plan.</p></div><button onClick={logout} className="rounded-full border border-white/20 px-5 py-3 text-sm font-bold">Log out</button></header>
      <section className={cardClass}><div className="grid gap-4 md:grid-cols-3">
        <Field label="Name"><input className={inputClass} value={profile.name} onChange={(e) => updateProfile("name", e.target.value)} /></Field><Field label="Age"><input className={inputClass} value={profile.age} onChange={(e) => updateProfile("age", e.target.value)} /></Field><Field label="Height"><input className={inputClass} value={profile.height} onChange={(e) => updateProfile("height", e.target.value)} placeholder="5'10" /></Field>
        <Field label="Current weight"><input className={inputClass} value={profile.currentWeight} onChange={(e) => updateProfile("currentWeight", e.target.value)} /></Field><Field label="Goal weight"><input className={inputClass} value={profile.goalWeight} onChange={(e) => updateProfile("goalWeight", e.target.value)} /></Field><Field label="Wake-up time"><input type="time" className={inputClass} value={profile.wakeTime} onChange={(e) => updateProfile("wakeTime", e.target.value)} /></Field>
        <Field label="Start date"><input type="date" className={inputClass} value={profile.startDate} onChange={(e) => updateProfile("startDate", e.target.value)} /></Field><Field label="End date"><input type="date" className={inputClass} value={profile.endDate} onChange={(e) => updateProfile("endDate", e.target.value)} /></Field><Field label="Sleep goal"><input className={inputClass} value={profile.sleepGoal} onChange={(e) => updateProfile("sleepGoal", e.target.value)} /></Field>
        <Field label="Current hifdh"><input className={inputClass} value={profile.currentHifdh} onChange={(e) => updateProfile("currentHifdh", e.target.value)} placeholder="2 juz" /></Field><Field label="Hifdh goal"><input className={inputClass} value={profile.goalHifdh} onChange={(e) => updateProfile("goalHifdh", e.target.value)} placeholder="5 juz" /></Field><Field label="Daily Qur’an target"><input className={inputClass} value={profile.quranDailyTarget} onChange={(e) => updateProfile("quranDailyTarget", e.target.value)} /></Field>
        <Field label="Daily calories"><input className={inputClass} value={profile.calorieTarget} onChange={(e) => updateProfile("calorieTarget", e.target.value)} /></Field><Field label="Step goal"><input className={inputClass} value={profile.stepTarget} onChange={(e) => updateProfile("stepTarget", e.target.value)} /></Field><Field label="Water goal"><input className={inputClass} value={profile.waterTarget} onChange={(e) => updateProfile("waterTarget", e.target.value)} /></Field>
        <Field label="Exercise level"><select className={inputClass} value={profile.exerciseLevel} onChange={(e) => updateProfile("exerciseLevel", e.target.value)}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></Field><Field label="Preferred exercise"><input className={inputClass} value={profile.preferredExercise} onChange={(e) => updateProfile("preferredExercise", e.target.value)} /></Field><Field label="Limitations"><input className={inputClass} value={profile.limitations} onChange={(e) => updateProfile("limitations", e.target.value)} /></Field>
        <Field label="Monthly spending limit"><input className={inputClass} value={profile.spendingLimit} onChange={(e) => updateProfile("spendingLimit", e.target.value)} /></Field><Field label="Restaurant limit/month"><input className={inputClass} value={profile.restaurantLimit} onChange={(e) => updateProfile("restaurantLimit", e.target.value)} /></Field><Field label="Screen limit/day"><input className={inputClass} value={profile.screenLimit} onChange={(e) => updateProfile("screenLimit", e.target.value)} /></Field><Field label="TV episodes/week"><input className={inputClass} value={profile.tvLimit} onChange={(e) => updateProfile("tvLimit", e.target.value)} /></Field>
      </div><div className="mt-6 grid gap-4 md:grid-cols-2">{profile.personalGoals.map((goal, index) => <div key={index} className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4"><h3 className="font-black">Personal Goal {index + 1}</h3><div className="mt-3 grid gap-3">{(["name", "endGoal", "dailyTask", "frequency", "tracking"] as const).map((key) => <input key={key} className={inputClass} value={goal[key]} onChange={(e) => { const goals = [...profile.personalGoals]; goals[index] = { ...goals[index], [key]: e.target.value }; updateProfile("personalGoals", goals); }} placeholder={key} />)}</div></div>)}</div><button onClick={finishOnboarding} className="mt-6 w-full rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Save and enter main dashboard</button></section></div></main>;
  }

  return <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dcfce7,transparent_32%),#fff8ed] px-4 py-8 text-slate-900"><div className="mx-auto max-w-7xl space-y-8"><section className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-center"><div><p className="text-sm font-bold text-emerald-300">Main Dashboard</p><h1 className="text-4xl font-black">Welcome back, {profile.name || currentUser}</h1><p className="mt-2 text-slate-300">Your daily mission is ready. Log honestly and climb to 100 points.</p></div><div className="flex gap-3"><button onClick={() => setStage("onboarding")} className="rounded-full border border-white/20 px-5 py-3 text-sm font-bold">Edit info</button><button onClick={logout} className="rounded-full bg-white px-5 py-3 text-sm font-black text-slate-950">Log out</button></div></div></section>
    <section className="grid gap-4 md:grid-cols-4"><StatCard label="Score" value={`${cappedPoints}/100`} hint={`Raw earned: ${totalPoints}`} /><StatCard label="Status" value={status} hint={`Expected: ${expectedPoints}`} /><StatCard label="Challenge" value={`${currentDay}/${totalDays || "—"}`} hint="Current day" /><StatCard label="Streak" value={`${checkIns.length}`} hint="Logged days" /></section>
    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"><div className={cardClass}><h2 className="text-2xl font-black">Today’s Mission</h2><div className="mt-5 grid gap-3 md:grid-cols-2">{[`Wake up by ${profile.wakeTime || "your wake-up time"}`, `Stay near ${profile.calorieTarget} calories`, `Drink ${profile.waterTarget} bottles/cups of water`, `Walk ${profile.stepTarget} steps`, `Exercise: ${profile.preferredExercise}`, `Memorize: ${profile.quranDailyTarget}`, `Review: ${profile.quranReviewTarget}`, `${profile.personalGoals[0]?.name}: ${profile.personalGoals[0]?.dailyTask}`, `${profile.personalGoals[1]?.name}: ${profile.personalGoals[1]?.dailyTask}`].map((item) => <div key={item} className="rounded-2xl border border-slate-100 bg-white p-4 text-sm font-semibold">{item}</div>)}</div><div className="mt-5 rounded-2xl bg-slate-950 p-5 text-white"><h3 className="font-black text-emerald-300">3 Random Small Tasks</h3><ul className="mt-3 space-y-2 text-sm text-slate-200">{todayTasks.map((task) => <li key={task}>• {task}</li>)}</ul><p className="mt-4 text-sm"><span className="font-bold text-yellow-300">Weekly big task:</span> {weeklyTask}</p><p className="mt-2 text-sm"><span className="font-bold text-pink-200">Joy task:</span> {joyTask}</p></div></div>
      <div className={cardClass}><h2 className="text-2xl font-black">Daily Check-In</h2><div className="mt-5 grid gap-3 md:grid-cols-2">{[["Weight","weight"],["Calories","calories"],["Steps","steps"],["Water","water"],["Exercise minutes","exerciseMinutes"],["Sleep hours","sleepHours"],["Qur’an memorized","quranMemorized"],["Qur’an reviewed","quranReviewed"],["Money spent","moneySpent"],["Screen time hours","screenTime"],["TV time hours","tvTime"],["Mood 1-10","mood"]].map(([label,key]) => <Field label={label} key={key}><input className={inputClass} value={String(entry[key as keyof typeof entry])} onChange={(e) => setEntry({ ...entry, [key]: e.target.value })} /></Field>)}</div><div className="mt-4 grid gap-2 text-sm font-semibold"><label><input type="checkbox" checked={entry.personalOneDone} onChange={(e) => setEntry({ ...entry, personalOneDone: e.target.checked })} /> Personal goal 1 done</label><label><input type="checkbox" checked={entry.personalTwoDone} onChange={(e) => setEntry({ ...entry, personalTwoDone: e.target.checked })} /> Personal goal 2 done</label><label><input type="checkbox" checked={entry.joyTaskDone} onChange={(e) => setEntry({ ...entry, joyTaskDone: e.target.checked })} /> Joy task done</label><label><input type="checkbox" checked={entry.restaurantVisit} onChange={(e) => setEntry({ ...entry, restaurantVisit: e.target.checked })} /> Restaurant/fast food today</label><Field label="Random tasks completed"><select className={inputClass} value={entry.randomTasksDone} onChange={(e) => setEntry({ ...entry, randomTasksDone: Number(e.target.value) })}><option value={0}>0/3</option><option value={1}>1/3</option><option value={2}>2/3</option><option value={3}>3/3</option></select></Field><textarea className={inputClass} rows={3} placeholder="Notes/reflection" value={entry.notes} onChange={(e) => setEntry({ ...entry, notes: e.target.value })} /></div><button onClick={submitCheckIn} className="mt-5 w-full rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Submit check-in</button></div></section>
    <section className="grid gap-6 lg:grid-cols-2"><div className={cardClass}><h2 className="text-2xl font-black">Monthly + Screen Limits</h2><div className="mt-4 space-y-3">{[`Spending: $${profile.spendingLimit}/month`, `Restaurants: ${profile.restaurantLimit}/month`, `Screen time: ${profile.screenLimit} hours/day`, `TV: ${profile.tvLimit} episodes/week`].map((limit) => <div className="rounded-2xl bg-slate-50 p-4 font-semibold" key={limit}>{limit}</div>)}</div></div><div className={cardClass}><h2 className="text-2xl font-black">Leaderboard</h2><div className="mt-4 space-y-3">{leaders.map((leader, index) => <div key={leader.name} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl bg-slate-50 p-4"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 font-black text-emerald-800">{index + 1}</div><div><p className="font-black">{leader.name}</p><p className="text-xs text-slate-500">{leader.streak} day streak • {leader.status}</p></div><p className="font-black">{leader.points}/100</p></div>)}</div></div></section>
    <section className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl"><h2 className="text-2xl font-black">Recent Check-Ins</h2><div className="mt-4 space-y-3">{checkIns.length === 0 && <p className="text-slate-300">No check-ins yet. Submit one to start earning points.</p>}{checkIns.slice(0, 5).map((item, index) => <div key={`${item.date}-${index}`} className="rounded-2xl bg-white/10 p-4"><p className="font-bold">{item.date} • {item.points} points</p><p className="text-sm text-slate-300">Steps: {item.steps || "—"} • Calories: {item.calories || "—"} • Qur’an: {item.quranMemorized || "—"}</p></div>)}</div></section>
  </div></main>;
}
