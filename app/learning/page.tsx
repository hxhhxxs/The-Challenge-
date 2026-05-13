"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { cardClass, pageBg } from "@/lib/challenge-ui";
import { getDailyLearningItem, getRecommendedLearningItem, learningItems, type LearningItem } from "@/lib/content-library";

const filters = [
  { label: "All", value: "all" },
  { label: "Verses", value: "verse" },
  { label: "Hadith", value: "hadith" },
  { label: "Sahaba", value: "sahaba_story" },
  { label: "Prophet ﷺ", value: "prophet_story" },
  { label: "Daily Tasks", value: "daily_task" },
  { label: "Weekly Tasks", value: "weekly_task" },
  { label: "Joy", value: "joy_task" },
];

const moodOptions = [
  { label: "Sad", value: "sad" },
  { label: "Tired", value: "tired" },
  { label: "Grateful", value: "grateful" },
  { label: "Need discipline", value: "discipline" },
];

export default function LearningPage() {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [mood, setMood] = useState("discipline");
  const [saved, setSaved] = useState<string[]>([]);
  const daily = getDailyLearningItem();
  const recommended = getRecommendedLearningItem(mood);

  const visibleItems = useMemo(() => {
    return learningItems.filter((item) => {
      const matchesType = filter === "all" || item.type === filter;
      const text = `${item.title} ${item.shortText} ${item.reference || ""} ${item.themes.join(" ")}`.toLowerCase();
      const matchesQuery = !query.trim() || text.includes(query.toLowerCase());
      return matchesType && matchesQuery;
    });
  }, [filter, query]);

  function toggleSave(id: string) {
    setSaved((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
  }

  return (
    <main className={pageBg}>
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] bg-slate-950 p-6 text-white">
          <p className="text-sm font-bold text-emerald-300">Learning Library</p>
          <h1 className="mt-1 text-4xl font-black">Faith, stories, and daily inspiration.</h1>
          <p className="mt-2 max-w-2xl text-slate-300">Browse verses, hadiths, Sahaba stories, Prophet ﷺ stories, and challenge tasks from one place.</p>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <FeatureCard title="Today’s verse" item={daily} saved={saved.includes(daily.id)} onSave={() => toggleSave(daily.id)} />
          <FeatureCard title="Recommended for you" item={recommended} saved={saved.includes(recommended.id)} onSave={() => toggleSave(recommended.id)}>
            <div className="mt-4 flex flex-wrap gap-2">
              {moodOptions.map((option) => (
                <button key={option.value} onClick={() => setMood(option.value)} className={`rounded-full px-3 py-2 text-xs font-black ${mood === option.value ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"}`}>{option.label}</button>
              ))}
            </div>
          </FeatureCard>
        </section>

        <section className={cardClass}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-black text-emerald-700">Browse</p>
              <h2 className="text-3xl font-black">Content Library</h2>
            </div>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search theme, title, reference..." className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-600 lg:max-w-sm" />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {filters.map((item) => (
              <button key={item.value} onClick={() => setFilter(item.value)} className={`rounded-full px-4 py-2 text-sm font-black ${filter === item.value ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-700"}`}>{item.label}</button>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleItems.map((item) => (
            <LearningCard key={item.id} item={item} saved={saved.includes(item.id)} onSave={() => toggleSave(item.id)} />
          ))}
        </section>

        <section className="rounded-[2rem] bg-emerald-100 p-5 text-emerald-950">
          <p className="font-black">Next backend step</p>
          <p className="mt-1 text-sm font-semibold">Save favorites to Supabase, seed the full 6-month library, and connect one learning item to the dashboard every day.</p>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard" className="rounded-full bg-slate-950 px-5 py-3 font-black text-white">Back to dashboard</Link>
          <Link href="/tools" className="rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Tools</Link>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ title, item, saved, onSave, children }: { title: string; item: LearningItem; saved: boolean; onSave: () => void; children?: React.ReactNode }) {
  return (
    <section className="rounded-[2rem] bg-emerald-950 p-6 text-white shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black text-emerald-300">{title}</p>
          <h2 className="mt-1 text-2xl font-black">{item.title}</h2>
        </div>
        <button onClick={onSave} className="rounded-full bg-white/10 px-3 py-2 text-xs font-black text-emerald-100">{saved ? "Saved" : "Save"}</button>
      </div>
      <p className="mt-4 text-lg font-semibold leading-8 text-emerald-50">{item.shortText}</p>
      {item.fullText && <p className="mt-3 text-sm leading-6 text-emerald-100">{item.fullText}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        {item.reference && <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-black text-slate-950">{item.reference}</span>}
        {item.themes.map((theme) => <span key={theme} className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-emerald-100">{theme}</span>)}
      </div>
      {children}
    </section>
  );
}

function LearningCard({ item, saved, onSave }: { item: LearningItem; saved: boolean; onSave: () => void }) {
  return (
    <article className={cardClass}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black text-emerald-700">{prettyType(item.type)}</p>
          <h3 className="mt-1 text-xl font-black text-slate-950">{item.title}</h3>
        </div>
        <button onClick={onSave} className={`rounded-full px-3 py-1 text-xs font-black ${saved ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"}`}>{saved ? "Saved" : "♡"}</button>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-700">{item.shortText}</p>
      {item.fullText && <details className="mt-3"><summary className="cursor-pointer text-sm font-black text-emerald-700">Read more</summary><p className="mt-2 text-sm leading-6 text-slate-600">{item.fullText}</p></details>}
      <div className="mt-4 flex flex-wrap gap-2">
        {item.reference && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{item.reference}</span>}
        {item.themes.slice(0, 2).map((theme) => <span key={theme} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">{theme}</span>)}
      </div>
    </article>
  );
}

function prettyType(type: LearningItem["type"]) {
  const names: Record<LearningItem["type"], string> = {
    verse: "Verse",
    hadith: "Hadith",
    sahaba_story: "Sahaba Story",
    prophet_story: "Prophet ﷺ Story",
    daily_task: "Daily Task",
    weekly_task: "Weekly Task",
    joy_task: "Joy Task",
  };
  return names[type];
}
