import Link from "next/link";
import { cardClass, pageBg } from "@/lib/challenge-ui";

const limits = [
  ["Spending money", "$0 of your monthly limit used", "Track every purchase and stay under budget."],
  ["Restaurant visits", "0 visits used", "Keep eating out intentional, not automatic."],
  ["Fast food", "0 meals used", "Protect your health and discipline."],
  ["Going out", "0 outings used", "Make plans that match your goals."],
  ["Sweets/snacks", "0 snacks used", "Notice cravings before they become habits."],
  ["Cheat meals", "0 meals used", "Enjoy planned flexibility without losing control."],
  ["Screen time", "0h used today", "Track phone, social, YouTube, gaming, and TV."],
  ["TV / Netflix", "0 episodes used", "Keep entertainment inside your weekly limit."],
];

export default function LimitsPage() {
  return (
    <main className={pageBg}>
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[2rem] bg-slate-950 p-6 text-white">
          <p className="text-sm font-bold text-emerald-300">Monthly Limits</p>
          <h1 className="mt-1 text-4xl font-black">Stay inside your limits.</h1>
          <p className="mt-2 text-slate-300">Every limit is here to protect your discipline, not shame you.</p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {limits.map(([name, used, description]) => (
            <div key={name} className={cardClass}>
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-black">{name}</h2>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">0%</span>
              </div>
              <p className="mt-2 text-sm font-bold text-slate-900">{used}</p>
              <p className="mt-1 text-sm text-slate-600">{description}</p>
              <div className="mt-4 h-3 rounded-full bg-slate-100">
                <div className="h-3 w-0 rounded-full bg-emerald-500" />
              </div>
              <p className="mt-2 text-xs font-semibold text-slate-500">Start logging on Tracking Today to fill this progress bar.</p>
            </div>
          ))}
        </section>

        <Link href="/dashboard" className="inline-block rounded-full bg-slate-950 px-5 py-3 font-black text-white">Back to dashboard</Link>
      </div>
    </main>
  );
}
