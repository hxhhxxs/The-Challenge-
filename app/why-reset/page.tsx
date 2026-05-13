"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureUserRecord } from "@/lib/supabase/ensure-user-record";
import { cardClass, inputClass, pageBg } from "@/lib/challenge-ui";

type Draft = Record<string, any>;

function cleanLongText(value: unknown) {
  const text = String(value || "").trim();
  return text.length >= 20 ? text : "";
}

export default function WhyResetPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [goal1Why, setGoal1Why] = useState("");
  const [goal2Why, setGoal2Why] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
        return;
      }
      const record = await ensureUserRecord(data.user);
      const loadedDraft = (record.onboarding_draft || {}) as Draft;
      setDraft(loadedDraft);
      setGoal1Why(cleanLongText(loadedDraft.goal1Why));
      setGoal2Why(cleanLongText(loadedDraft.goal2Why));
    }
    load();
  }, [router]);

  async function saveWhy() {
    setError("");
    if (goal1Why.trim().length < 20 || goal2Why.trim().length < 20) {
      setError("Each why needs at least one real sentence, 20+ characters. Short answers like 's' or 'wf' are not saved.");
      return;
    }
    const supabase = createSupabaseBrowserClient();
    const { data } = await supabase.auth.getUser();
    if (!data.user || !draft) return;
    const nextDraft = { ...draft, goal1Why, goal2Why, whyResetLastShown: new Date().toISOString() };
    await supabase.from("users").update({ onboarding_draft: nextDraft }).eq("id", data.user.id);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (!draft) {
    return <main className={pageBg}><section className={`${cardClass} mx-auto max-w-xl`}>Loading your why…</section></main>;
  }

  return (
    <main className={pageBg}>
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[2rem] bg-slate-950 p-6 text-white">
          <p className="text-sm font-bold text-emerald-300">Reset Prompt</p>
          <h1 className="mt-1 text-4xl font-black">Why are you doing this?</h1>
          <p className="mt-2 max-w-2xl text-slate-300">When motivation fades, your own words matter most. Weak old answers are hidden until you replace them with something meaningful.</p>
        </section>

        <section className="rounded-[2rem] bg-amber-100 p-5 text-amber-950">
          <p className="text-sm font-black uppercase tracking-wide">Real reason required</p>
          <p className="mt-1 text-sm font-semibold">Write at least one full sentence for each goal. This becomes the reminder your future self sees when discipline drops.</p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <WhyCard title={draft.goal1 || "Personal Goal 1"} task={draft.goal1Task || "Daily task"} endGoal={cleanLongText(draft.goal1End) || "End goal needs to be rewritten."} why={goal1Why} onChange={setGoal1Why} />
          <WhyCard title={draft.goal2 || "Personal Goal 2"} task={draft.goal2Task || "Daily task"} endGoal={cleanLongText(draft.goal2End) || "End goal needs to be rewritten."} why={goal2Why} onChange={setGoal2Why} />
        </section>

        {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
        {saved && <p className="rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800">Your why was refreshed.</p>}

        <div className="flex flex-wrap gap-3">
          <button onClick={saveWhy} className="rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Save refreshed why</button>
          <Link href="/dashboard" className="rounded-full bg-slate-950 px-5 py-3 font-black text-white">Back to dashboard</Link>
        </div>
      </div>
    </main>
  );
}

function WhyCard({ title, task, endGoal, why, onChange }: { title: string; task: string; endGoal: string; why: string; onChange: (value: string) => void }) {
  const strongEnough = why.trim().length >= 20;
  return (
    <div className={cardClass}>
      <p className="text-sm font-bold text-emerald-700">Personal goal</p>
      <h2 className="mt-1 text-2xl font-black">{title}</h2>
      <div className="mt-4 space-y-3">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">Daily task</p>
          <p className="mt-1 font-bold text-slate-950">{task}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">End goal</p>
          <p className="mt-1 font-bold text-slate-950">{endGoal}</p>
        </div>
      </div>
      <label className="mt-5 block">
        <span className="text-sm font-bold text-slate-700">Is this still your why?</span>
        <textarea className={inputClass} rows={5} value={why} onChange={(e) => onChange(e.target.value)} placeholder="Example: Because I want to become disciplined enough to trust myself again and build a life that pleases Allah." />
      </label>
      <p className={`mt-2 text-xs font-bold ${strongEnough ? "text-emerald-700" : "text-amber-700"}`}>{strongEnough ? "Strong why ✓" : "Add a full sentence before saving."}</p>
    </div>
  );
}
