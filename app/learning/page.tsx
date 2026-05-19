"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { cardClass, pageBg } from "@/lib/challenge-ui";
import { getDailyLearningItem, getRecommendedLearningItem, learningItems, type LearningItem } from "@/lib/content-library";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const filters = [
  { label: "All", value: "all" },
  { label: "Verses", value: "verse" },
  { label: "Hadith", value: "hadith" },
  { label: "Sahaba", value: "sahaba_story" },
  { label: "Prophet ﷺ", value: "prophet_story" },
  { label: "Daily Tasks", value: "daily_task" },
  { label: "Weekly Tasks", value: "weekly_task" },
  { label: "Joy", value: "joy_task" },
  { label: "Saved", value: "saved" },
];

const moodOptions = [
  { label: "Sad", value: "sad" },
  { label: "Tired", value: "tired" },
  { label: "Grateful", value: "grateful" },
  { label: "Need discipline", value: "discipline" },
];

export default function LearningPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [mood, setMood] = useState("discipline");
  const [saved, setSaved] = useState<string[]>([]);
  const [userId, setUserId] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const daily = getDailyLearningItem();
  const recommended = getRecommendedLearningItem(mood);

  useEffect(() => {
    async function loadSaved() {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) { router.push("/login"); return; }
      setUserId(data.user.id);
      const { data: rows, error } = await supabase.from("user_saved_items").select("learning_item_id").eq("user_id", data.user.id);
      if (!error && rows) setSaved(rows.map((row: any) => row.learning_item_id).filter(Boolean));
      if (error) {
        const local = typeof window !== "undefined" ? window.localStorage.getItem(`saved_learning_${data.user.id}`) : null;
        if (local) setSaved(JSON.parse(local));
      }
    }
    loadSaved();
  }, [router]);

  const visibleItems = useMemo(() => learningItems.filter((item) => {
    const matchesType = filter === "all" || (filter === "saved" ? saved.includes(item.id) : item.type === filter);
    const text = `${item.title} ${item.shortText} ${item.arabicText || ""} ${item.reference || ""} ${item.themes.join(" ")}`.toLowerCase();
    return matchesType && (!query.trim() || text.includes(query.toLowerCase()));
  }), [filter, query, saved]);

  async function toggleSave(id: string) {
    if (!userId) return;
    const supabase = createSupabaseBrowserClient();
    const isSaved = saved.includes(id);
    const nextSaved = isSaved ? saved.filter((x) => x !== id) : [...saved, id];
    setSaved(nextSaved);
    setSaveMessage(isSaved ? "Removed from saved" : "Saved to your library");
    setTimeout(() => setSaveMessage(""), 1800);

    const result = isSaved
      ? await supabase.from("user_saved_items").delete().eq("user_id", userId).eq("learning_item_id", id)
      : await supabase.from("user_saved_items").upsert({ user_id: userId, learning_item_id: id, saved_at: new Date().toISOString() }, { onConflict: "user_id,learning_item_id" });

    if (result.error && typeof window !== "undefined") {
      window.localStorage.setItem(`saved_learning_${userId}`, JSON.stringify(nextSaved));
      setSaveMessage(isSaved ? "Removed from this device" : "Saved on this device");
      setTimeout(() => setSaveMessage(""), 2200);
    }
  }

  return (
    <main className={pageBg}>
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] bg-slate-950 p-6 text-white">
          <p className="text-sm font-bold text-emerald-300">Learning Library</p>
          <h1 className="mt-1 text-4xl font-black">Faith, stories, and daily inspiration.</h1>
          <p className="mt-2 max-w-2xl text-slate-300">Browse verses, hadiths, Sahaba stories, Prophet ﷺ stories, and challenge tasks from one place.</p>
        </section>
        {saveMessage && <p className="rounded-2xl bg-emerald-50 p-3 text-sm font-black text-emerald-800">{saveMessage}</p>}

        <section className="grid gap-4 lg:grid-cols-2">
          <FeatureCard title="Today’s Verse" item={daily} saved={saved.includes(daily.id)} onSave={() => toggleSave(daily.id)} />
          <FeatureCard title="Recommended" item={recommended} saved={saved.includes(recommended.id)} onSave={() => toggleSave(recommended.id)}>
            <div className="mt-4 flex flex-wrap gap-2">{moodOptions.map((option) => <button key={option.value} onClick={() => setMood(option.value)} className={`rounded-full px-3 py-2 text-xs font-black ${mood === option.value ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"}`}>{option.label}</button>)}</div>
          </FeatureCard>
        </section>

        <section className={cardClass}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-sm font-black text-emerald-700">Browse</p><h2 className="text-3xl font-black">Content Library</h2></div><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search theme, title, reference, Arabic..." className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-emerald-600 lg:max-w-sm" /></div>
          <div className="mt-5 flex flex-wrap gap-2">{filters.map((item) => <button key={item.value} onClick={() => setFilter(item.value)} className={`rounded-full px-4 py-2 text-sm font-black ${filter === item.value ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-700"}`}>{item.label}</button>)}</div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{visibleItems.map((item) => <LearningCard key={item.id} item={item} saved={saved.includes(item.id)} onSave={() => toggleSave(item.id)} />)}</section>
      </div>
      <BottomNav />
    </main>
  );
}

