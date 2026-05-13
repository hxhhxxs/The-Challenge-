"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureUserRecord } from "@/lib/supabase/ensure-user-record";
import { cardClass, dayOfChallenge, pageBg } from "@/lib/challenge-ui";

export default function ShareCardPage() {
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
      setDraft((record.onboarding_draft || {}) as Record<string, any>);
    }
    load();
  }, [router]);

  if (!draft) return <main className={pageBg}><section className={`${cardClass} mx-auto max-w-xl`}>Loading share card…</section></main>;

  const currentDay = dayOfChallenge(draft.startDate);
  const nextMilestone = currentDay < 30 ? 30 : currentDay < 60 ? 60 : currentDay < 90 ? 90 : 90;
  const daysToGo = Math.max(0, nextMilestone - currentDay);
  const unlocked = currentDay >= 30;

  if (!unlocked) {
    return (
      <main className={pageBg}>
        <div className="mx-auto max-w-5xl space-y-6">
          <section className="rounded-[2rem] bg-slate-950 p-6 text-white">
            <p className="text-sm font-bold text-emerald-300">Milestone Share Cards</p>
            <h1 className="mt-1 text-4xl font-black">Your first share card unlocks at Day 30.</h1>
            <p className="mt-2 max-w-2xl text-slate-300">No fake milestones. Your card will use real stats from your challenge.</p>
          </section>

          <section className={cardClass}>
            <p className="text-sm font-black text-emerald-700">Locked</p>
            <h2 className="mt-1 text-3xl font-black">{daysToGo} days to go.</h2>
            <p className="mt-3 text-slate-600">You are on Day {currentDay}. Keep logging honestly. When Day 30 arrives, this page will generate a public-safe card with real stats only.</p>
            <div className="mt-5 h-3 rounded-full bg-slate-100">
              <div className="h-3 rounded-full bg-emerald-500" style={{ width: `${Math.min(100, (currentDay / 30) * 100)}%` }} />
            </div>
          </section>

          <div className="flex gap-3">
            <Link href="/dashboard" className="rounded-full bg-slate-950 px-5 py-3 font-black text-white">Back to dashboard</Link>
            <Link href="/check-in" className="rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Log today</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={pageBg}>
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[2rem] bg-slate-950 p-6 text-white">
          <p className="text-sm font-bold text-emerald-300">Milestone Share Cards</p>
          <h1 className="mt-1 text-4xl font-black">Milestone unlocked.</h1>
          <p className="mt-2 max-w-2xl text-slate-300">Real card generation will connect to saved daily logs next.</p>
        </section>
        <section className={cardClass}>
          <h2 className="text-2xl font-black">Day {nextMilestone} card placeholder</h2>
          <p className="mt-3 text-slate-600">This card is unlocked, but it will not display stats until daily logs are saved to Supabase.</p>
        </section>
        <Link href="/dashboard" className="inline-block rounded-full bg-slate-950 px-5 py-3 font-black text-white">Back to dashboard</Link>
      </div>
    </main>
  );
}
