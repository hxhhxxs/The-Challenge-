"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureUserRecord } from "@/lib/supabase/ensure-user-record";
import { cardClass, dayOfChallenge, daysBetween, pageBg } from "@/lib/challenge-ui";
import { formatRank, getRankFromScore } from "@/lib/ranks";

const pillars = [
  { key: "quwwah", name: "Quwwah", arabic: "قُوَّة", meaning: "Strength", score: 0, description: "Body, steps, exercise, water, calories." },
  { key: "imaan", name: "Imaan", arabic: "إِيمَان", meaning: "Faith", score: 0, description: "Qur'an, salah, worship, dhikr." },
  { key: "sabr", name: "Sabr", arabic: "صَبْر", meaning: "Discipline", score: 0, description: "Sleep, screen time, money, limits." },
  { key: "niyyah", name: "Niyyah", arabic: "نِيَّة", meaning: "Mission", score: 0, description: "Personal goals and intention." },
  { key: "adab", name: "Adab", arabic: "أَدَب", meaning: "Character", score: 0, description: "Reflection, service, family, joy tasks." },
];

const titleMap: Record<string, { english: string; arabic: string }> = {
  quwwah: { english: "The Strong", arabic: "القَوِيّ" },
  imaan: { english: "The Steadfast", arabic: "الثَّابِت" },
  sabr: { english: "The Patient", arabic: "الصَّابِر" },
  niyyah: { english: "The Sincere", arabic: "الْمُخْلِص" },
  adab: { english: "The Refined", arabic: "الْمُهَذَّب" },
  balanced: { english: "Al-Muwazin — The Balanced", arabic: "المُوَازِن" },
};

export default function ProfilePage() {
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

  const total = useMemo(() => pillars.reduce((sum, pillar) => sum + pillar.score, 0), []);
  const overallScore = Math.round(total / 5);
  const overallRank = getRankFromScore(overallScore);
  const strongest = pillars[0];
  const title = titleMap.balanced;

  if (!draft) return <main className={pageBg}><section className={`${cardClass} mx-auto max-w-xl`}>Loading profile…</section></main>;

  const currentDay = Math.min(daysBetween(draft.startDate, draft.endDate) || 1, dayOfChallenge(draft.startDate));
  const totalDays = daysBetween(draft.startDate, draft.endDate) || 1;
  const name = draft.name || "Challenger";
  const initials = String(name).split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return (
    <main className={pageBg}>
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[2rem] bg-slate-950 p-6 text-white">
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-[2rem] bg-gradient-to-br from-emerald-300 via-white to-amber-200 text-4xl font-black text-slate-950 shadow-2xl">
              {initials}
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-300">Character Sheet</p>
              <h1 className="mt-1 text-4xl font-black">{name}</h1>
              <p className="mt-2 text-xl font-black text-emerald-200">{title.english}</p>
              <p className="mt-1 text-lg font-black" dir="rtl">{title.arabic}</p>
              <p className="mt-2 text-sm font-bold text-slate-300">Challenge Day {currentDay} of {totalDays} • Overall {formatRank(overallScore)}</p>
            </div>
          </div>
        </section>

        <section className={cardClass}>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-black text-emerald-700">The 5 Pillars</p>
              <h2 className="text-3xl font-black">Your growth profile</h2>
              <p className="mt-2 text-sm text-slate-600">Each pillar becomes a real stat once daily check-ins save to your account.</p>
            </div>
            <span className={`rounded-full px-4 py-2 text-sm font-black ${overallRank.color}`}>{formatRank(overallScore)}</span>
          </div>

          <div className="mt-6 space-y-4">
            {pillars.map((pillar) => {
              const rank = getRankFromScore(pillar.score);
              return (
                <div key={pillar.key} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                    <div>
                      <p className="text-sm font-black text-emerald-700">{pillar.arabic}</p>
                      <h3 className="text-xl font-black">{pillar.name} — {pillar.meaning}</h3>
                      <p className="mt-1 text-sm text-slate-600">{pillar.description}</p>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="text-sm font-black text-slate-950">{formatRank(pillar.score)}</p>
                      <p className="text-xs font-bold text-slate-500">{pillar.score}/100</p>
                    </div>
                  </div>
                  <div className="mt-3 h-3 rounded-full bg-white">
                    <div className="h-3 rounded-full bg-emerald-500" style={{ width: `${pillar.score}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className={cardClass}><p className="text-sm font-bold text-slate-500">Total</p><p className="mt-1 text-3xl font-black">{total} / 500</p></div>
          <div className={cardClass}><p className="text-sm font-bold text-slate-500">Strongest Pillar</p><p className="mt-1 text-3xl font-black">{strongest.name}</p></div>
          <div className={cardClass}><p className="text-sm font-bold text-slate-500">Next Unlock</p><p className="mt-1 text-3xl font-black">Bronze Title</p></div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard" className="rounded-full bg-slate-950 px-5 py-3 font-black text-white">Back to dashboard</Link>
          <Link href="/ranks" className="rounded-full bg-emerald-600 px-5 py-3 font-black text-white">View rank ladder</Link>
        </div>
      </div>
    </main>
  );
}
