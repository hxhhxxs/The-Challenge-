import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { cardClass, pageBg } from "@/lib/challenge-ui";

const badges = [
  { name: "Perfect Day", icon: "sun", description: "Earn 90%+ of your daily points.", progress: "0 / 1 perfect days" },
  { name: "7-Day Streak", icon: "flame", description: "Complete 7 strong days.", progress: "0 / 7 days" },
  { name: "30-Day Streak", icon: "halo", description: "Stay consistent for 30 days.", progress: "0 / 30 days" },
  { name: "Qur'an Warrior", icon: "book", description: "Hit your Qur'an goal repeatedly.", progress: "0 / 10 sessions" },
  { name: "No Restaurant Week", icon: "fork", description: "Stay under restaurant and fast-food limits for a week.", progress: "0 / 7 days" },
  { name: "10K Steps", icon: "foot", description: "Walk 10,000+ steps in a day.", progress: "0 / 10,000 steps" },
  { name: "20K Steps", icon: "sparkFoot", description: "Walk 20,000+ steps in a day.", progress: "0 / 20,000 steps" },
  { name: "Early Wake-Up", icon: "sunrise", description: "Wake up on time consistently.", progress: "0 / 7 mornings" },
  { name: "Water Goal", icon: "drop", description: "Hit your water goal consistently.", progress: "0 / 7 days" },
  { name: "Screen Control", icon: "phone", description: "Stay under screen limits.", progress: "0 / 7 days" },
  { name: "Weekly Champion", icon: "trophy", description: "Finish your weekly big task.", progress: "0 / 1 trials" },
  { name: "Comeback", icon: "arrow", description: "Recover after a missed day.", progress: "Locked until needed" },
  { name: "Family Connection", icon: "heart", description: "Complete family or service tasks.", progress: "0 / 5 tasks" },
  { name: "Joy Without Guilt", icon: "spark", description: "Complete joy tasks in a healthy way.", progress: "0 / 5 tasks" },
];

export default function BadgesPage() {
  return (
    <main className={pageBg}>
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[2rem] bg-slate-950 p-6 text-white">
          <p className="text-sm font-bold text-emerald-300">Badges</p>
          <h1 className="mt-1 text-4xl font-black">Earn proof of progress.</h1>
          <p className="mt-2 text-slate-300">Badges unlock as your daily logs, streaks, worship, and service grow.</p>
        </section>

        <section className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          {badges.map((badge) => (
            <div key={badge.name} className={cardClass}>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <BadgeIcon kind={badge.icon} />
              </div>
              <h2 className="text-lg font-black">{badge.name}</h2>
              <p className="mt-2 text-sm text-slate-600">{badge.description}</p>
              <p className="mt-4 rounded-full bg-slate-100 px-3 py-2 text-center text-xs font-black text-slate-500">{badge.progress}</p>
            </div>
          ))}
        </section>

        <div className="flex flex-wrap gap-3">
          <Link href="/progress" className="inline-block rounded-full bg-slate-950 px-5 py-3 font-black text-white">View progress</Link>
          <Link href="/check-in" className="inline-block rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Log today</Link>
        </div>
      </div>
      <BottomNav />
    </main>
  );
}

function BadgeIcon({ kind }: { kind: string }) {
  const paths: Record<string, string[]> = {
    sun: ["M12 3v2M12 19v2M3 12h2M19 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19", "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"],
    flame: ["M12 22c4-1 7-4 7-8 0-4-3-7-6-11 0 4-4 5-4 9-2-1-3-3-3-5-2 2-3 5-3 8 0 4 4 7 9 7Z"],
    halo: ["M8 5c1-2 7-2 8 0M12 22c4-1 7-4 7-8 0-4-3-7-6-11 0 4-4 5-4 9-2-1-3-3-3-5-2 2-3 5-3 8 0 4 4 7 9 7Z"],
    book: ["M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 0 4 19.5v-15Z"],
    fork: ["M6 3v8M9 3v8M6 7h3M15 3v18M18 3v18", "M3 21 21 3"],
    foot: ["M10 19c-2 0-4-2-4-5 0-3 2-6 4-8 2 2 4 5 4 8 0 3-2 5-4 5ZM16 21c-1 0-2-1-2-2s1-2 2-2 2 1 2 2-1 2-2 2Z"],
    sparkFoot: ["M10 19c-2 0-4-2-4-5 0-3 2-6 4-8 2 2 4 5 4 8 0 3-2 5-4 5ZM18 4l.5 1.5L20 6l-1.5.5L18 8l-.5-1.5L16 6l1.5-.5L18 4Z"],
    sunrise: ["M4 18h16M6 15a6 6 0 0 1 12 0M12 3v5M5 9l2 2M19 9l-2 2"],
    drop: ["M12 2s7 7 7 12a7 7 0 0 1-14 0c0-5 7-12 7-12Z"],
    phone: ["M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z", "M9 18h6", "M5 5l14 14"],
    trophy: ["M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4ZM17 6h3a3 3 0 0 1-3 3M7 6H4a3 3 0 0 0 3 3"],
    arrow: ["M4 14a8 8 0 0 1 13-6", "M17 4v4h-4", "M20 10a8 8 0 0 1-13 6", "M7 20v-4h4"],
    heart: ["M20 8c0 6-8 12-8 12S4 14 4 8a4 4 0 0 1 8-2 4 4 0 0 1 8 2Z"],
    spark: ["M12 3l1.5 5L19 10l-5.5 2L12 17l-1.5-5L5 10l5.5-2L12 3Z"],
  };
  return <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">{(paths[kind] || paths.sun).map((d, i) => <path key={i} d={d} />)}</svg>;
}