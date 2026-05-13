import type { Metadata } from 'next';
import Link from 'next/link';
import DashboardRankBadge from '@/components/DashboardRankBadge';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Challenge',
  description: 'A personalized 100-point whole-life transformation app.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="pb-24">
        <DashboardRankBadge />
        <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 gap-1 rounded-full border border-white/40 bg-slate-950/95 p-2 shadow-2xl backdrop-blur">
          <Link href="/dashboard" className="rounded-full px-3 py-2 text-[11px] font-black text-white hover:bg-white/10">Dashboard</Link>
          <Link href="/leaderboard" className="rounded-full px-3 py-2 text-[11px] font-black text-white hover:bg-white/10">Leaderboard</Link>
          <Link href="/tools" className="rounded-full bg-emerald-500 px-3 py-2 text-[11px] font-black text-slate-950">Tools</Link>
          <Link href="/settings" className="rounded-full px-3 py-2 text-[11px] font-black text-white hover:bg-white/10">Profile</Link>
        </div>
        {children}
      </body>
    </html>
  );
}
