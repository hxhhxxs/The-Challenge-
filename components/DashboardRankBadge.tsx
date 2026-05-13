"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { formatRank, getRankFromScore } from "@/lib/ranks";

export default function DashboardRankBadge() {
  const pathname = usePathname();

  if (pathname !== "/dashboard") return null;

  // Starter value. Next backend step: replace this with computed user score from daily_logs.
  const score = 0;
  const rank = getRankFromScore(score);

  return (
    <Link
      href="/ranks"
      className="fixed right-4 top-4 z-50 w-48 rounded-2xl border border-white/50 bg-white/95 p-3 shadow-2xl backdrop-blur transition hover:-translate-y-0.5"
    >
      <div className="flex items-center justify-between gap-2">
        <span className={`rounded-full px-3 py-1 text-xs font-black ${rank.color}`}>{formatRank(score)}</span>
        <span className="text-xs font-black text-slate-500">Rank</span>
      </div>
      <div className="mt-3">
        <div className="flex items-center justify-between text-[10px] font-black text-slate-500">
          <span>Next: {rank.nextRank}</span>
          <span>{rank.progressToNext}%</span>
        </div>
        <div className="mt-1 h-2 rounded-full bg-slate-100">
          <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${rank.progressToNext}%` }} />
        </div>
      </div>
    </Link>
  );
}
