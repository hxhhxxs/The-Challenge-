import Link from "next/link";
import { cardClass, pageBg } from "@/lib/challenge-ui";

const features = [
  ["Daily personalized mission", "Your body, faith, discipline, and goals turn into one clear daily plan."],
  ["Honest 0–100 scoring", "Your challenge has a pace, a score, and a reason to show up daily."],
  ["Compete or stay private", "Leaderboard comes later, but privacy comes first."],
];

export default function LandingPage() {
  return (
    <main className={pageBg}>
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="flex items-center justify-center py-4">
          <div className="rounded-full bg-slate-950 px-5 py-2 text-sm font-black text-emerald-200">The Challenge</div>
        </header>
        <section className="rounded-[2.5rem] bg-slate-950 p-8 text-center text-white shadow-2xl md:p-14">
          <h1 className="mx-auto max-w-4xl text-5xl font-black tracking-tight md:text-7xl">100 points. One challenge. A new you.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">Rebuild your body, faith, discipline, and goals in one daily mission.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/signup" className="rounded-full bg-emerald-500 px-7 py-4 font-black text-slate-950">Start My Challenge</Link>
            <Link href="/login" className="rounded-full border border-white/20 px-7 py-4 font-bold text-white">I already have an account</Link>
          </div>
        </section>
        <section className="grid gap-4 md:grid-cols-3">
          {features.map(([title, text]) => (
            <div key={title} className={cardClass}>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-2xl">✓</div>
              <h2 className="text-xl font-black">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </section>
        <footer className="flex justify-center gap-6 py-6 text-sm font-semibold text-slate-500">
          <span>Privacy</span><span>Terms</span><span>Contact</span>
        </footer>
      </div>
    </main>
  );
}
