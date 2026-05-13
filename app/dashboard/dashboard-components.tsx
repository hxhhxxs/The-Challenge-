import Link from "next/link";
import { cardClass } from "@/lib/challenge-ui";
import { getRankFromScore } from "@/lib/ranks";

export const FALLBACK_ARABIC = "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا";
export const FALLBACK_ENGLISH = "Indeed, with hardship comes ease.";
export const FALLBACK_REF = "Qur'an 94:6";

export function greetingFor(name?: string) {
  const first = String(name || "Challenger").trim().split(/\s+/)[0] || "Challenger";
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return `Sabah al-khayr, ${first}`;
  if (hour >= 12 && hour < 17) return `As-salamu alaykum, ${first}`;
  if (hour >= 17 && hour < 21) return `Masa' al-khayr, ${first}`;
  return `As-salamu alaykum, ${first}`;
}

export function hijriLabel(date: Date) {
  try {
    return new Intl.DateTimeFormat("en-US-u-ca-islamic", { day: "numeric", month: "long", year: "numeric" }).format(date);
  } catch {
    return "Hijri date";
  }
}

export function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

export function RankEmblem({ score }: { score: number }) {
  const rank = getRankFromScore(score);
  const palette: Record<string, string> = {
    Iron: "from-stone-500 to-stone-200",
    Bronze: "from-orange-700 to-orange-300",
    Silver: "from-slate-500 to-slate-200",
    Gold: "from-yellow-600 to-yellow-200",
    Platinum: "from-cyan-600 to-cyan-200",
    Emerald: "from-emerald-700 to-emerald-200",
    Diamond: "from-blue-700 to-indigo-200",
    Master: "from-purple-700 to-fuchsia-200",
    Grandmaster: "from-red-700 to-orange-200",
    Challenger: "from-sky-600 via-amber-200 to-white",
  };
  return (
    <span className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${palette[rank.name] || palette.Iron} shadow-inner`}>
      <span className="h-6 w-6 rounded-full border-2 border-white/80 bg-white/20" />
    </span>
  );
}

export function DashboardHeader({ draft, subtitle, marker, router }: { draft: Record<string, any>; subtitle: string; marker: string; router: any }) {
  return (
    <header className="rounded-[2rem] bg-slate-950 p-6 text-white">
      <div className="flex items-center justify-between gap-4">
        <button onClick={() => router.push("/settings")} className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400 text-lg font-black text-slate-950">{String(draft.name || "C").slice(0, 1)}</button>
        <div className="text-center">
          <p className="text-xs font-black text-emerald-300">{marker}</p>
          <h1 className="text-2xl font-black">{greetingFor(draft.name)}</h1>
          <p className="text-sm font-bold text-slate-300">{subtitle}</p>
        </div>
        <Link href="/profile" className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-sm font-black text-emerald-200">{String(draft.name || "C").slice(0, 1)}</Link>
      </div>
    </header>
  );
}

export function LearningCard({ item }: { item: Record<string, any> }) {
  const arabicText = item.arabicText || FALLBACK_ARABIC;
  const englishText = item.shortText || FALLBACK_ENGLISH;
  const referenceText = item.reference || FALLBACK_REF;
  return (
    <Link href="/learning" className="block rounded-[2rem] bg-emerald-950 p-6 text-white shadow-xl transition hover:-translate-y-1 hover:shadow-2xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div><p className="text-sm font-black text-emerald-300">Today's Qur'an / Hadith</p><h2 className="mt-1 text-3xl font-black">{item.title || "With hardship comes ease"}</h2></div>
        <span className="rounded-full bg-emerald-400 px-4 py-2 text-xs font-black text-slate-950">Open library</span>
      </div>
      <div className="mt-5 rounded-[1.5rem] border border-emerald-300/30 bg-white/10 p-5">
        <p className="mb-2 text-xs font-black uppercase tracking-wide text-emerald-200">Arabic</p>
        <p dir="rtl" lang="ar" className="text-right text-4xl font-black leading-loose text-white">{arabicText}</p>
      </div>
      <p className="mt-5 text-lg font-semibold leading-8 text-emerald-50">{englishText}</p>
      <p className="mt-2 text-xs font-black text-emerald-200">{referenceText}</p>
    </Link>
  );
}

export function HomeCard({ href, icon, label, title, text, badge, disabled = false }: { href: string; icon: React.ReactNode; label: string; title: string; text: string; badge: string; disabled?: boolean }) {
  return (
    <Link href={href} onClick={(e) => { if (disabled) e.preventDefault(); }} className={`${cardClass} group transition ${disabled ? "cursor-not-allowed opacity-60" : "hover:-translate-y-1 hover:shadow-2xl"}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-900">{icon}</div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-800">{badge}</span>
      </div>
      <p className="mt-5 text-sm font-black text-emerald-700">{label}</p>
      <h2 className="mt-1 text-2xl font-black text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
      <p className="mt-5 text-sm font-black text-emerald-700">{disabled ? "Locked" : "Open →"}</p>
    </Link>
  );
}

export function LineIcon({ kind }: { kind: string }) {
  const paths: Record<string, string> = {
    check: "M5 13l4 4L19 7",
    plus: "M12 5v14M5 12h14",
    chart: "M4 19V5M8 17v-6M13 17V8M18 17v-9M4 19h17",
    trophy: "M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4ZM17 6h3a3 3 0 0 1-3 3M7 6H4a3 3 0 0 0 3 3",
    tools: "M14 7l-7 7M5 19l4-1 9-9-3-3-9 9-1 4Z",
    profile: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0",
    book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 0 4 19.5v-15Z",
  };
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d={paths[kind] || paths.check} /></svg>;
}