function ArabicBlock({ text, dark = false }: { text?: string; dark?: boolean }) { if (!text) return null; return <p dir="rtl" className={`mt-4 text-right text-2xl font-black leading-loose ${dark ? "text-white" : "text-slate-950"}`}>{text}</p>; }
function FeatureCard({ title, item, saved, onSave, children }: { title: string; item: LearningItem; saved: boolean; onSave: () => void; children?: React.ReactNode }) { return <section className="rounded-[2rem] bg-emerald-950 p-6 text-white shadow-xl"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-black text-emerald-300">{title}</p><h2 className="mt-1 text-2xl font-black">{item.title}</h2></div><button onClick={onSave} className="rounded-full bg-white/10 px-3 py-2 text-xs font-black text-emerald-100">{saved ? "Saved" : "Save"}</button></div><ArabicBlock text={item.arabicText} dark /><p className="mt-4 text-lg font-semibold leading-8 text-emerald-50">{item.shortText}</p>{item.fullText && <p className="mt-3 text-sm leading-6 text-emerald-100">{item.fullText}</p>}<div className="mt-4 flex flex-wrap gap-2">{item.reference && <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-black text-slate-950">{item.reference}</span>}{item.themes.map((theme) => <span key={theme} className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-emerald-100">{theme}</span>)}</div>{children}</section>; }
function LearningCard({ item, saved, onSave }: { item: LearningItem; saved: boolean; onSave: () => void }) { return <article className={cardClass}><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-black text-emerald-700">{prettyType(item.type)}</p><h3 className="mt-1 text-xl font-black text-slate-950">{item.title}</h3></div><button onClick={onSave} className={`rounded-full px-3 py-1 text-xs font-black ${saved ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"}`}>{saved ? "Saved" : "♡"}</button></div><ArabicBlock text={item.arabicText} /><p className="mt-3 text-sm leading-6 text-slate-700">{item.shortText}</p>{item.fullText && <details className="mt-3"><summary className="cursor-pointer text-sm font-black text-emerald-700">Read more</summary><p className="mt-2 text-sm leading-6 text-slate-600">{item.fullText}</p></details>}<div className="mt-4 flex flex-wrap gap-2">{item.reference && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{item.reference}</span>}{item.themes.slice(0, 2).map((theme) => <span key={theme} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">{theme}</span>)}</div></article>; }
function prettyType(type: LearningItem["type"]) { const names: Record<LearningItem["type"], string> = { verse: "Verse", hadith: "Hadith", sahaba_story: "Sahaba Story", prophet_story: "Prophet ﷺ Story", daily_task: "Daily Task", weekly_task: "Weekly Task", joy_task: "Joy Task" }; return names[type]; }
