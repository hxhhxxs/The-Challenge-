"use client";

import { useEffect, useMemo, useState } from "react";

type PersonalGoal = {
  name: string;
  endGoal: string;
  dailyTask: string;
  frequency: string;
  tracking: string;
};

type Profile = {
  name: string;
  age: string;
  height: string;
  currentWeight: string;
  goalWeight: string;
  startDate: string;
  endDate: string;
  wakeTime: string;
  sleepGoal: string;
  currentHifdh: string;
  goalHifdh: string;
  quranDailyTarget: string;
  quranReviewTarget: string;
  calorieTarget: string;
  stepTarget: string;
  waterTarget: string;
  exerciseLevel: string;
  preferredExercise: string;
  limitations: string;
  spendingLimit: string;
  restaurantLimit: string;
  screenLimit: string;
  tvLimit: string;
  personalGoals: PersonalGoal[];
};

type CheckIn = {
  date: string;
  weight: string;
  calories: string;
  steps: string;
  water: string;
  exerciseMinutes: string;
  quranMemorized: string;
  quranReviewed: string;
  personalOneDone: boolean;
  personalTwoDone: boolean;
  randomTasksDone: number;
  joyTaskDone: boolean;
  moneySpent: string;
  restaurantVisit: boolean;
  screenTime: string;
  tvTime: string;
  sleepHours: string;
  mood: string;
  notes: string;
  points: number;
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
  sleepGoal: "8",
  currentHifdh: "",
  goalHifdh: "",
  quranDailyTarget: "5 lines",
  quranReviewTarget: "1 page",
  calorieTarget: "2200",
  stepTarget: "10000",
  waterTarget: "5",
  exerciseLevel: "Beginner",
  preferredExercise: "Walking + bodyweight",
  limitations: "",
  spendingLimit: "300",
  restaurantLimit: "4",
  screenLimit: "3",
  tvLimit: "3",
  personalGoals: [
    { name: "Boxing", endGoal: "Learn basic stance, footwork, jab, and cross", dailyTask: "20 minutes of boxing drills", frequency: "5 days/week", tracking: "Checklist" },
    { name: "Hygiene", endGoal: "Build a consistent morning and night routine", dailyTask: "Complete hygiene checklist", frequency: "Daily", tracking: "Checklist" },
  ],
};

const smallTaskBank = [
  "Drink water before every meal",
  "Clean your room for 10 minutes",
  "Call or text a family member",
  "No sugary drinks today",
  "Read 5 pages from a beneficial book",
  "Stretch for 10 minutes",
  "Review yesterday's Qur'an",
  "Make your bed",
  "Give sadaqah, even $1",
  "Walk 10 minutes after a meal",
];

const weeklyTaskBank = [
  "Fast one day this week",
  "Walk 50,000+ total steps this week",
  "Visit the masjid 3 times this week",
  "Deep clean your room or car",
  "Meal prep for 3 days",
  "No restaurant or fast food for 7 days",
  "Help someone without telling anyone",
  "Memorize one page or your assigned amount",
];

const joyTaskBank = [
  "Draw something for 20 minutes",
  "Make a small glass painting",
  "Cook one healthy meal",
  "Go shopping with a $10 limit",
  "Take 5 creative photos",
  "Watch the sunset without your phone",
  "Make tea or coffee for someone at home",
  "Redesign one small corner of your room",
];

const mockLeaders = [
  { name: "Ahmad", points: 82, streak: 14, progress: 72, status: "Ahead" },
  { name: "Omar", points: 69, streak: 9, progress: 64, status: "On track" },
  { name: "Yusuf", points: 51, streak: 5, progress: 48, status: "Behind" },
];

