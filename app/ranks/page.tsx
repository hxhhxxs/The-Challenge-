import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { cardClass, pageBg } from "@/lib/challenge-ui";

const ranks = [
  { name: "Iron", color: "from-stone-700 to-stone-400", range: "0–9 pts", description: "Starting the journey. Show up and build proof." },
  { name: "Bronze", color: "from-orange-800 to-orange-400", range: "10–19 pts", description: "Early consistency. You are forming the habit." },
  { name: "Silver", color: "from-slate-500 to-slate-200", range: "20–29 pts", description: "Momentum is real. Your routine is taking shape." },
  { name: "Gold", color: "from-yellow-700 to-yellow-300", range: "30–39 pts", description: "Strong progress. You are ahead of most starters." },
  { name: "Platinum", color: "from-cyan-700 to-cyan-300", range: "40–49 pts", description: "Discipline is becoming part of your identity." },
  { name: "Emerald", color: "from-emerald-700 to-emerald-300", range: "50–59 pts", description: "Halfway transformed. Your standards are rising." },
  { name: "Diamond", color: "from-blue-700 to-indigo-300", range: "60–69 pts", description: "High-level consistency across body, faith, and goals." },
  { name: "Master", color: "from-purple-800 to-fuchsia-300", range: "70–79 pts", description: "You are leading yourself with serious control." },
  { name: "Grandmaster", color: "from-red-800 to-orange-300", range: "80–89 pts", description: "Elite discipline. You rarely miss what matters." },
  { name: "Challenger", color: "from-sky-600 via-amber-300 to-white", range: "90–100 pts", description: "The top tier. You finished the challenge with excellence." },
];

const divisions = ["III", "II", "I"];

export default function RanksPage() {
  return (
    <main className={pageBg}>
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] bg-slate-950 p-6 text-white">
          <p className="text-sm font-bold text-emerald-300">Rank System</p>
          <h1 className="mt-1 text-4xl font-black">Climb from Iron to Challenger.</h1>
          <p className="mt-2 max-w-2xl text-slate-300">
            Your 0–100 challenge score turns into a game-style rank. Every rank has three divisions: III, II, and I. Reach I, then promote to the next rank.
          </p>
        </section>

        <section className={cardClass}>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-bold text-emerald-700">How promotion works</p>
              <h2 className="text-2xl font-black">Score creates rank. Consistency creates promotion.</h2>
            </div>
            <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-800">0–100 Points</span>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <Rule title="Division III" text="Entry level for the rank." />
            <Rule title="Division II" text="Middle level. You are improving." />
            <Rule title="Division I" text="Promotion zone. Next rank is close." />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {ranks.map((rank) => (
            <div key={rank.name} className={`${cardClass} overflow-hidden`}>
              <div className={`h-28 rounded-[1.5rem] bg-gradient-to-br ${rank.color} shadow-inner`} />
              <h2 className="mt-4 text-2xl font-black">{rank.name}</h2>
              <p className="mt-1 text-sm font-black text-emerald-700">{rank.range}</p>
              <div className="mt-3 flex gap-2">
                {divisions.map((division) => (
                  <span key={division} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">{division}</span>
                ))}
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{rank.description}</p>
            </div>
          ))}
        </section>

        <section className={cardClass}>
          <h2 className="text-2xl font-black">Exact rank formula</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-white">
                <tr>
                  <th className="p-3">Score</th>
                  <th className="p-3">Rank</th>
                  <th className="p-3">Division</th>
                </tr>
              </thead>
              <tbody>
                {ranks.flatMap((rank, rankIndex) => divisions.map((division, divisionIndex) => {
                  const start = rankIndex * 10 + divisionIndex * 3;
                  const end = divisionIndex === 2 ? rankIndex * 10 + 9 : start + 2;
                  return (
                    <tr key={`${rank.name}-${division}`} className="border-t border-slate-100">
                      <td className="p-3 font-bold">{Math.min(start, 100)}–{Math.min(end, 100)}</td>
                      <td className="p-3 font-black">{rank.name}</td>
                      <td className="p-3">{division}</td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-900">
            Your rank updates automatically as your saved score grows across the challenge.
          </p>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link href="/progress" className="rounded-full bg-slate-950 px-5 py-3 font-black text-white">View my progress</Link>
          <Link href="/leaderboard" className="rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Leaderboard</Link>
        </div>
      </div>
      <BottomNav />
    </main>
  );
}

function Rule({ title, text }: { title: string; text: string }) {
  return <div className="rounded-2xl bg-slate-50 p-4"><p className="font-black text-slate-950">{title}</p><p className="mt-1 text-sm text-slate-600">{text}</p></div>;
}