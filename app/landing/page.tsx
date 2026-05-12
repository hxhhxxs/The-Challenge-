import Link from "next/link";
import { cardClass, pageBg } from "@/lib/challenge-ui";

const features = [
  ["🎯", "Daily personalized mission", "Your body, faith, discipline, and goals turn into one clear daily plan."],
  ["📊", "Honest 0–100 scoring", "Your challenge has a pace, a score, and a reason to show up daily."],
  ["🛡️", "Privacy by choice", "Your data is yours. Compete only when you choose to."],
];

const steps = [
  ["1", "Tell us about your life", "A 10-minute setup builds your challenge around your real goals."],
  ["2", "Get your daily mission", "Each day gives you body, Qur’an, discipline, and personal goal tasks."],
  ["3", "Be honest and hit 100", "Log progress daily and climb toward 100 by your end date."],
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
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">The personalized app that rebuilds your body, faith, discipline, and goals in one daily mission.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3">
            <Link href="/signup" className="rounded-full bg-emerald-500 px-8 py-4 font-black text-slate-950 shadow-lg shadow-emerald-500/20">Start My Challenge</Link>
            <p className="text-sm font-semibold text-slate-300">Free during beta. No card required.</p>
            <Link href="/login" className="text-sm font-bold text-emerald-200 underline underline-offset-4">I already have an account</Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {steps.map(([num, title, text]) => (
            <div key={title} className="rounded-[2rem] bg-white/90 p-5 shadow-lg shadow-emerald-950/5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-black text-white">{num}</div>
              <h2 className="text-lg font-black">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-[1fr_0.9fr]">
          <div className={cardClass}>
            <p className="text-sm font-bold text-emerald-700">Dashboard preview</p>
            <div className="mt-4 rounded-[2rem] bg-slate-950 p-5 text-white">
              <div className="flex items-center justify-between"><span className="font-black">The Challenge</span><span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-black text-slate-950">Day 1</span></div>
              <div className="mt-5 text-center"><div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-8 border-emerald-400 text-3xl font-black">0/100</div><p className="mt-3 text-sm text-slate-300">Today’s mission is ready.</p></div>
              <div className="mt-5 grid gap-2"><div className="rounded-xl bg-white/10 p-3 text-sm">☑ Water • 0 / 8</div><div className="rounded-xl bg-white/10 p-3 text-sm">☑ Qur’an • 0 / goal</div><div className="rounded-xl bg-white/10 p-3 text-sm">☑ Personal goal • ready</div></div>
            </div>
          </div>
          <div className="grid gap-4">
            {features.map(([icon, title, text]) => (
              <div key={title} className={cardClass}>
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-2xl">{icon}</div>
                <h2 className="text-xl font-black">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={cardClass}>
          <h2 className="text-2xl font-black">Quick FAQ</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {[
              ["How long is a challenge?", "30 to 365 days. Most people start with 60 or 90."],
              ["Is it free?", "Yes, free during beta."],
              ["What if I miss a day?", "You keep going. Honest recovery is part of the score."],
              ["Do I need a gym?", "No. You can choose walking, bodyweight, boxing, or gym."],
              ["Is this just for Muslims?", "No, but it includes Qur’an and worship tools for users who want them."],
              ["Is my data private?", "Yes. Sensitive progress stays private unless you choose to share."],
            ].map(([q, a]) => <div key={q} className="rounded-2xl bg-slate-50 p-4"><p className="font-black">{q}</p><p className="mt-1 text-sm text-slate-600">{a}</p></div>)}
          </div>
        </section>

        <footer className="flex flex-col items-center justify-center gap-2 py-6 text-center text-sm font-semibold text-slate-500">
          <p>© {new Date().getFullYear()} The Challenge. Built by Adi.</p>
          <p>Privacy • Terms • Contact • Instagram coming soon</p>
        </footer>
      </div>
    </main>
  );
}
