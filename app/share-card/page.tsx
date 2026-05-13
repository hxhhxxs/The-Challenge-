"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cardClass, inputClass, pageBg } from "@/lib/challenge-ui";

const milestones = [30, 60, 90];

export default function ShareCardPage() {
  const [day, setDay] = useState("30");
  const [points, setPoints] = useState("34");
  const [perfectDays, setPerfectDays] = useState("12");
  const [streak, setStreak] = useState("7");
  const [badges, setBadges] = useState("Perfect Day, 10K Steps, Qur'an Warrior");
  const [copied, setCopied] = useState(false);

  const shareText = useMemo(() => {
    return `Day ${day} in The Challenge\n${points}/100 points earned\n${perfectDays} perfect days\nLongest streak: ${streak} days\nBadges: ${badges}\n\nStart yours: https://thechallenge.club/landing`;
  }, [day, points, perfectDays, streak, badges]);

  async function copyShareText() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className={pageBg}>
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[2rem] bg-slate-950 p-6 text-white">
          <p className="text-sm font-bold text-emerald-300">Milestone Share Cards</p>
          <h1 className="mt-1 text-4xl font-black">Turn progress into a proud moment.</h1>
          <p className="mt-2 max-w-2xl text-slate-300">Create a public-safe card for Day 30, 60, or 90. It never includes private health, money, reflection, or photo-proof data.</p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className={cardClass}>
            <h2 className="text-2xl font-black">Card settings</h2>
            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Milestone day</span>
                <select className={inputClass} value={day} onChange={(e) => setDay(e.target.value)}>
                  {milestones.map((milestone) => <option key={milestone} value={milestone}>Day {milestone}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Points earned</span>
                <input className={inputClass} type="number" value={points} onChange={(e) => setPoints(e.target.value)} />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Perfect days</span>
                <input className={inputClass} type="number" value={perfectDays} onChange={(e) => setPerfectDays(e.target.value)} />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Longest streak</span>
                <input className={inputClass} type="number" value={streak} onChange={(e) => setStreak(e.target.value)} />
              </label>
              <label className="block">
                <span className="text-sm font-bold text-slate-700">Badges</span>
                <input className={inputClass} value={badges} onChange={(e) => setBadges(e.target.value)} />
              </label>
            </div>
          </div>

          <div className={cardClass}>
            <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-wide text-emerald-300">The Challenge</p>
                  <h2 className="mt-1 text-5xl font-black">Day {day}</h2>
                </div>
                <div className="rounded-full bg-emerald-400 px-5 py-3 text-xl font-black text-slate-950">{points}/100</div>
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-3">
                <Stat label="Perfect days" value={perfectDays} />
                <Stat label="Longest streak" value={`${streak} days`} />
                <Stat label="Milestone" value={`${day} days`} />
              </div>

              <div className="mt-8 rounded-2xl bg-white/10 p-5">
                <p className="text-sm font-bold text-emerald-200">Badges earned</p>
                <p className="mt-2 text-lg font-black">{badges}</p>
              </div>

              <p className="mt-8 text-center text-sm font-bold text-slate-300">100 points. One challenge. A new you.</p>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <button onClick={copyShareText} className="rounded-full bg-emerald-600 px-5 py-3 font-black text-white">{copied ? "Copied" : "Copy caption"}</button>
              <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} className="rounded-full bg-slate-100 px-5 py-3 text-center font-black text-slate-900">WhatsApp</a>
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`} className="rounded-full bg-slate-100 px-5 py-3 text-center font-black text-slate-900">Twitter/X</a>
            </div>

            <p className="mt-3 text-xs font-semibold text-slate-500">Next backend step: generate this as a real downloadable image using Vercel OG or Cloudinary.</p>
          </div>
        </section>

        <div className="flex gap-3">
          <Link href="/dashboard" className="rounded-full bg-slate-950 px-5 py-3 font-black text-white">Back to dashboard</Link>
          <Link href="/partner" className="rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Partner page</Link>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 p-4 text-center">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-300">{label}</p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
    </div>
  );
}
