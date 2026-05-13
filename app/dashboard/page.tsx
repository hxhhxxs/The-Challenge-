"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureUserRecord } from "@/lib/supabase/ensure-user-record";
import { cardClass, dayOfChallenge, daysBetween, pageBg } from "@/lib/challenge-ui";
import { formatRank, getRankFromScore } from "@/lib/ranks";

const spiritualCards = [
  { label: "Verse of the day", theme: "After difficulty, ease.", arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا", translation: "Indeed, with hardship comes ease.", source: "Qur'an 94:6" },
  { label: "Du'a of the day", theme: "Ask Allah for growth.", arabic: "رَبِّ زِدْنِي عِلْمًا", translation: "My Lord, increase me in knowledge.", source: "Qur'an 20:114" },
  { label: "Du'a of the day", theme: "Remember. Thank. Worship beautifully.", arabic: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ", translation: "O Allah, help me remember You, thank You, and worship You beautifully.", source: "Daily du'a" },
  { label: "Verse of the day", theme: "Taqwa opens a way.", arabic: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا", translation: "Whoever is mindful of Allah, He will make a way out for them.", source: "Qur'an 65:2" },
];

function greetingFor(name?: string) {
  const first = String(name || "Challenger").trim().split(/\s+/)[0] || "Challenger";
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return `Sabah al-khayr, ${first}`;
  if (hour >= 12 && hour < 17) return `As-salamu alaykum, ${first}`;
  if (hour >= 17 && hour < 21) return `Masa' al-khayr, ${first}`;
  return `As-salamu alaykum, ${first}`;
}

function hijriLabel(date: Date) {
  try {
    return new Intl.DateTimeFormat("en-US-u-ca-islamic", { day: "numeric", month: "long", year: "numeric" }).format(date);
  } catch {
    return "Hijri date";
  }
}

function RankEmblem({ score }: { score: number }) {
  const rank = getRankFromScore(score);
  const palette: Record<string, string> = {
    Iron: "from-stone-500 to-stone-200",
    Bronze: "from-orange-700 to-orange-300",
    Silver: "from-slate-500 to-slate-200",
    Gold: "from-yellow-600 to-yellow-200",
    Platinum: "from-cyan-600 to-cyan-200",
    Emerald: "from-emerald-700 to-emerald-200",
    Diamond: "from-blue-700 to-indigo-200",
    Master: "from-purple-700 to-fuchsia-200",
    Grandmaster: "from-red-700 to-orange-200",
    Challenger: "from-sky-600 via-amber-200 to-white",
  };
  return <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${palette[rank.name] || palette.Iron} shadow-inner`}><span className="h-6 w-6 rounded-full border-2 border-white/80 bg-white/20" /></span>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<Record<string, any> | null>(null);

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

  if (!draft) {
    return <main className={pageBg}><section className={`${cardClass} mx-auto max-w-xl`}>Loading dashboard…</section></main>;
  }

  const today = new Date();
  const currentDay = Math.min(daysBetween(draft.startDate, draft.endDate) || 1, dayOfChallenge(draft.startDate));
  const totalDays = daysBetween(draft.startDate, draft.endDate) || 1;
  const dateLabel = today.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
  const score = 0;
  const rank = getRankFromScore(score);
  const spiritual = spiritualCards[(currentDay + today.getDay()) % spiritualCards.length];
  const isFriday = today.getDay() === 5;

  return (
    <main className={pageBg}>
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-[2rem] bg-slate-950 p-6 text-white">
          <div className="flex items-center justify-between gap-4">
            <button onClick={() => router.push("/settings")} className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400 text-lg font-black text-slate-950">{String(draft.name || "C").slice(0, 1)}</button>
            <div className="text-center">
              <h1 className="text-2xl font-black">{greetingFor(draft.name)}</h1>
              <p className="text-sm font-bold text-slate-300">Day {currentDay} of {totalDays} • {dateLabel} • {hijriLabel(today)}</p>
              {isFriday && <p className="mt-1 text-xs font-black text-emerald-300">Jumu'ah Mubarak</p>}
            </div>
            <Link href="/settings" className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-sm font-black text-emerald-200">{String(draft.name || "C").slice(0, 1)}</Link>
          </div>
        </header>

        <section className="rounded-[2rem] bg-emerald-950 p-6 text-white shadow-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-black text-emerald-300">{spiritual.label}</p>
              <h2 className="mt-1 text-3xl font-black">{spiritual.theme}</h2>
            </div>
            <span className="rounded-full bg-emerald-400 px-4 py-2 text-xs font-black text-slate-950">Daily</span>
          </div>
          <p className="mt-5 text-right text-3xl font-black leading-loose" dir="rtl">{spiritual.arabic}</p>
          <p className="mt-3 text-base font-semibold leading-7 text-emerald-50">{spiritual.translation}</p>
          <p className="mt-2 text-xs font-black text-emerald-200">{spiritual.source}</p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <HomeCard href="/check-in" icon={<LineIcon kind="check" />} label="Tracking Today" title="Log today’s mission" text="Open the full tracking page for calories, water, steps, exercise, Qur’an, salah, goals, and tasks." badge="Today" />
          <HomeCard href="/leaderboard" icon={<LineIcon kind="trophy" />} label="Leaderboard" title="See the board" text="View your leaderboard row and the real-user ranking system. No fake users shown." badge={formatRank(score)} />
          <HomeCard href="/ranks" icon={<RankEmblem score={score} />} label="Ranking" title={formatRank(score)} text={`You are ${formatRank(score)}. Next: ${rank.nextRank}.`} badge={`${rank.progressToNext}%`} />
          <HomeCard href="/weekly-review" icon={<LineIcon kind="note" />} label="Reflection" title="Review your week" text="Use reflection to see what went well, what slipped, and what needs to change next." badge="Due weekly" />
          <HomeCard href="/tools" icon={<LineIcon kind="tools" />} label="Tools" title="Challenge tools" text="Open Ramadan Mode, partner, share cards, food photo logging, why reset, and more." badge="Hub" />
          <HomeCard href="/limits" icon={<LineIcon kind="chart" />} label="Limits" title="Monthly limits" text="Track spending, restaurants, screen time, TV, snacks, and other discipline limits." badge="This month" />
        </section>

        <section className={cardClass}>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-black text-emerald-700">Next promotion</p>
              <h2 className="text-3xl font-black">{rank.nextRank}</h2>
              <p className="mt-1 text-sm font-semibold text-slate-600">Current rank: {formatRank(score)} • Day {currentDay} of {totalDays}</p>
            </div>
            <Link href="/ranks" className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white">View rank ladder</Link>
          </div>
          <div className="mt-5 h-3 rounded-full bg-slate-100">
            <div className="h-3 rounded-full bg-emerald-500" style={{ width: `${rank.progressToNext}%` }} />
          </div>
        </section>
      </div>
    </main>
  );
}

function HomeCard({ href, icon, label, title, text, badge }: { href: string; icon: React.ReactNode; label: string; title: string; text: string; badge: string }) {
  return (
    <Link href={href} className={`${cardClass} group transition hover:-translate-y-1 hover:shadow-2xl`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-900">{icon}</div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-800">{badge}</span>
      </div>
      <p className="mt-5 text-sm font-black text-emerald-700">{label}</p>
      <h2 className="mt-1 text-2xl font-black text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
      <p className="mt-5 text-sm font-black text-emerald-700">Open →</p>
    </Link>
  );
}

function LineIcon({ kind }: { kind: string }) {
  const paths: Record<string, string> = {
    check: "M5 13l4 4L19 7",
    trophy: "M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4ZM17 6h3a3 3 0 0 1-3 3M7 6H4a3 3 0 0 0 3 3",
    note: "M6 4h12v16H6zM9 8h6M9 12h6M9 16h4",
    tools: "M14 7l-7 7M5 19l4-1 9-9-3-3-9 9-1 4Z",
    chart: "M4 19V5M8 17v-6M13 17V8M18 17v-9M4 19h17",
  };
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d={paths[kind] || paths.check} /></svg>;
}
