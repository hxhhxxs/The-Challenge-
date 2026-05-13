"use client";

import Link from "next/link";
import { useState } from "react";
import { cardClass, inputClass, pageBg } from "@/lib/challenge-ui";

type Plan = {
  task: string;
  time: string;
  place: string;
};

export default function IntentionsPage() {
  const [goal1, setGoal1] = useState<Plan>({ task: "", time: "", place: "" });
  const [goal2, setGoal2] = useState<Plan>({ task: "", time: "", place: "" });

  return (
    <main className={pageBg}>
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-[2rem] bg-slate-950 p-6 text-white">
          <p className="text-sm font-bold text-emerald-300">Implementation Intentions</p>
          <h1 className="mt-1 text-4xl font-black">Turn goals into a real plan.</h1>
          <p className="mt-2 text-slate-300">Write exactly what you will do, when you will do it, and where you will do it.</p>
        </section>

        <section className={cardClass}>
          <h2 className="text-2xl font-black">Personal Goal 1</h2>
          <PlanForm value={goal1} onChange={setGoal1} />
          <PlanPreview value={goal1} />
        </section>

        <section className={cardClass}>
          <h2 className="text-2xl font-black">Personal Goal 2</h2>
          <PlanForm value={goal2} onChange={setGoal2} />
          <PlanPreview value={goal2} />
        </section>

        <section className="rounded-[2rem] bg-emerald-100 p-5 text-emerald-950">
          <p className="font-black">Example</p>
          <p className="mt-1 text-sm font-semibold">I will memorize 5 lines at 6:00 AM at my desk after Fajr.</p>
        </section>

        <div className="flex gap-3">
          <Link href="/dashboard" className="rounded-full bg-slate-950 px-5 py-3 font-black text-white">Back to dashboard</Link>
          <button className="rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Save plan</button>
        </div>
      </div>
    </main>
  );
}

function PlanForm({ value, onChange }: { value: Plan; onChange: (value: Plan) => void }) {
  return (
    <div className="mt-4 grid gap-4 md:grid-cols-3">
      <label className="block">
        <span className="text-sm font-bold text-slate-700">I will...</span>
        <input className={inputClass} placeholder="Practice boxing footwork" value={value.task} onChange={(e) => onChange({ ...value, task: e.target.value })} />
      </label>
      <label className="block">
        <span className="text-sm font-bold text-slate-700">At...</span>
        <input className={inputClass} placeholder="6:00 AM" value={value.time} onChange={(e) => onChange({ ...value, time: e.target.value })} />
      </label>
      <label className="block">
        <span className="text-sm font-bold text-slate-700">In/at...</span>
        <input className={inputClass} placeholder="my room / the gym" value={value.place} onChange={(e) => onChange({ ...value, place: e.target.value })} />
      </label>
    </div>
  );
}

function PlanPreview({ value }: { value: Plan }) {
  if (!value.task && !value.time && !value.place) return null;
  return (
    <div className="mt-4 rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Your plan</p>
      <p className="mt-1 font-bold text-slate-950">
        I will {value.task || "[task]"} {value.time ? `at ${value.time}` : "at [time]"} {value.place ? `in/at ${value.place}` : "in/at [place]"}.
      </p>
    </div>
  );
}
