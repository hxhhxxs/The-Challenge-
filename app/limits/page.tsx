import Link from "next/link";
import { cardClass, pageBg } from "@/lib/challenge-ui";

const limits = [
  ["Spending money", "$0 used", "Monthly money limit from onboarding."],
  ["Restaurant visits", "0 used", "Restaurant and fast-food tracking."],
  ["Fast food", "0 used", "Fast-food count this month."],
  ["Going out", "0 used", "Going-out count this month."],
  ["Sweets/snacks", "0 used", "Snack and sweets limit."],
  ["Cheat meals", "0 used", "Cheat meal count."],
  ["Screen time", "0 hrs used", "Daily screen time limit."],
  ["TV / Netflix", "0 hrs used", "Entertainment time tracking."],
];

export default function LimitsPage() {
  return (
    <main className={pageBg}>
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[2rem] bg-slate-950 p-6 text-white">
          <p className="text-sm font-bold text-emerald-300">Monthly Limits</p>
          <h1 className="mt-1 text-4xl font-black">Stay inside your limits.</h1>
          <p className="mt-2 text-slate-300">These cards will connect to daily check-ins and monthly totals.</p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {limits.map(([name, used, description]) => (
            <div key={name} className={cardClass}>
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-black">{name}</h2>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">{used}</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{description}</p>
              <div className="mt-4 h-3 rounded-full bg-slate-100">
                <div className="h-3 w-0 rounded-full bg-emerald-500" />
              </div>
              <p className="mt-2 text-xs font-semibold text-slate-500">Progress starts when check-ins save to Supabase daily_logs.</p>
            </div>
          ))}
        </section>

        <Link href="/dashboard" className="inline-block rounded-full bg-slate-950 px-5 py-3 font-black text-white">Back to dashboard</Link>
      </div>
    </main>
  );
}
