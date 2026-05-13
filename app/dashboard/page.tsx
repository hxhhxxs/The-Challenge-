"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureUserRecord } from "@/lib/supabase/ensure-user-record";
import { cardClass, dayOfChallenge, daysBetween, formatNum, pageBg } from "@/lib/challenge-ui";
import { formatRank, getRankFromScore } from "@/lib/ranks";

const normalTasks = ["Drink water before every meal", "Clean your room for 10 minutes", "Call or text family", "No sugary drinks", "Read 5 pages", "Stretch for 10 minutes"];
const jumuahTasks = ["Read Surah Al-Kahf", "Give sadaqah", "Make du'a for parents", "Send salawat 100 times", "Arrive early for Jumu'ah", "Call family before Maghrib"];
const spiritualCards = [
  { label: "Verse of the day", arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا", translation: "Indeed, with hardship comes ease.", source: "Qur'an 94:6" },
  { label: "Du'a of the day", arabic: "رَبِّ زِدْنِي عِلْمًا", translation: "My Lord, increase me in knowledge.", source: "Qur'an 20:114" },
  { label: "Du'a of the day", arabic: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ", translation: "O Allah, help me remember You, thank You, and worship You beautifully.", source: "Daily du'a" },
  { label: "Verse of the day", arabic: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا", translation: "Whoever is mindful of Allah, He will make a way out for them.", source: "Qur'an 65:2" },
];

function toNum(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function pct(actual: number, target: number) {
  return `${Math.min(100, Math.round((actual / Math.max(1, target)) * 100))}%`;
}

function pick<T>(items: T[], count: number, seed: number) {
  const start = Math.abs(seed) % items.length;
  return [...items.slice(start), ...items.slice(0, start)].slice(0, count);
}

export default function DashboardPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<Record<string, any> | null>(null);
  const [reflectionMood, setReflectionMood] = useState("");
  const [reflectionText, setReflectionText] = useState("");
  const [mission, setMission] = useState({
    weight: "",
    calories: "",
    steps: "",
    water: 0,
    exerciseDone: false,
    quranMemorized: "",
    quranReviewed: "",
    goal1Done: false,
    goal2Done: false,
    randomDone: [false, false, false],
    salah: { Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false } as Record<string, boolean>,
  });

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
        return;
      }
      const record = await ensureUserRecord(data.user);
      if (!record.onboarding_complete) {
        router.push("/onboarding");
        return;
      }
      setDraft((record.onboarding_draft || {}) as Record<string, any>);
    }
    load();
  }, [router]);

  const today = new Date();
  const isFriday = today.getDay() === 5;
  const dateLabel = today.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  const spiritual = spiritualCards[(dayOfChallenge(draft?.startDate) + today.getDay()) % spiritualCards.length];
  const currentDay = Math.min(daysBetween(draft?.startDate, draft?.endDate) || 1, dayOfChallenge(draft?.startDate));
  const totalDays = daysBetween(draft?.startDate, draft?.endDate) || 1;
  const score = 0;
  const rank = getRankFromScore(score);
  const taskBank = isFriday ? jumuahTasks : normalTasks;
  const tasks = pick(taskBank, 3, currentDay + (isFriday ? 99 : 0));

  if (!draft) {
    return <main className={pageBg}><section className={`${cardClass} mx-auto max-w-xl`}>Loading dashboard…</section></main>;
  }

  const calorieTarget = toNum(draft.calorieTarget, 2200);
  const waterTarget = toNum(draft.waterTarget, 8);
  const stepsTarget = toNum(draft.stepTarget, 10000);
  const completedCount = [
    mission.weight,
    mission.calories,
    mission.steps,
    mission.water >= waterTarget,
    mission.exerciseDone,
    mission.quranMemorized,
    mission.quranReviewed,
    mission.goal1Done,
    mission.goal2Done,
    ...mission.randomDone,
    ...Object.values(mission.salah),
  ].filter(Boolean).length;

  return (
    <main className={pageBg}>
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-[2rem] bg-slate-950 p-6 text-white">
          <div className="flex items-center justify-between gap-4">
            <button onClick={() => router.push("/settings")} className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400 text-lg font-black text-slate-950">{String(draft.name || "C").slice(0, 1)}</button>
            <div className="text-center">
              <h1 className="text-2xl font-black">The Challenge</h1>
              <p className="text-sm font-bold text-slate-300">Day {currentDay} of {totalDays} • {dateLabel}</p>
            </div>
            <Link href="/tools" className="rounded-full bg-white/10 px-4 py-2 text-xs font-black text-emerald-200">Tools</Link>
          </div>
        </header>

        <section className="rounded-[2rem] bg-emerald-950 p-6 text-white shadow-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-black text-emerald-300">{spiritual.label}</p>
              <h2 className="mt-1 text-3xl font-black">Start with the heart.</h2>
            </div>
            <span className="rounded-full bg-emerald-400 px-4 py-2 text-xs font-black text-slate-950">Daily</span>
          </div>
          <p className="mt-5 text-right text-3xl font-black leading-loose" dir="rtl">{spiritual.arabic}</p>
          <p className="mt-3 text-base font-semibold leading-7 text-emerald-50">{spiritual.translation}</p>
          <p className="mt-2 text-xs font-black text-emerald-200">{spiritual.source}</p>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Link href="/leaderboard" className={cardClass}>
            <p className="text-sm font-black text-emerald-700">Leaderboard</p>
            <h2 className="mt-1 text-2xl font-black">No fake users.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Leaderboard opens when real users join. For now, your row is waiting.</p>
            <p className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm font-black text-slate-900">You • {score}/100</p>
          </Link>

          <Link href="/ranks" className={cardClass}>
            <p className="text-sm font-black text-emerald-700">Ranking</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-black">{formatRank(score)}</h2>
              <span className={`rounded-full px-3 py-1 text-xs font-black ${rank.color}`}>{rank.name}</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-500">Next: {rank.nextRank}</p>
            <div className="mt-4 h-3 rounded-full bg-slate-100"><div className="h-3 rounded-full bg-emerald-500" style={{ width: `${rank.progressToNext}%` }} /></div>
          </Link>

          <Link href="/share-card" className={cardClass}>
            <p className="text-sm font-black text-emerald-700">Progress</p>
            <h2 className="mt-1 text-2xl font-black">{score}/100 points</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Milestones become share cards at Day 30, 60, and 90.</p>
          </Link>
        </section>

        <section className={cardClass}>
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-black text-emerald-700">Tracking Today</p>
              <h2 className="text-3xl font-black">Your daily mission</h2>
              <p className="mt-1 text-sm font-bold text-slate-500">{completedCount} items logged today</p>
            </div>
            {isFriday && <span className="rounded-full bg-emerald-950 px-4 py-2 text-xs font-black text-white">Jumu'ah Mode Active</span>}
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <TrackCard title="Weight" done={Boolean(mission.weight)} subtitle={`Last: ${draft.currentWeightLbs || "—"} ${draft.unitSystem === "metric" ? "kg" : "lbs"}`}>
              <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" type="number" placeholder="Log weight" value={mission.weight} onChange={(e) => setMission({ ...mission, weight: e.target.value })} />
            </TrackCard>

            <TrackCard title="Calories" done={Boolean(mission.calories)} subtitle={`${mission.calories || 0} / ${calorieTarget}`}>
              <div className="mt-2 h-2 rounded-full bg-slate-200"><div className="h-2 rounded-full bg-emerald-500" style={{ width: pct(toNum(mission.calories), calorieTarget) }} /></div>
              <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" type="number" placeholder="Add calories" value={mission.calories} onChange={(e) => setMission({ ...mission, calories: e.target.value })} />
              <Link href="/food-photo" className="mt-2 inline-block text-xs font-black text-emerald-700">Log from photo →</Link>
            </TrackCard>

            <TrackCard title="Water" done={mission.water >= waterTarget} subtitle={`${mission.water} / ${waterTarget} cups`}>
              <div className="mt-2 flex flex-wrap gap-2">{Array.from({ length: waterTarget }, (_, i) => <button key={i} onClick={() => setMission({ ...mission, water: i + 1 })} className={`rounded-full border px-3 py-2 ${i < mission.water ? "border-sky-500 bg-sky-500 text-white" : "border-slate-300 bg-white text-slate-400"}`}>💧</button>)}</div>
            </TrackCard>

            <TrackCard title="Steps" done={toNum(mission.steps) >= stepsTarget} subtitle={`${formatNum(mission.steps || 0)} / ${formatNum(stepsTarget)} steps`}>
              <div className="mt-2 h-2 rounded-full bg-slate-200"><div className="h-2 rounded-full bg-emerald-500" style={{ width: pct(toNum(mission.steps), stepsTarget) }} /></div>
              <input className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" type="number" placeholder="Add steps" value={mission.steps} onChange={(e) => setMission({ ...mission, steps: e.target.value })} />
            </TrackCard>

            <TrackCard title="Exercise" done={mission.exerciseDone} subtitle="Workout complete">
              <label className="mt-2 flex gap-2 text-sm font-bold"><input type="checkbox" checked={mission.exerciseDone} onChange={(e) => setMission({ ...mission, exerciseDone: e.target.checked })} /> Done</label>
            </TrackCard>

            <TrackCard title="Qur'an" done={Boolean(mission.quranMemorized || mission.quranReviewed)} subtitle={`${draft.measurementUnit || "units"}`}>
              <div className="mt-2 grid gap-2 md:grid-cols-2"><input className="rounded-xl border border-slate-200 px-3 py-2 text-sm" type="number" placeholder="Memorized" value={mission.quranMemorized} onChange={(e) => setMission({ ...mission, quranMemorized: e.target.value })} /><input className="rounded-xl border border-slate-200 px-3 py-2 text-sm" type="number" placeholder="Reviewed" value={mission.quranReviewed} onChange={(e) => setMission({ ...mission, quranReviewed: e.target.value })} /></div>
            </TrackCard>

            <div className="rounded-2xl bg-slate-50 p-4 md:col-span-2">
              <h3 className="font-black">Salah</h3>
              <div className="mt-3 grid gap-2 md:grid-cols-5">{Object.keys(mission.salah).map((prayer) => <label key={prayer} className="rounded-xl bg-white p-3 text-sm font-bold"><input className="mr-2" type="checkbox" checked={mission.salah[prayer]} onChange={(e) => setMission({ ...mission, salah: { ...mission.salah, [prayer]: e.target.checked } })} />{prayer}</label>)}</div>
            </div>

            <TrackCard title={draft.goal1 || "Personal Goal 1"} done={mission.goal1Done} subtitle={draft.goal1Task || "Daily task"}>
              <label className="mt-2 flex gap-2 text-sm font-bold"><input type="checkbox" checked={mission.goal1Done} onChange={(e) => setMission({ ...mission, goal1Done: e.target.checked })} /> Done</label>
              <Link href="/intentions" className="mt-2 inline-block text-xs font-black text-emerald-700">Set when/where →</Link>
            </TrackCard>

            <TrackCard title={draft.goal2 || "Personal Goal 2"} done={mission.goal2Done} subtitle={draft.goal2Task || "Daily task"}>
              <label className="mt-2 flex gap-2 text-sm font-bold"><input type="checkbox" checked={mission.goal2Done} onChange={(e) => setMission({ ...mission, goal2Done: e.target.checked })} /> Done</label>
              <Link href="/intentions" className="mt-2 inline-block text-xs font-black text-emerald-700">Set when/where →</Link>
            </TrackCard>

            {tasks.map((task, i) => (
              <TrackCard key={task} title={isFriday ? `Jumu'ah Bonus ${i + 1}` : `Random Task ${i + 1}`} done={mission.randomDone[i]} subtitle={task}>
                <label className="mt-2 flex gap-2 text-sm font-bold"><input type="checkbox" checked={mission.randomDone[i]} onChange={(e) => { const next = [...mission.randomDone]; next[i] = e.target.checked; setMission({ ...mission, randomDone: next }); }} /> Done</label>
              </TrackCard>
            ))}
          </div>
        </section>

        <section className={cardClass}>
          <p className="text-sm font-black text-emerald-700">Reflection</p>
          <h2 className="text-3xl font-black">How did today feel?</h2>
          <div className="mt-4 flex flex-wrap gap-2">{[["1", "😔"], ["2", "😕"], ["3", "😐"], ["4", "🙂"], ["5", "😄"]].map(([value, emoji]) => <button key={value} onClick={() => setReflectionMood(value)} className={`rounded-2xl px-5 py-3 text-2xl ${reflectionMood === value ? "bg-emerald-500" : "bg-slate-100"}`}>{emoji}</button>)}</div>
          <textarea className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-emerald-600" rows={4} placeholder="What went well? What slipped?" value={reflectionText} onChange={(e) => setReflectionText(e.target.value)} />
          <button onClick={() => router.push("/check-in")} className="mt-4 w-full rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white">Finalize today</button>
        </section>
      </div>
    </main>
  );
}

function TrackCard({ title, subtitle, done, children }: { title: string; subtitle: string; done: boolean; children: React.ReactNode }) {
  return <div className={`rounded-2xl p-4 transition ${done ? "bg-emerald-50 ring-2 ring-emerald-200" : "bg-slate-50"}`}><div className="flex items-start justify-between gap-3"><div><h3 className="font-black text-slate-950">{title}</h3><p className="mt-1 text-xs font-semibold text-slate-500">{subtitle}</p></div><span className={`rounded-full px-3 py-1 text-xs font-black ${done ? "bg-emerald-600 text-white" : "bg-white text-slate-400"}`}>{done ? "✓" : ""}</span></div>{children}</div>;
}
