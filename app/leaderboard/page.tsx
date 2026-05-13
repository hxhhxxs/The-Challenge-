import Link from "next/link";
import { cardClass, pageBg } from "@/lib/challenge-ui";
import { getRankFromScore, formatRank } from "@/lib/ranks";

export default function LeaderboardPage() {
  const tabs = ["Overall", "Streak", "This week", "Qur'an", "Fitness", "Comeback", "Friends", "Group"];
  const yourScore = 0;
  const yourRank = getRankFromScore(yourScore);

  return (
    <main className={pageBg}>
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[2rem] bg-slate-950 p-6 text-white">
          <p className="text-sm font-bold text-emerald-300">Leaderboard</p>
          <h1 className="mt-1 text-4xl font-black">Climb the ranks.</h1>
          <p className="mt-2 text-slate-300">No fake users are shown. Your rank starts at Iron III and rises as your 0–100 challenge score improves.</p>
        </section>

        <section className={cardClass}>
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <span key={tab} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">{tab}</span>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-emerald-50 p-5">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-bold text-slate-500">Your row</p>
                <p className="text-xl font-black text-slate-950">1. You</p>
                <p className="text-sm text-slate-600">Start logging daily check-ins to build your score and promote divisions.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`rounded-full px-5 py-3 font-black ${yourRank.color}`}>{formatRank(yourScore)}</span>
                <span className="rounded-full bg-white px-5 py-3 font-black text-emerald-700">{yourScore}/100</span>
              </div>
            </div>
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs font-black text-slate-500">
                <span>Progress to {yourRank.nextRank}</span>
                <span>{yourRank.progressToNext}%</span>
              </div>
              <div className="mt-2 h-3 rounded-full bg-white">
                <div className="h-3 rounded-full bg-emerald-500" style={{ width: `${yourRank.progressToNext}%` }} />
              </div>
            </div>
          </div>
        </section>

        <section className={cardClass}>
          <h2 className="text-2xl font-black">Rank ladder</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90].map((score) => {
              const rank = getRankFromScore(score);
              return <div key={score} className="rounded-2xl bg-slate-50 p-4"><span className={`rounded-full px-3 py-1 text-xs font-black ${rank.color}`}>{formatRank(score)}</span><p className="mt-3 text-sm font-bold text-slate-600">Starts at {score} pts</p></div>;
            })}
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard" className="inline-block rounded-full bg-slate-950 px-5 py-3 font-black text-white">Back to dashboard</Link>
          <Link href="/ranks" className="inline-block rounded-full bg-emerald-600 px-5 py-3 font-black text-white">View rank system</Link>
        </div>
      </div>
    </main>
  );
}
