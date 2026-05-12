import Link from "next/link";
import { cardClass, pageBg } from "@/lib/challenge-ui";

const badges = [
  ["Perfect Day", "Earn 90%+ of your daily points."],
  ["7-Day Streak", "Complete 7 strong days."],
  ["30-Day Streak", "Stay consistent for 30 days."],
  ["Qur'an Warrior", "Hit your Qur'an goal repeatedly."],
  ["No Restaurant Week", "Stay under restaurant/fast-food limits for a week."],
  ["10K Steps", "Walk 10,000+ steps in a day."],
  ["20K Steps", "Walk 20,000+ steps in a day."],
  ["Early Wake-Up Streak", "Wake up on time consistently."],
  ["Water Goal Streak", "Hit your water goal consistently."],
  ["Screen Control", "Stay under screen limits."],
  ["Weekly Champion", "Finish your weekly big task."],
  ["Comeback", "Recover after a missed day."],
  ["Family Connection", "Complete family/service tasks."],
  ["Joy Without Guilt", "Complete joy tasks in a healthy way."],
];

export default function BadgesPage() {
  return (
    <main className={pageBg}>
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[2rem] bg-slate-950 p-6 text-white">
          <p className="text-sm font-bold text-emerald-300">Badges</p>
          <h1 className="mt-1 text-4xl font-black">Earn proof of progress.</h1>
          <p className="mt-2 text-slate-300">Badges unlock as your daily logs and streaks grow.</p>
        </section>

        <section className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {badges.map(([name, description]) => (
            <div key={name} className={cardClass}>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl grayscale">🏅</div>
              <h2 className="text-lg font-black">{name}</h2>
              <p className="mt-2 text-sm text-slate-600">{description}</p>
              <p className="mt-4 rounded-full bg-slate-100 px-3 py-2 text-center text-xs font-black text-slate-500">Locked</p>
            </div>
          ))}
        </section>

        <Link href="/dashboard" className="inline-block rounded-full bg-slate-950 px-5 py-3 font-black text-white">Back to dashboard</Link>
      </div>
    </main>
  );
}
