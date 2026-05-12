import Link from "next/link";
import { cardClass, pageBg } from "@/lib/challenge-ui";

export default function LeaderboardPage() {
  const tabs = ["Overall", "Streak", "This week", "Qur'an", "Fitness", "Comeback", "Friends", "Group"];

  return (
    <main className={pageBg}>
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[2rem] bg-slate-950 p-6 text-white">
          <p className="text-sm font-bold text-emerald-300">Leaderboard</p>
          <h1 className="mt-1 text-4xl font-black">No one here yet. Show up first.</h1>
          <p className="mt-2 text-slate-300">The full leaderboard will unlock when there are enough real users. No fake users will be shown.</p>
        </section>

        <section className={cardClass}>
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <span key={tab} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">{tab}</span>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-emerald-50 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-slate-500">Your row</p>
                <p className="text-xl font-black text-slate-950">1. You</p>
                <p className="text-sm text-slate-600">Start logging daily check-ins to build your score.</p>
              </div>
              <div className="rounded-full bg-white px-5 py-3 font-black text-emerald-700">0/100</div>
            </div>
          </div>
        </section>

        <Link href="/dashboard" className="inline-block rounded-full bg-slate-950 px-5 py-3 font-black text-white">Back to dashboard</Link>
      </div>
    </main>
  );
}
