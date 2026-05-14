import Link from "next/link";
import { cardClass } from "@/lib/challenge-ui";

export function CalmDashboardCard({ href, icon, title, subtitle, action }: { href: string; icon: React.ReactNode; title: string; subtitle: string; action: string }) {
  return (
    <Link href={href} className={`${cardClass} group block transition hover:-translate-y-1 hover:shadow-2xl`}>
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-900">{icon}</div>
        <div>
          <h2 className="text-2xl font-black text-slate-950">{title}</h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{subtitle}</p>
          <p className="mt-5 text-sm font-black text-emerald-700">{action} →</p>
        </div>
      </div>
    </Link>
  );
}

export function todayDoneCount(draft: Record<string, any>) {
  const date = new Date();
  const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const checkin = draft.checkins?.[key];
  if (!checkin) return 0;
  let done = 0;
  Object.values(checkin.entries || {}).forEach((value: any) => { if (Array.isArray(value) && value.length > 0) done += 1; });
  if (Object.values(checkin.salah || {}).some(Boolean)) done += 1;
  if (checkin.reflection && Object.values(checkin.reflection).some(Boolean)) done += 1;
  if (checkin.goals && Object.values(checkin.goals).some(Boolean)) done += 1;
  return done;
}
