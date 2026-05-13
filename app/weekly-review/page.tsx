"use client";

import Link from "next/link";
import { useState } from "react";
import { cardClass, inputClass, pageBg } from "@/lib/challenge-ui";

const slips = [
  "Water was low on 3 days",
  "Screen time went over limit twice",
  "One missed workout",
  "Reflection was skipped on 2 days",
];

const wins = [
  "You showed up 5 days this week",
  "You completed Qur'an review 4 times",
  "You hit steps goal 3 times",
  "You protected your morning routine twice",
];

export default function WeeklyReviewPage() {
  const [scoreThisWeek, setScoreThisWeek] = useState("8.5");
  const [scoreLastWeek, setScoreLastWeek] = useState("6.2");
  const [perfectDays, setPerfectDays] = useState("2");
  const [selectedSlips, setSelectedSlips] = useState<string[]>([slips[0], slips[1]]);
  const [selectedWins, setSelectedWins] = useState<string[]>([wins[0], wins[1]]);

  const improved = Number(scoreThisWeek) >= Number(scoreLastWeek);

  return (
    <main className={pageBg}>
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[2rem] bg-slate-950 p-6 text-white">
          <p className="text-sm font-bold text-emerald-300">Weekly Review</p>
          <h1 className="mt-1 text-4xl font-black">Your Week in The Challenge</h1>
          <p className="mt-2 max-w-2xl text-slate-300">A weekly summary users can read in-app now and receive by email later.</p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className={cardClass}>
            <p className="text-sm font-bold text-slate-500">Score this week</p>
            <input className={`${inputClass} mt-3 text-3xl font-black`} value={scoreThisWeek} onChange={(e) => setScoreThisWeek(e.target.value)} />
          </div>
          <div className={cardClass}>
            <p className="text-sm font-bold text-slate-500">Score last week</p>
            <input className={`${inputClass} mt-3 text-3xl font-black`} value={scoreLastWeek} onChange={(e) => setScoreLastWeek(e.target.value)} />
          </div>
          <div className={cardClass}>
            <p className="text-sm font-bold text-slate-500">Perfect days</p>
            <input className={`${inputClass} mt-3 text-3xl font-black`} value={perfectDays} onChange={(e) => setPerfectDays(e.target.value)} />
          </div>
        </section>

        <section className={cardClass}>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-bold text-emerald-700">AI-style reflection preview</p>
              <h2 className="text-2xl font-black">{improved ? "You improved this week." : "This was a reset week."}</h2>
            </div>
            <span className={`rounded-full px-4 py-2 text-sm font-black ${improved ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{improved ? "+" : ""}{(Number(scoreThisWeek) - Number(scoreLastWeek)).toFixed(1)} pts</span>
          </div>
          <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-700">
            You earned {scoreThisWeek} points this week compared with {scoreLastWeek} last week. Your strongest signal was showing up consistently. The biggest opportunity is to protect the habits that slip at night, especially water, screen time, and reflection.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <ReviewList title="Wins this week" items={wins} selected={selectedWins} onChange={setSelectedWins} tone="win" />
          <ReviewList title="Things that slipped" items={slips} selected={selectedSlips} onChange={setSelectedSlips} tone="slip" />
        </section>

        <section className={cardClass}>
          <h2 className="text-2xl font-black">Next week preview</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <PreviewCard title="Body" text="Hit water before noon and steps before Maghrib." />
            <PreviewCard title="Faith" text="Anchor Qur'an after Fajr or before sleep." />
            <PreviewCard title="Discipline" text="Choose one screen limit to protect first." />
          </div>
        </section>

        <section className="rounded-[2rem] bg-emerald-100 p-5 text-emerald-950">
          <p className="font-black">Email automation later</p>
          <p className="mt-1 text-sm font-semibold">Backend next step: send this every Sunday using a cron job + Resend, with real daily_logs data and an AI-generated reflection.</p>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard" className="rounded-full bg-slate-950 px-5 py-3 font-black text-white">Back to dashboard</Link>
          <Link href="/share-card" className="rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Create share card</Link>
        </div>
      </div>
    </main>
  );
}

function ReviewList({ title, items, selected, onChange, tone }: { title: string; items: string[]; selected: string[]; onChange: (items: string[]) => void; tone: "win" | "slip" }) {
  return (
    <div className={cardClass}>
      <h2 className="text-2xl font-black">{title}</h2>
      <div className="mt-4 space-y-2">
        {items.map((item) => {
          const active = selected.includes(item);
          return (
            <label key={item} className={`flex gap-2 rounded-2xl p-3 text-sm font-bold ${active ? tone === "win" ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900" : "bg-slate-50 text-slate-600"}`}>
              <input type="checkbox" checked={active} onChange={(e) => e.target.checked ? onChange([...selected, item]) : onChange(selected.filter((x) => x !== item))} />
              {item}
            </label>
          );
        })}
      </div>
    </div>
  );
}

function PreviewCard({ title, text }: { title: string; text: string }) {
  return <div className="rounded-2xl bg-slate-50 p-4"><p className="font-black text-slate-950">{title}</p><p className="mt-1 text-sm text-slate-600">{text}</p></div>;
}
