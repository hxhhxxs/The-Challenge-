import Link from "next/link";
import { cardClass, pageBg } from "@/lib/challenge-ui";

const tools = [
  {
    title: "Implementation Intentions",
    href: "/intentions",
    icon: "🧠",
    description: "Write exactly what you will do, when you will do it, and where you will do it.",
    tag: "Planning",
  },
  {
    title: "Ramadan Mode",
    href: "/ramadan",
    icon: "🌙",
    description: "Track fasting, Taraweeh, suhoor, iftar, Qur’an pacing, and Ramadan missions.",
    tag: "Faith",
  },
  {
    title: "Accountability Partner",
    href: "/partner",
    icon: "🤝",
    description: "Invite one trusted person to see your consistency and send encouragement.",
    tag: "Social",
  },
  {
    title: "Milestone Share Card",
    href: "/share-card",
    icon: "🏆",
    description: "Create a public-safe Day 30, 60, or 90 progress card to share.",
    tag: "Growth",
  },
  {
    title: "Why Reset",
    href: "/why-reset",
    icon: "🔥",
    description: "Re-read and refresh your original reasons when motivation drops.",
    tag: "Motivation",
  },
  {
    title: "Weekly Review",
    href: "/weekly-review",
    icon: "📬",
    description: "Review wins, slips, score changes, and next week’s focus.",
    tag: "Reflection",
  },
  {
    title: "Photo Food Log",
    href: "/food-photo",
    icon: "📸",
    description: "Upload a meal photo, confirm calories, and prepare it for your daily log.",
    tag: "Body",
  },
  {
    title: "Badges",
    href: "/badges",
    icon: "🏅",
    description: "See badges, unlock criteria, and progress toward milestones.",
    tag: "Progress",
  },
  {
    title: "Monthly Limits",
    href: "/limits",
    icon: "📊",
    description: "Track spending, restaurants, screen time, snacks, and other monthly limits.",
    tag: "Discipline",
  },
];

export default function ToolsPage() {
  return (
    <main className={pageBg}>
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] bg-slate-950 p-6 text-white">
          <p className="text-sm font-bold text-emerald-300">Challenge Tools</p>
          <h1 className="mt-1 text-4xl font-black">Everything that makes the challenge stronger.</h1>
          <p className="mt-2 max-w-2xl text-slate-300">
            Open the special modes, accountability tools, review pages, share cards, and food logging from one place.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Link key={tool.href} href={tool.href} className={`${cardClass} group transition hover:-translate-y-1 hover:shadow-2xl`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-3xl">
                  {tool.icon}
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-800">
                  {tool.tag}
                </span>
              </div>
              <h2 className="mt-5 text-2xl font-black text-slate-950">{tool.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{tool.description}</p>
              <p className="mt-5 text-sm font-black text-emerald-700">Open →</p>
            </Link>
          ))}
        </section>

        <section className="rounded-[2rem] bg-emerald-100 p-5 text-emerald-950">
          <p className="font-black">Next backend step</p>
          <p className="mt-1 text-sm font-semibold">
            These tools are now accessible. The next build layer is saving each tool’s data into Supabase and connecting the results back into the dashboard score.
          </p>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard" className="rounded-full bg-slate-950 px-5 py-3 font-black text-white">Back to dashboard</Link>
          <Link href="/landing" className="rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Landing page</Link>
        </div>
      </div>
    </main>
  );
}