function numberValue(value: string, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function daysBetween(start: string, end: string) {
  if (!start || !end) return 0;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diff = endDate.getTime() - startDate.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
}

function dayOfChallenge(start: string) {
  if (!start) return 1;
  const startDate = new Date(start);
  const today = new Date();
  const diff = today.getTime() - startDate.getTime();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
}

function pickTasks(bank: string[], count: number, seed: number) {
  const rotated = [...bank.slice(seed % bank.length), ...bank.slice(0, seed % bank.length)];
  return rotated.slice(0, count);
}

function calculatePoints(profile: Profile, data: Omit<CheckIn, "points">) {
  let points = 0;
  const stepTarget = numberValue(profile.stepTarget, 10000);
  const steps = numberValue(data.steps);
  points += Math.min(2, steps / Math.max(1, stepTarget));

  const waterTarget = numberValue(profile.waterTarget, 5);
  const water = numberValue(data.water);
  points += Math.min(1.25, water / Math.max(1, waterTarget));

  const exercise = numberValue(data.exerciseMinutes);
  points += exercise >= 45 ? 1.5 : exercise >= 20 ? 1 : exercise > 0 ? 0.5 : -1;

  const calories = numberValue(data.calories);
  const calorieTarget = numberValue(profile.calorieTarget, 2200);
  if (calories > 0) {
    const low = calorieTarget * 0.75;
    const high = calorieTarget * 1.12;
    if (calories >= low && calories <= high) points += 1.5;
    else if (calories < low) points -= 0.75;
    else points -= Math.min(2, (calories - high) / 500);
  }

  const sleepGoal = numberValue(profile.sleepGoal, 8);
  const sleep = numberValue(data.sleepHours);
  if (sleep >= Math.max(6.5, sleepGoal - 1) && sleep <= 9.5) points += 1;
  else if (sleep > 0) points -= 0.5;

  if (data.quranMemorized.trim()) points += 1.25;
  if (data.quranReviewed.trim()) points += 1;
  if (data.personalOneDone) points += 1;
  if (data.personalTwoDone) points += 1;
  points += data.randomTasksDone * 0.5;
  if (data.joyTaskDone) points += 0.75;

  const screenLimit = numberValue(profile.screenLimit, 3);
  const screen = numberValue(data.screenTime);
  points += screen <= screenLimit ? 0.75 : -Math.min(2, (screen - screenLimit) * 0.5);

  const tvLimitWeekly = numberValue(profile.tvLimit, 3);
  const tv = numberValue(data.tvTime);
  points += tv <= tvLimitWeekly / 7 ? 0.4 : -0.4;

  if (data.restaurantVisit) points -= 0.75;
  return Math.round(points * 10) / 10;
}

function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-emerald-600";

export default function Home() {
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [saved, setSaved] = useState(false);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [entry, setEntry] = useState<Omit<CheckIn, "points">>({
    date: new Date().toISOString().slice(0, 10),
    weight: "",
    calories: "",
    steps: "",
    water: "",
    exerciseMinutes: "",
    quranMemorized: "",
    quranReviewed: "",
    personalOneDone: false,
    personalTwoDone: false,
    randomTasksDone: 0,
    joyTaskDone: false,
    moneySpent: "",
    restaurantVisit: false,
    screenTime: "",
    tvTime: "",
    sleepHours: "",
    mood: "",
    notes: "",
  });

  useEffect(() => {
    const storedProfile = localStorage.getItem("challenge-profile");
    const storedCheckIns = localStorage.getItem("challenge-checkins");
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
      setSaved(true);
    }
    if (storedCheckIns) setCheckIns(JSON.parse(storedCheckIns));
  }, []);

  const totalPoints = useMemo(() => Math.round(checkIns.reduce((sum, item) => sum + item.points, 0) * 10) / 10, [checkIns]);
  const cappedPoints = Math.min(100, Math.max(0, totalPoints));
  const totalDays = daysBetween(profile.startDate, profile.endDate);
  const currentDay = Math.min(totalDays || 1, dayOfChallenge(profile.startDate));
  const expectedPoints = totalDays ? Math.round((currentDay / totalDays) * 100) : 0;
  const status = cappedPoints >= expectedPoints + 5 ? "Ahead" : cappedPoints >= expectedPoints - 5 ? "On track" : "Behind";
  const seed = currentDay + checkIns.length;
  const todayTasks = pickTasks(smallTaskBank, 3, seed);
  const weeklyTask = pickTasks(weeklyTaskBank, 1, Math.floor(currentDay / 7))[0];
  const joyTask = pickTasks(joyTaskBank, 1, seed + 2)[0];
  const leaders = [...mockLeaders, { name: profile.name || "You", points: cappedPoints, streak: checkIns.length, progress: totalDays ? Math.round((currentDay / totalDays) * 100) : 0, status }].sort((a, b) => b.points - a.points);

  function updateProfile<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((prev) => ({ ...prev, [key]: value }));
  }

  function saveProfile() {
    localStorage.setItem("challenge-profile", JSON.stringify(profile));
    setSaved(true);
  }

  function submitCheckIn() {
    const points = calculatePoints(profile, entry);
    const newEntry: CheckIn = { ...entry, points };
    const updated = [newEntry, ...checkIns];
    setCheckIns(updated);
    localStorage.setItem("challenge-checkins", JSON.stringify(updated));
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dcfce7,transparent_32%),#fff8ed] px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-2xl">
          <div className="grid gap-8 p-8 md:grid-cols-[1.2fr_0.8fr] md:p-12">
            <div>
              <p className="mb-3 inline-flex rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-200">100 points. One challenge. A new you.</p>
              <h1 className="text-4xl font-black tracking-tight md:text-6xl">The Challenge</h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">A personalized whole-life transformation app for body, Qur’an, discipline, money, sleep, screen limits, personal goals, joy tasks, and leaderboards.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#onboarding" className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-950/30">Build my plan</a>
                <a href="#dashboard" className="rounded-full border border-white/20 px-5 py-3 text-sm font-bold text-white">View dashboard</a>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm text-slate-300">Current score</p>
              <p className="mt-2 text-6xl font-black text-emerald-300">{cappedPoints}</p>
              <p className="text-lg font-bold">/ 100 points</p>
              <div className="mt-5 h-3 rounded-full bg-white/10">
                <div className="h-3 rounded-full bg-emerald-400" style={{ width: `${cappedPoints}%` }} />
              </div>
              <p className="mt-4 text-sm text-slate-300">Day {currentDay || 1} of {totalDays || "your challenge"} • {status}</p>
            </div>
          </div>
        </section>

        <section id="onboarding" className="rounded-[2rem] bg-white/85 p-6 shadow-xl shadow-emerald-950/5 md:p-8">
          <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-700">Phase 1</p>
              <h2 className="text-3xl font-black">Personalized onboarding</h2>
              <p className="mt-2 text-slate-600">The app learns the person first, then builds the plan.</p>
            </div>
            <button onClick={saveProfile} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white">Save plan</button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Name"><input className={inputClass} value={profile.name} onChange={(e) => updateProfile("name", e.target.value)} /></Field>
            <Field label="Age"><input className={inputClass} value={profile.age} onChange={(e) => updateProfile("age", e.target.value)} /></Field>
            <Field label="Height"><input className={inputClass} value={profile.height} onChange={(e) => updateProfile("height", e.target.value)} placeholder="5'10" /></Field>
            <Field label="Current weight"><input className={inputClass} value={profile.currentWeight} onChange={(e) => updateProfile("currentWeight", e.target.value)} /></Field>
            <Field label="Goal weight"><input className={inputClass} value={profile.goalWeight} onChange={(e) => updateProfile("goalWeight", e.target.value)} /></Field>
            <Field label="Wake-up time"><input type="time" className={inputClass} value={profile.wakeTime} onChange={(e) => updateProfile("wakeTime", e.target.value)} /></Field>
            <Field label="Start date"><input type="date" className={inputClass} value={profile.startDate} onChange={(e) => updateProfile("startDate", e.target.value)} /></Field>
            <Field label="End date"><input type="date" className={inputClass} value={profile.endDate} onChange={(e) => updateProfile("endDate", e.target.value)} /></Field>
            <Field label="Sleep goal"><input className={inputClass} value={profile.sleepGoal} onChange={(e) => updateProfile("sleepGoal", e.target.value)} /></Field>
            <Field label="Current hifdh"><input className={inputClass} value={profile.currentHifdh} onChange={(e) => updateProfile("currentHifdh", e.target.value)} placeholder="2 juz" /></Field>
            <Field label="Hifdh goal"><input className={inputClass} value={profile.goalHifdh} onChange={(e) => updateProfile("goalHifdh", e.target.value)} placeholder="5 juz" /></Field>
            <Field label="Daily Qur’an target"><input className={inputClass} value={profile.quranDailyTarget} onChange={(e) => updateProfile("quranDailyTarget", e.target.value)} /></Field>
            <Field label="Daily calories"><input className={inputClass} value={profile.calorieTarget} onChange={(e) => updateProfile("calorieTarget", e.target.value)} /></Field>
            <Field label="Step goal"><input className={inputClass} value={profile.stepTarget} onChange={(e) => updateProfile("stepTarget", e.target.value)} /></Field>
            <Field label="Water goal"><input className={inputClass} value={profile.waterTarget} onChange={(e) => updateProfile("waterTarget", e.target.value)} /></Field>
            <Field label="Exercise level"><select className={inputClass} value={profile.exerciseLevel} onChange={(e) => updateProfile("exerciseLevel", e.target.value)}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></Field>
            <Field label="Preferred exercise"><input className={inputClass} value={profile.preferredExercise} onChange={(e) => updateProfile("preferredExercise", e.target.value)} /></Field>
            <Field label="Limitations"><input className={inputClass} value={profile.limitations} onChange={(e) => updateProfile("limitations", e.target.value)} placeholder="knee pain, asthma, none" /></Field>
            <Field label="Monthly spending limit"><input className={inputClass} value={profile.spendingLimit} onChange={(e) => updateProfile("spendingLimit", e.target.value)} /></Field>
            <Field label="Restaurant limit/month"><input className={inputClass} value={profile.restaurantLimit} onChange={(e) => updateProfile("restaurantLimit", e.target.value)} /></Field>
            <Field label="Screen limit/day"><input className={inputClass} value={profile.screenLimit} onChange={(e) => updateProfile("screenLimit", e.target.value)} /></Field>
            <Field label="TV episodes/week"><input className={inputClass} value={profile.tvLimit} onChange={(e) => updateProfile("tvLimit", e.target.value)} /></Field>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {profile.personalGoals.map((goal, index) => (
              <div key={index} className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                <h3 className="font-black">Personal Goal {index + 1}</h3>
                <div className="mt-3 grid gap-3">
                  {(["name", "endGoal", "dailyTask", "frequency", "tracking"] as const).map((key) => (
                    <input key={key} className={inputClass} value={goal[key]} onChange={(e) => {
                      const goals = [...profile.personalGoals];
                      goals[index] = { ...goals[index], [key]: e.target.value };
                      updateProfile("personalGoals", goals);
                    }} placeholder={key} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          {saved && <p className="mt-4 rounded-xl bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-900">Plan saved in this browser.</p>}
        </section>

        <section id="dashboard" className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard label="Score" value={`${cappedPoints}/100`} hint={`Raw earned: ${totalPoints}`} />
              <StatCard label="Status" value={status} hint={`Expected: ${expectedPoints}`} />
              <StatCard label="Challenge" value={`${currentDay}/${totalDays || "—"}`} hint="Current day" />
              <StatCard label="Streak" value={`${checkIns.length}`} hint="Logged days" />
            </div>

            <div className="rounded-[2rem] bg-white/85 p-6 shadow-xl shadow-emerald-950/5">
              <h2 className="text-2xl font-black">Today’s Mission</h2>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {[
                  `Wake up by ${profile.wakeTime || "your wake-up time"}`,
                  `Stay near ${profile.calorieTarget} calories`,
                  `Drink ${profile.waterTarget} bottles/cups of water`,
                  `Walk ${profile.stepTarget} steps`,
                  `Exercise: ${profile.preferredExercise}`,
                  `Memorize: ${profile.quranDailyTarget}`,
                  `Review: ${profile.quranReviewTarget}`,
                  `${profile.personalGoals[0]?.name}: ${profile.personalGoals[0]?.dailyTask}`,
                  `${profile.personalGoals[1]?.name}: ${profile.personalGoals[1]?.dailyTask}`,
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-slate-100 bg-white p-4 text-sm font-semibold">{item}</div>
                ))}
              </div>
              <div className="mt-5 rounded-2xl bg-slate-950 p-5 text-white">
                <h3 className="font-black text-emerald-300">3 Random Small Tasks</h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-200">{todayTasks.map((task) => <li key={task}>• {task}</li>)}</ul>
                <p className="mt-4 text-sm"><span className="font-bold text-yellow-300">Weekly big task:</span> {weeklyTask}</p>
                <p className="mt-2 text-sm"><span className="font-bold text-pink-200">Joy task:</span> {joyTask}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white/85 p-6 shadow-xl shadow-emerald-950/5">
            <h2 className="text-2xl font-black">Daily Check-In</h2>
            <p className="mt-1 text-sm text-slate-600">Log the truth. The app calculates points honestly.</p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <Field label="Weight"><input className={inputClass} value={entry.weight} onChange={(e) => setEntry({ ...entry, weight: e.target.value })} /></Field>
              <Field label="Calories"><input className={inputClass} value={entry.calories} onChange={(e) => setEntry({ ...entry, calories: e.target.value })} /></Field>
              <Field label="Steps"><input className={inputClass} value={entry.steps} onChange={(e) => setEntry({ ...entry, steps: e.target.value })} /></Field>
              <Field label="Water"><input className={inputClass} value={entry.water} onChange={(e) => setEntry({ ...entry, water: e.target.value })} /></Field>
              <Field label="Exercise minutes"><input className={inputClass} value={entry.exerciseMinutes} onChange={(e) => setEntry({ ...entry, exerciseMinutes: e.target.value })} /></Field>
              <Field label="Sleep hours"><input className={inputClass} value={entry.sleepHours} onChange={(e) => setEntry({ ...entry, sleepHours: e.target.value })} /></Field>
              <Field label="Qur’an memorized"><input className={inputClass} value={entry.quranMemorized} onChange={(e) => setEntry({ ...entry, quranMemorized: e.target.value })} /></Field>
              <Field label="Qur’an reviewed"><input className={inputClass} value={entry.quranReviewed} onChange={(e) => setEntry({ ...entry, quranReviewed: e.target.value })} /></Field>
              <Field label="Money spent"><input className={inputClass} value={entry.moneySpent} onChange={(e) => setEntry({ ...entry, moneySpent: e.target.value })} /></Field>
              <Field label="Screen time hours"><input className={inputClass} value={entry.screenTime} onChange={(e) => setEntry({ ...entry, screenTime: e.target.value })} /></Field>
              <Field label="TV time hours"><input className={inputClass} value={entry.tvTime} onChange={(e) => setEntry({ ...entry, tvTime: e.target.value })} /></Field>
              <Field label="Mood 1-10"><input className={inputClass} value={entry.mood} onChange={(e) => setEntry({ ...entry, mood: e.target.value })} /></Field>
            </div>
            <div className="mt-4 grid gap-2 text-sm font-semibold">
              <label><input type="checkbox" checked={entry.personalOneDone} onChange={(e) => setEntry({ ...entry, personalOneDone: e.target.checked })} /> Personal goal 1 done</label>
              <label><input type="checkbox" checked={entry.personalTwoDone} onChange={(e) => setEntry({ ...entry, personalTwoDone: e.target.checked })} /> Personal goal 2 done</label>
              <label><input type="checkbox" checked={entry.joyTaskDone} onChange={(e) => setEntry({ ...entry, joyTaskDone: e.target.checked })} /> Joy task done</label>
              <label><input type="checkbox" checked={entry.restaurantVisit} onChange={(e) => setEntry({ ...entry, restaurantVisit: e.target.checked })} /> Restaurant/fast food today</label>
              <Field label="Random tasks completed"><select className={inputClass} value={entry.randomTasksDone} onChange={(e) => setEntry({ ...entry, randomTasksDone: Number(e.target.value) })}><option value={0}>0/3</option><option value={1}>1/3</option><option value={2}>2/3</option><option value={3}>3/3</option></select></Field>
              <textarea className={inputClass} rows={3} placeholder="Notes/reflection" value={entry.notes} onChange={(e) => setEntry({ ...entry, notes: e.target.value })} />
            </div>
            <button onClick={submitCheckIn} className="mt-5 w-full rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Submit check-in</button>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] bg-white/85 p-6 shadow-xl shadow-emerald-950/5">
            <h2 className="text-2xl font-black">Monthly + Screen Limits</h2>
            <div className="mt-4 space-y-3">
              {[`Spending: $${profile.spendingLimit}/month`, `Restaurants: ${profile.restaurantLimit}/month`, `Screen time: ${profile.screenLimit} hours/day`, `TV: ${profile.tvLimit} episodes/week`].map((limit) => <div className="rounded-2xl bg-slate-50 p-4 font-semibold" key={limit}>{limit}</div>)}
            </div>
          </div>

          <div className="rounded-[2rem] bg-white/85 p-6 shadow-xl shadow-emerald-950/5">
            <h2 className="text-2xl font-black">Leaderboard</h2>
            <div className="mt-4 space-y-3">
              {leaders.map((leader, index) => (
                <div key={leader.name} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-2xl bg-slate-50 p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 font-black text-emerald-800">{index + 1}</div>
                  <div>
                    <p className="font-black">{leader.name}</p>
                    <p className="text-xs text-slate-500">{leader.streak} day streak • {leader.status}</p>
                  </div>
                  <p className="font-black">{leader.points}/100</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl md:p-8">
          <h2 className="text-2xl font-black">Recent Check-Ins</h2>
          <div className="mt-4 space-y-3">
            {checkIns.length === 0 && <p className="text-slate-300">No check-ins yet. Submit one to start earning points.</p>}
            {checkIns.slice(0, 5).map((item, index) => (
              <div key={`${item.date}-${index}`} className="rounded-2xl bg-white/10 p-4">
                <p className="font-bold">{item.date} • {item.points} points</p>
                <p className="text-sm text-slate-300">Steps: {item.steps || "—"} • Calories: {item.calories || "—"} • Qur’an: {item.quranMemorized || "—"}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
