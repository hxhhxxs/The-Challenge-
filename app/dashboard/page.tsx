"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureUserRecord } from "@/lib/supabase/ensure-user-record";
import { cardClass, dayOfChallenge, daysBetween, formatNum, pageBg } from "@/lib/challenge-ui";

const smallTasks = ["Drink water before every meal", "Clean your room for 10 minutes", "Call or text a family member", "No sugary drinks today", "Read 5 pages", "Stretch for 10 minutes", "Make your bed", "Give sadaqah, even $1"];
const weeklyTasks = ["Walk 50,000+ total steps this week", "Visit the masjid 3 times", "Deep clean your room or car", "Meal prep for 3 days", "No restaurant/fast food for 7 days", "Help someone quietly"];
const joyTasks = ["Draw something for 20 minutes", "Make a small glass painting", "Cook one healthy meal", "Take 5 creative photos", "Watch the sunset without your phone"];
function pick<T>(bank: T[], count: number, seed: number) { const i = Math.abs(seed) % bank.length; return [...bank.slice(i), ...bank.slice(0, i)].slice(0, count); }

export default function DashboardPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<Record<string, any> | null>(null);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) { router.push("/login"); return; }
      const record = await ensureUserRecord(data.user);
      if (!record.onboarding_complete) { router.push("/onboarding"); return; }
      setDraft((record.onboarding_draft || {}) as Record<string, any>);
    }
    load();
  }, [router]);

  const totalDays = daysBetween(draft?.startDate, draft?.endDate);
  const currentDay = Math.min(totalDays || 1, dayOfChallenge(draft?.startDate));
  const score = useMemo(() => Math.min(100, Math.round(logs.reduce((s, l) => s + (l.points || 0), 0) * 10) / 10), [logs]);
  const expected = totalDays ? Math.round((currentDay / totalDays) * 100) : 0;
  const status = score >= expected + 5 ? "Ahead 🟢" : score >= expected - 5 ? "On track 🔵" : score >= expected - 15 ? "Behind 🟡" : "Danger 🔴";
  const todayTasks = pick(smallTasks, 3, currentDay + logs.length);
  const weeklyTask = pick(weeklyTasks, 1, Math.floor(currentDay / 7))[0];
  const joyTask = pick(joyTasks, 1, currentDay + 2)[0];

  if (!draft) return <main className={pageBg}><section className={`${cardClass} mx-auto max-w-xl`}>Loading dashboard…</section></main>;

  return <main className={pageBg}><div className="mx-auto max-w-7xl space-y-6"><section className="rounded-[2rem] bg-slate-950 p-6 text-white"><div className="flex items-center justify-between"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-400 font-black text-slate-950">{String(draft.name || "C").slice(0,1)}</div><h1 className="text-xl font-black">The Challenge</h1><div className="font-black">🔥 {logs.length}</div></div><div className="mt-6 text-center"><div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full border-8 border-emerald-400 text-4xl font-black">{score}/100</div><p className="mt-4 font-bold">Day {currentDay} of {totalDays}</p><p className="mt-1 text-emerald-200">{status} • Expected today: {expected}/100</p></div></section><section className={cardClass}><h2 className="text-2xl font-black">Today's Mission</h2><div className="mt-4 grid gap-3 md:grid-cols-2">{[`Wake-up: ${draft.wakeTime}`, `Weight check-in: ${draft.currentWeightLbs} lbs`, `Calories: ${draft.calorieTarget}`, `Water: ${draft.waterTarget}`, `Steps: ${formatNum(draft.stepTarget)}`, `Exercise: ${draft.workoutMinutes || 45} min`, `Qur'an memorize: ${draft.dailyMemorizeGoal || draft.quranDailyTarget}`, `Qur'an review: ${draft.dailyReviewGoal || draft.quranReviewTarget}`, `Personal Goal 1: ${draft.goal1Task}`, `Personal Goal 2: ${draft.goal2Task}`, ...todayTasks.map((t, i) => `Random Task ${i + 1}: ${t}`), `Joy task: ${joyTask}`, `Weekly big task: ${weeklyTask}`].map((item) => <div key={item} className="rounded-2xl bg-slate-50 p-4 text-sm font-bold">{item}</div>)}</div><Link href="/check-in" className="mt-6 block rounded-full bg-emerald-600 px-5 py-3 text-center font-black text-white">Submit end-of-day check-in</Link></section><section className="grid gap-4 md:grid-cols-3"><Widget title="Monthly Limits" text="Spending, restaurants, screen time, and TV limits." href="/limits" /><Widget title="Leaderboard" text="No one here yet. Show up first." href="/leaderboard" /><Widget title="Badges" text="Perfect Day, 7-Day Streak, Qur'an Warrior and more." href="/badges" /></section><section className={cardClass}><h2 className="text-2xl font-black">Daily Reflection</h2><p className="mt-2 text-slate-600">How did today feel? Add this in your check-in so your progress has a story.</p></section></div></main>;
}
function Widget({ title, text, href }: { title: string; text: string; href: string }) { return <Link href={href} className={cardClass}><h2 className="text-xl font-black">{title}</h2><p className="mt-2 text-sm text-slate-600">{text}</p></Link>; }
