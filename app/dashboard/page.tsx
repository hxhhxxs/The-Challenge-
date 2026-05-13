"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureUserRecord } from "@/lib/supabase/ensure-user-record";
import { cardClass, dayOfChallenge, daysBetween, pageBg } from "@/lib/challenge-ui";
import { formatRank, getRankFromScore } from "@/lib/ranks";

const spiritualCards = [
  { label: "Verse of the day", arabic: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا", translation: "Indeed, with hardship comes ease.", source: "Qur'an 94:6" },
  { label: "Du'a of the day", arabic: "رَبِّ زِدْنِي عِلْمًا", translation: "My Lord, increase me in knowledge.", source: "Qur'an 20:114" },
  { label: "Du'a of the day", arabic: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ", translation: "O Allah, help me remember You, thank You, and worship You beautifully.", source: "Daily du'a" },
  { label: "Verse of the day", arabic: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا", translation: "Whoever is mindful of Allah, He will make a way out for them.", source: "Qur'an 65:2" },
];

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
            <Link href="/settings" className="rounded-full bg-white/10 px-4 py-2 text-xs font-black text-emerald-200">Profile</Link>
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

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <HomeCard href="/check-in" icon="✅" label="Tracking Today" title="Log today’s mission" text="Open the full tracking page for calories, water, steps, exercise, Qur’an, salah, goals, and tasks." badge="Open tracker" />
          <HomeCard href="/leaderboard" icon="🏆" label="Leaderboard" title="See the board" text="View your leaderboard row and the real-user ranking system. No fake users shown." badge="Compete" />
          <HomeCard href="/ranks" icon="🥉" label="Ranking" title={formatRank(score)} text={`You are ${formatRank(score)}. Next: ${rank.nextRank}.`} badge={`${rank.progressToNext}% to next`} />
          <HomeCard href="/weekly-review" icon="📝" label="Reflection" title="Review your week" text="Use reflection to see what went well, what slipped, and what needs to change next." badge="Reflect" />
          <HomeCard href="/tools" icon="🧰" label="Tools" title="Challenge tools" text="Open Ramadan Mode, partner, share cards, food photo logging, why reset, and more." badge="All tools" />
          <HomeCard href="/limits" icon="📊" label="Limits" title="Monthly limits" text="Track spending, restaurants, screen time, TV, snacks, and other discipline limits." badge="Limits" />
        </section>

        <section className={cardClass}>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-black text-emerald-700">Quick score</p>
              <h2 className="text-3xl font-black">{score}/100 points</h2>
              <p className="mt-1 text-sm font-semibold text-slate-600">Rank: {formatRank(score)} • Day {currentDay} of {totalDays}</p>
            </div>
            <Link href="/share-card" className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white">Create share card</Link>
          </div>
          <div className="mt-5 h-3 rounded-full bg-slate-100">
            <div className="h-3 rounded-full bg-emerald-500" style={{ width: `${score}%` }} />
          </div>
        </section>
      </div>
    </main>
  );
}

function HomeCard({ href, icon, label, title, text, badge }: { href: string; icon: string; label: string; title: string; text: string; badge: string }) {
  return (
    <Link href={href} className={`${cardClass} group transition hover:-translate-y-1 hover:shadow-2xl`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-3xl">{icon}</div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-800">{badge}</span>
      </div>
      <p className="mt-5 text-sm font-black text-emerald-700">{label}</p>
      <h2 className="mt-1 text-2xl font-black text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
      <p className="mt-5 text-sm font-black text-emerald-700">Open →</p>
    </Link>
  );
}
