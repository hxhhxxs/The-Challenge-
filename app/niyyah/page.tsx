"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureUserRecord } from "@/lib/supabase/ensure-user-record";
import { cardClass, inputClass, pageBg } from "@/lib/challenge-ui";

const WHO_OPTIONS = ["Allah ﷻ", "Myself", "My parents", "My spouse", "My kids", "Future me"];

export default function NiyyahPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [draft, setDraft] = useState<Record<string, any>>({});
  const [why, setWhy] = useState("");
  const [whoFor, setWhoFor] = useState<string[]>([]);
  const [customWho, setCustomWho] = useState("");
  const [vision, setVision] = useState("");
  const [stopped, setStopped] = useState("");
  const [fear, setFear] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { async function load() { const supabase = createSupabaseBrowserClient(); const { data } = await supabase.auth.getUser(); if (!data.user) { router.push("/login"); return; } const record = await ensureUserRecord(data.user); const d = (record.onboarding_draft || {}) as Record<string, any>; const niyyah = d.niyyah || {}; setUserId(record.id); setDraft(d); setWhy(niyyah.why || (record as any).niyyah_why || ""); setWhoFor(niyyah.whoFor || (record as any).niyyah_for || []); setCustomWho(niyyah.customWho || ""); setVision(niyyah.vision || (record as any).niyyah_vision || ""); setStopped(niyyah.stoppedBefore || (record as any).niyyah_stopped_before || ""); setFear(niyyah.fear || (record as any).niyyah_fear || ""); } load(); }, [router]);

  function toggleWho(option: string) { setWhoFor((current) => current.includes(option) ? current.filter((x) => x !== option) : [...current, option]); }
  function valid() { if (why.trim().length < 40) return "Write at least 40 characters for why you are really doing this."; if (whoFor.length === 0 && customWho.trim().length < 2) return "Choose at least one person/reason you are doing this for."; if (vision.trim().length < 30) return "Write at least 30 characters for your 90-day vision."; if (stopped.trim().length < 30) return "Write at least 30 characters for what stopped you before."; if (fear.trim().length < 20) return "Write at least 20 characters for what scares you."; return ""; }

  async function save() {
    const problem = valid();
    if (problem) { setError(problem); return; }
    setError(""); setMessage("");
    const supabase = createSupabaseBrowserClient();
    const niyyah = { why: why.trim(), whoFor, customWho: customWho.trim(), vision: vision.trim(), stoppedBefore: stopped.trim(), fear: fear.trim(), createdAt: draft.niyyah?.createdAt || new Date().toISOString(), updatedAt: new Date().toISOString() };
    const nextDraft = { ...draft, niyyah };
    const { error: updateError } = await supabase.from("users").update({ onboarding_draft: nextDraft, niyyah_why: niyyah.why, niyyah_for: [...whoFor, ...(customWho.trim() ? [customWho.trim()] : [])], niyyah_vision: niyyah.vision, niyyah_stopped_before: niyyah.stoppedBefore, niyyah_fear: niyyah.fear }).eq("id", userId);
    if (updateError) { setError(updateError.message); return; }
    setDraft(nextDraft);
    setMessage("Niyyah saved ✓");
    setTimeout(() => setMessage(""), 2500);
  }

  return <main className={pageBg}><div className="mx-auto max-w-4xl space-y-6"><section className="rounded-[2rem] bg-slate-950 p-6 text-white"><p className="text-sm font-bold text-emerald-300">My Niyyah</p><h1 className="mt-1 text-4xl font-black">Before we build the plan, anchor the why.</h1><p className="mt-3 text-slate-300">Answer honestly. These words will come back on hard days, resets, and milestones.</p></section>
    <section className={cardClass}><label className="block"><span className="text-lg font-black text-slate-950">Why are you really doing this?</span><textarea className={`${inputClass} mt-2`} rows={5} value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Because I want to come back to who I am supposed to be…" /></label><p className="mt-1 text-xs font-bold text-slate-500">Minimum 40 characters • {why.trim().length}/40</p></section>
    <section className={cardClass}><h2 className="text-lg font-black text-slate-950">Who are you doing this for?</h2><div className="mt-4 flex flex-wrap gap-2">{WHO_OPTIONS.map((option) => <button key={option} onClick={() => toggleWho(option)} className={`rounded-full px-4 py-2 text-sm font-black ${whoFor.includes(option) ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-800"}`}>{option}</button>)}</div><input className={`${inputClass} mt-4`} value={customWho} onChange={(e) => setCustomWho(e.target.value)} placeholder="Someone specific…" /></section>
    <section className={cardClass}><label className="block"><span className="text-lg font-black text-slate-950">What will be different 90 days from now if this works?</span><textarea className={`${inputClass} mt-2`} rows={4} value={vision} onChange={(e) => setVision(e.target.value)} placeholder="I will pray Fajr consistently, improve my body, and feel proud of myself again…" /></label><p className="mt-1 text-xs font-bold text-slate-500">Minimum 30 characters • {vision.trim().length}/30</p></section>
    <section className={cardClass}><label className="block"><span className="text-lg font-black text-slate-950">What has stopped you before?</span><textarea className={`${inputClass} mt-2`} rows={4} value={stopped} onChange={(e) => setStopped(e.target.value)} placeholder="I start strong, then lose discipline when life gets busy…" /></label><p className="mt-1 text-xs font-bold text-slate-500">Minimum 30 characters • {stopped.trim().length}/30</p></section>
    <section className={cardClass}><label className="block"><span className="text-lg font-black text-slate-950">What scares you most about this challenge?</span><textarea className={`${inputClass} mt-2`} rows={4} value={fear} onChange={(e) => setFear(e.target.value)} placeholder="That I will fail again and feel worse about myself…" /></label><p className="mt-1 text-xs font-bold text-slate-500">Minimum 20 characters • {fear.trim().length}/20</p></section>
    <div aria-live="polite">{error && <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}{message && <p className="rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800">{message}</p>}</div>
    <div className="flex flex-wrap gap-3"><button onClick={save} className="rounded-full bg-emerald-600 px-6 py-3 font-black text-white">Save my Niyyah</button><Link href="/why-reset" className="rounded-full bg-slate-100 px-6 py-3 font-black text-slate-800">Open Why Reset</Link></div>
  </div><BottomNav /></main>;
}
