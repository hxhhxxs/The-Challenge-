"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cardClass, inputClass, pageBg } from "@/lib/challenge-ui";

const ramadanTasks = [
  "Fasted today",
  "Prayed Taraweeh",
  "Read Qur'an today",
  "Made du'a before iftar",
  "Gave sadaqah",
  "Controlled tongue and anger",
  "Helped family before iftar",
  "No wasted scrolling before sleep",
];

const lastTenNights = [21, 23, 25, 27, 29];

export default function RamadanModePage() {
  const [day, setDay] = useState("1");
  const [fasted, setFasted] = useState(false);
  const [taraweeh, setTaraweeh] = useState(false);
  const [suhoor, setSuhoor] = useState("");
  const [iftar, setIftar] = useState("");
  const [quranPages, setQuranPages] = useState("");
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const currentDay = Number(day) || 1;
  const isLastTen = currentDay >= 21;
  const isOddNight = lastTenNights.includes(currentDay);
  const pagesNeeded = useMemo(() => {
    const pagesRead = Number(quranPages) || 0;
    const daysLeft = Math.max(1, 30 - currentDay + 1);
    return Math.max(0, Math.ceil((604 - pagesRead) / daysLeft));
  }, [quranPages, currentDay]);

  return (
    <main className={pageBg}>
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[2rem] bg-slate-950 p-6 text-white">
          <p className="text-sm font-bold text-emerald-300">Ramadan Mode</p>
          <h1 className="mt-1 text-4xl font-black">A challenge built for Ramadan.</h1>
          <p className="mt-2 max-w-2xl text-slate-300">Track fasting, Taraweeh, Qur'an pacing, suhoor, iftar, du'a, sadaqah, and worship goals in one Ramadan-focused view.</p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className={cardClass}>
            <label className="block">
              <span className="text-sm font-bold text-slate-700">Ramadan day</span>
              <input className={inputClass} type="number" min={1} max={30} value={day} onChange={(e) => setDay(e.target.value)} />
            </label>
            <p className="mt-3 text-sm font-bold text-slate-500">Day {currentDay} of 30</p>
          </div>

          <div className={cardClass}>
            <h2 className="text-xl font-black">Fasting</h2>
            <label className="mt-4 flex gap-2 text-sm font-bold">
              <input type="checkbox" checked={fasted} onChange={(e) => setFasted(e.target.checked)} />
              I fasted today
            </label>
            <label className="mt-3 block">
              <span className="text-sm font-bold text-slate-700">Suhoor note</span>
              <input className={inputClass} placeholder="What did you eat?" value={suhoor} onChange={(e) => setSuhoor(e.target.value)} />
            </label>
            <label className="mt-3 block">
              <span className="text-sm font-bold text-slate-700">Iftar note</span>
              <input className={inputClass} placeholder="What did you break fast with?" value={iftar} onChange={(e) => setIftar(e.target.value)} />
            </label>
          </div>

          <div className={cardClass}>
            <h2 className="text-xl font-black">Taraweeh</h2>
            <label className="mt-4 flex gap-2 text-sm font-bold">
              <input type="checkbox" checked={taraweeh} onChange={(e) => setTaraweeh(e.target.checked)} />
              I prayed Taraweeh / Qiyam
            </label>
            <p className="mt-3 rounded-2xl bg-slate-50 p-3 text-sm font-semibold text-slate-600">Keep this honest. Even a small sincere effort counts.</p>
          </div>
        </section>

        <section className={cardClass}>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-bold text-emerald-700">Qur'an Khatm Pacing</p>
              <h2 className="text-2xl font-black">Stay on pace for a full khatm.</h2>
              <p className="mt-1 text-sm text-slate-600">The mushaf is estimated at 604 pages. Enter how many pages you've read so far.</p>
            </div>
            <div className="rounded-2xl bg-emerald-100 px-5 py-4 text-center">
              <p className="text-xs font-black uppercase text-emerald-800">Needed daily</p>
              <p className="text-3xl font-black text-emerald-950">{pagesNeeded}</p>
              <p className="text-xs font-bold text-emerald-800">pages/day</p>
            </div>
          </div>
          <label className="mt-5 block max-w-sm">
            <span className="text-sm font-bold text-slate-700">Pages read so far</span>
            <input className={inputClass} type="number" value={quranPages} onChange={(e) => setQuranPages(e.target.value)} />
          </label>
        </section>

        {isLastTen && (
          <section className="rounded-[2rem] bg-amber-100 p-5 text-amber-950">
            <p className="text-sm font-black uppercase tracking-wide">Last 10 Nights</p>
            <h2 className="mt-1 text-2xl font-black">{isOddNight ? "Possible Laylatul Qadr night — push harder." : "Protect your worship tonight."}</h2>
            <p className="mt-1 text-sm font-semibold">Add extra Qur'an, du'a, sadaqah, repentance, and qiyam tonight.</p>
          </section>
        )}

        <section className={cardClass}>
          <h2 className="text-2xl font-black">Today's Ramadan Mission</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {ramadanTasks.map((task) => (
              <label key={task} className={`rounded-2xl p-4 text-sm font-bold transition ${checked[task] ? "bg-emerald-50 ring-2 ring-emerald-200" : "bg-slate-50"}`}>
                <input className="mr-2" type="checkbox" checked={Boolean(checked[task])} onChange={(e) => setChecked({ ...checked, [task]: e.target.checked })} />
                {task}
              </label>
            ))}
          </div>
        </section>

        <div className="flex gap-3">
          <Link href="/dashboard" className="rounded-full bg-slate-950 px-5 py-3 font-black text-white">Back to dashboard</Link>
          <button className="rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Save Ramadan log</button>
        </div>
      </div>
    </main>
  );
}
