"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureUserRecord } from "@/lib/supabase/ensure-user-record";
import { cardClass, dayOfChallenge, pageBg } from "@/lib/challenge-ui";

export default function WeeklyReviewPage() {
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

  if (!draft) return <main className={pageBg}><section className={`${cardClass} mx-auto max-w-xl`}>Loading weekly review…</section></main>;

  const currentDay = dayOfChallenge(draft.startDate);
  const unlockDate = new Date();
  unlockDate.setDate(unlockDate.getDate() + Math.max(0, 7 - currentDay));
  const unlockLabel = unlockDate.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  return (
    <main className={pageBg}>
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[2rem] bg-slate-950 p-6 text-white">
          <p className="text-sm font-bold text-emerald-300">Weekly Review</p>
          <h1 className="mt-1 text-4xl font-black">Your first review is not ready yet.</h1>
          <p className="mt-2 max-w-2xl text-slate-300">No fake stats. Your review only appears after real check-ins exist.</p>
        </section>

        {currentDay < 7 ? (
          <section className={cardClass}>
            <p className="text-sm font-black text-emerald-700">Locked</p>
            <h2 className="mt-1 text-3xl font-black">Your first weekly review unlocks on {unlockLabel}.</h2>
            <p className="mt-3 text-slate-600">Keep logging each day. Once you have enough real data, this page will show your actual wins, slips, score change, and next-week focus.</p>
            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-black text-slate-500">Current progress</p>
              <p className="mt-1 text-2xl font-black text-slate-950">Day {currentDay} / 7 needed</p>
            </div>
          </section>
        ) : (
          <section className={cardClass}>
            <p className="text-sm font-black text-amber-700">Need more check-ins</p>
            <h2 className="mt-1 text-3xl font-black">Log a few more days first.</h2>
            <p className="mt-3 text-slate-600">Weekly review needs at least 5 real daily check-ins before it can generate meaningful feedback.</p>
          </section>
        )}

        <section className="rounded-[2rem] bg-emerald-100 p-5 text-emerald-950">
          <p className="font-black">Coming after backend logging</p>
          <p className="mt-1 text-sm font-semibold">When daily logs save to Supabase, this will calculate real weekly score, perfect days, slipped categories, and a server-generated reflection.</p>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard" className="rounded-full bg-slate-950 px-5 py-3 font-black text-white">Back to dashboard</Link>
          <Link href="/check-in" className="rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Log today</Link>
        </div>
      </div>
    </main>
  );
}
