import Link from "next/link";
import { cardClass, pageBg } from "@/lib/challenge-ui";

const tools = [
  { title: "Progress", href: "/progress", icon: "chart", description: "See your current score, pace, 5 Pillars breakdown, and recent saved check-ins.", tag: "Score" },
  { title: "Learning Library", href: "/learning", icon: "book", description: "Browse verses, hadiths, Sahaba stories, Prophet ﷺ stories, and challenge content.", tag: "Faith" },
  { title: "Implementation Intentions", href: "/intentions", icon: "target", description: "Write exactly what you will do, when you will do it, and where you will do it.", tag: "Planning" },
  { title: "Ramadan Mode", href: "/ramadan", icon: "moon", description: "Track fasting, Taraweeh, suhoor, iftar, Qur’an pacing, and Ramadan missions.", tag: "Faith" },
  { title: "Accountability Partner", href: "/partner", icon: "users", description: "Invite one trusted person to see your consistency and send encouragement.", tag: "Social" },
  { title: "Milestone Share Card", href: "/share-card", icon: "share", description: "Create a public-safe Day 30, 60, or 90 progress card to share.", tag: "Growth" },
  { title: "Why Reset", href: "/why-reset", icon: "refresh", description: "Re-read and refresh your original reasons when motivation drops.", tag: "Motivation" },
  { title: "Weekly Review", href: "/weekly-review", icon: "calendar", description: "Review wins, slips, score changes, and next week’s focus.", tag: "Reflection" },
  { title: "Photo Food Log", href: "/food-photo", icon: "camera", description: "Upload a meal photo, confirm calories, and prepare it for your daily log.", tag: "Body" },
  { title: "Badges", href: "/badges", icon: "medal", description: "See badges, unlock criteria, and progress toward milestones.", tag: "Progress" },
  { title: "Monthly Limits", href: "/limits", icon: "sliders", description: "Track spending, restaurants, screen time, snacks, and other monthly limits.", tag: "Discipline" },
];

export default function ToolsPage() {
  return (
    <main className={pageBg}>
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] bg-slate-950 p-6 text-white">
          <p className="text-sm font-bold text-emerald-300">Challenge Tools</p>
          <h1 className="mt-1 text-4xl font-black">Everything that makes the challenge stronger.</h1>
          <p className="mt-2 max-w-2xl text-slate-300">Open progress, learning, special modes, accountability tools, review pages, share cards, and food logging from one place.</p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link key={tool.href} href={tool.href} className={`${cardClass} group transition hover:-translate-y-1 hover:shadow-2xl`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-900">
                  <LineIcon kind={tool.icon} />
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-800">{tool.tag}</span>
              </div>
              <h2 className="mt-5 text-2xl font-black text-slate-950">{tool.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{tool.description}</p>
              <p className="mt-5 text-sm font-black text-emerald-700">Open →</p>
            </Link>
          ))}
        </section>

        <section className="rounded-[2rem] bg-emerald-100 p-5 text-emerald-950">
          <p className="font-black">Presentation note</p>
          <p className="mt-1 text-sm font-semibold">Progress, learning, and tracking are now connected in the app. The next backend layer can move check-ins into a dedicated daily_logs table.</p>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard" className="rounded-full bg-slate-950 px-5 py-3 font-black text-white">Back to dashboard</Link>
          <Link href="/progress" className="rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Progress</Link>
          <Link href="/learning" className="rounded-full bg-emerald-100 px-5 py-3 font-black text-emerald-950">Learning Library</Link>
        </div>
      </div>
    </main>
  );
}

function LineIcon({ kind }: { kind: string }) {
  const paths: Record<string, string> = {
    chart: "M4 19V5M8 17v-6M13 17V8M18 17v-9M4 19h17",
    book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 0 4 19.5v-15Z",
    target: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z",
    moon: "M21 12.8A8.5 8.5 0 1 1 11.2 3 6.5 6.5 0 0 0 21 12.8Z",
    users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
    share: "M18 8a3 3 0 1 0-2.8-4M6 12a3 3 0 1 0 0 .1M18 20a3 3 0 1 0-2.8-4M8.6 13.5l6.8 4M15.4 6.5l-6.8 4",
    refresh: "M21 12a9 9 0 0 1-15.5 6.2L3 16M3 12a9 9 0 0 1 15.5-6.2L21 8",
    calendar: "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z",
    camera: "M4 7h3l2-3h6l2 3h3v13H4V7ZM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
    medal: "M8 2l4 6 4-6M12 8l-4 6h8l-4-6ZM12 22a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z",
    sliders: "M4 6h16M4 12h16M4 18h16M8 4v4M14 10v4M18 16v4",
  };
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d={paths[kind] || paths.target} /></svg>;
}
