import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { cardClass, pageBg } from "@/lib/challenge-ui";

const groups = [
  { heading: "Settings", items: [
    { title: "Profile", href: "/profile", icon: "users", description: "View your identity, title, and 5 Pillars." },
    { title: "My Niyyah", href: "/niyyah", icon: "heart", description: "Save the real reason you are doing this challenge." },
    { title: "Pick My Plan", href: "/plan-selection", icon: "target", description: "Choose your diet, exercise, and Qur'an plan options." },
    { title: "Edit Plan", href: "/edit-plan", icon: "sliders", description: "Update calories, Qur'an, workouts, goals, and limits." },
    { title: "Settings", href: "/settings", icon: "sliders", description: "Update account, privacy, and challenge preferences." },
  ]},
  { heading: "Daily Tools", items: [
    { title: "My Custom Goals & Tasks", href: "/goals", icon: "target", description: "Add extra personal goals and custom daily tasks." },
    { title: "Private Gallery", href: "/gallery", icon: "camera", description: "Save private challenge photos and memories by pillar." },
    { title: "Photo Food Log", href: "/food-photo", icon: "camera", description: "Use a meal photo to help log food." },
    { title: "Implementation Intentions", href: "/intentions", icon: "target", description: "Set your if-then plans for hard moments." },
    { title: "Monthly Limits", href: "/limits", icon: "sliders", description: "Track spending, restaurants, screen time, and limits." },
  ]},
  { heading: "Special Modes", items: [
    { title: "Ramadan Mode", href: "/ramadan", icon: "moon", description: "Track fasting, Taraweeh, Qur’an pacing, and Ramadan missions." },
    { title: "Accountability Partner", href: "/partner", icon: "users", description: "Invite one trusted person to encourage consistency." },
  ]},
  { heading: "Growth", items: [
    { title: "Milestone Share Card", href: "/share-card", icon: "share", description: "Create a public-safe Day 30, 60, or 90 card." },
    { title: "Why Reset", href: "/why-reset", icon: "refresh", description: "Revisit your reason when motivation drops." },
    { title: "Weekly Review", href: "/weekly-review", icon: "calendar", description: "Review real check-ins and plan next week." },
    { title: "Badges", href: "/badges", icon: "medal", description: "See milestones and badge progress." },
  ]},
];

export default function ToolsPage() {
  return (
    <main className={pageBg}>
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] bg-slate-950 p-6 text-white">
          <p className="text-sm font-bold text-emerald-300">More</p>
          <h1 className="mt-1 text-4xl font-black">Tools, settings, and special modes.</h1>
          <p className="mt-2 max-w-2xl text-slate-300">Everything useful, grouped so the dashboard can stay calm.</p>
        </section>

        {groups.map((group) => (
          <section key={group.heading} className="space-y-3">
            <h2 className="px-2 text-sm font-black uppercase tracking-wide text-slate-500">{group.heading}</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {group.items.map((tool) => (
                <Link key={tool.href} href={tool.href} className={`${cardClass} group transition hover:-translate-y-1 hover:shadow-2xl`}>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-900"><LineIcon kind={tool.icon} /></div>
                  <h3 className="mt-5 text-2xl font-black text-slate-950">{tool.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{tool.description}</p>
                  <p className="mt-5 text-sm font-black text-emerald-700">Open →</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
      <BottomNav />
    </main>
  );
}

function LineIcon({ kind }: { kind: string }) {
  const paths: Record<string, string> = {
    target: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z",
    heart: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z",
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