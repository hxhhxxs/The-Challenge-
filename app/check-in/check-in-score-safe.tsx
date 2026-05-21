"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { cardClass, inputClass, pageBg } from "@/lib/challenge-ui";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureUserRecord } from "@/lib/supabase/ensure-user-record";
import { aggregateLogsToScores, ensureComputedTotals, roundScore, scoreNumber, syncScoresFromDailyLogs } from "@/lib/score-sync";

type Cat = "calories" | "water" | "steps" | "exercise" | "quranMemorized" | "quranReviewed" | "money" | "screen";
type Entry = { id: number; label: string; amount: number; points: number; note?: string };
type Entries = Record<Cat, Entry[]>;
const cats: Cat[] = ["calories", "water", "steps", "exercise", "quranMemorized", "quranReviewed", "money", "screen"];
const emptyEntries = (): Entries => ({ calories: [], water: [], steps: [], exercise: [], quranMemorized: [], quranReviewed: [], money: [], screen: [] });
const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
const todayKey = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const scoreText = (n: number) => n > 0 && n < 1 ? n.toFixed(3) : n.toFixed(1);
const displayAmount = (n: number) => Number.isInteger(n) ? Math.round(n).toLocaleString() : String(n);
const sumAmount = (list: Entry[] = []) => list.reduce((s, e) => s + scoreNumber(e.amount), 0);
const sumPoints = (list: Entry[] = []) => list.reduce((s, e) => s + scoreNumber(e.points), 0);
function daysBetween(start?: string, end?: string) { if (!start || !end) return 90; const a = new Date(`${String(start).slice(0, 10)}T00:00:00`); const b = new Date(`${String(end).slice(0, 10)}T00:00:00`); return Math.max(1, Math.floor((b.getTime() - a.getTime()) / 86400000) + 1); }
function target(v: unknown, fallback: number) { const n = scoreNumber(v); return n > 0 ? n : fallback; }
function cap(amount: number, goal: number) { return goal > 0 ? Math.max(0, Math.min(1.2, amount / goal)) : 0; }
function limitCredit(amount: number, limit: number) { if (limit <= 0) return 0; if (amount <= limit) return 1; return Math.max(0, 1 - ((amount - limit) / limit)); }
function nextPrayer(salah: Record<string, boolean>) { return prayers.find((p) => !salah[p]) || "Fajr"; }

export default function CheckInScoreSafe() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [draft, setDraft] = useState<Record<string, any>>({});
  const [entries, setEntries] = useState<Entries>(emptyEntries());
  const [salah, setSalah] = useState<Record<string, boolean>>({ Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false });
  const [goals, setGoals] = useState<Record<string, string>>({ goal1: "", goal2: "" });
  const [reflection, setReflection] = useState<Record<string, string>>({ mood: "", wentWell: "", slipped: "" });
  const [weight, setWeight] = useState("");
  const [todayScore, setTodayScore] = useState(0);
  const [globalScore, setGlobalScore] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const date = todayKey();

  useEffect(() => { async function load() { const supabase = createSupabaseBrowserClient(); const { data } = await supabase.auth.getUser(); if (!data.user) { router.push("/login"); return; } const record = await ensureUserRecord(data.user); const d = (record.onboarding_draft || {}) as Record<string, any>; setUserId(record.id); setDraft(d); setGlobalScore(scoreNumber((record as any).current_score ?? d.current_score)); const { data: row } = await supabase.from("daily_logs").select("*").eq("user_id", record.id).eq("date", date).maybeSingle(); if (row) { const savedEntries = { ...emptyEntries(), ...(row.entries || {}) }; setEntries(savedEntries); setSalah({ Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false, ...(row.salah || {}) }); setGoals(row.goals || { goal1: "", goal2: "" }); setReflection(row.reflection || { mood: "", wentWell: "", slipped: "" }); setWeight(row.weight ? String(row.weight) : ""); setTodayScore(scoreNumber(row.computed_points?.total)); } else if (d.checkins?.[date]) { const old = d.checkins[date]; setEntries({ ...emptyEntries(), ...(old.entries || {}) }); setSalah({ Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false, ...(old.salah || {}) }); setGoals(old.goals || { goal1: "", goal2: "" }); setReflection(old.reflection || { mood: "", wentWell: "", slipped: "" }); setWeight(old.weight || ""); setTodayScore(scoreNumber(old.computedPoints?.total)); } setLoading(false); } load(); }, [router, date]);

  const dayMax = 100 / daysBetween(draft.startDate, draft.endDate);
  const t = { calories: target(draft.calorieTarget, 2200), water: target(draft.waterTarget, 8), steps: target(draft.stepTarget, 10000), exercise: target(draft.workoutMinutes, 45), memorize: target(draft.dailyMemorizeGoal || draft.quranDailyTarget, 1), review: target(draft.dailyReviewGoal || draft.quranReviewTarget, 1), money: Math.max(1, target(draft.spendingLimit, 300) / 30), screen: target(draft.screenLimit, 3) };
  const totals = useMemo(() => ({ calories: sumAmount(entries.calories), water: sumAmount(entries.water), steps: sumAmount(entries.steps), exercise: sumAmount(entries.exercise), quranMemorized: sumAmount(entries.quranMemorized), quranReviewed: sumAmount(entries.quranReviewed), money: sumAmount(entries.money), screen: sumAmount(entries.screen) }), [entries]);

  function entryPoints(cat: Cat, amount: number) {
    const bodyMax = dayMax * 0.28;
    const faithMax = dayMax * 0.24;
    const sabrMax = dayMax * 0.18;
    const config: Record<Cat, { max: number; share: number; goal: number; limit?: boolean }> = {
      calories: { max: bodyMax, share: 0.25, goal: t.calories },
      water: { max: bodyMax, share: 0.25, goal: t.water },
      steps: { max: bodyMax, share: 0.25, goal: t.steps },
      exercise: { max: bodyMax, share: 0.25, goal: t.exercise },
      quranMemorized: { max: faithMax, share: 0.35, goal: t.memorize },
      quranReviewed: { max: faithMax, share: 0.30, goal: t.review },
      money: { max: sabrMax, share: 0.35, goal: t.money, limit: true },
      screen: { max: sabrMax, share: 0.35, goal: t.screen, limit: true },
    };
    const c = config[cat];
    const ratio = c.limit ? Math.min(0.25, Math.max(0, amount / c.goal)) : cap(amount, c.goal);
    return roundScore(c.max * c.share * ratio);
  }

  function compute(nextEntries = entries, nextSalah = salah, nextGoals = goals, nextReflection = reflection) {
    const body = roundScore(sumPoints(nextEntries.calories) + sumPoints(nextEntries.water) + sumPoints(nextEntries.steps) + sumPoints(nextEntries.exercise));
    const quran = roundScore(sumPoints(nextEntries.quranMemorized) + sumPoints(nextEntries.quranReviewed) + prayers.filter((p) => nextSalah[p]).length * (dayMax * 0.24 * 0.35 / 5));
    const disciplineEngaged = nextEntries.money.length + nextEntries.screen.length > 0;
    const discipline = disciplineEngaged ? roundScore(sumPoints(nextEntries.money) + sumPoints(nextEntries.screen) + dayMax * 0.18 * 0.30 * ((limitCredit(totals.money, t.money) + limitCredit(totals.screen, t.screen)) / 2)) : 0;
    const personal = roundScore((nextGoals.goal1 === "done" ? dayMax * 0.1 : nextGoals.goal1 === "partial" ? dayMax * 0.05 : 0) + (nextGoals.goal2 === "done" ? dayMax * 0.1 : nextGoals.goal2 === "partial" ? dayMax * 0.05 : 0));
    const character = nextReflection.mood || nextReflection.wentWell || nextReflection.slipped ? roundScore(dayMax * 0.1) : 0;
    return ensureComputedTotals({ body, quran, discipline, personal, character, total: roundScore(body + quran + discipline + personal + character) }, nextEntries);
  }

  async function saveAll(nextEntries = entries, nextSalah = salah, nextGoals = goals, nextReflection = reflection, msg = "Saved") {
    setError("");
    if (!userId) return;
    const supabase = createSupabaseBrowserClient();
    const computed_points = compute(nextEntries, nextSalah, nextGoals, nextReflection);
    setTodayScore(scoreNumber(computed_points.total));
    const { error: logError } = await supabase.from("daily_logs").upsert({ user_id: userId, date, entries: nextEntries, weight: weight ? Number(weight) : null, sleep: {}, goals: nextGoals, salah: nextSalah, reflection: nextReflection, computed_points }, { onConflict: "user_id,date" });
    if (logError) { setError(logError.message); return; }
    try {
      const synced = await syncScoresFromDailyLogs(supabase, userId, { ...draft, checkins: { ...(draft.checkins || {}), [date]: { entries: nextEntries, goals: nextGoals, salah: nextSalah, reflection: nextReflection, weight, computedPoints: computed_points, updatedAt: new Date().toISOString() } } });
      setDraft(synced.onboarding_draft);
      setGlobalScore(synced.current_score);
      setMessage(`${msg} • ${scoreText(scoreNumber(computed_points.total))} today • ${scoreText(synced.current_score)} total`);
      setTimeout(() => setMessage(""), 2500);
    } catch (e: any) {
      setError(e?.message || "Saved daily log, but score sync failed.");
    }
  }

  function add(cat: Cat, label: string, amount: number) { if (!amount || amount <= 0) return; const next = { ...entries, [cat]: [...entries[cat], { id: Date.now(), label, amount, points: entryPoints(cat, amount) }] }; setEntries(next); saveAll(next, salah, goals, reflection, `${label} saved`); }
  function markPrayer(p = nextPrayer(salah)) { const next = { ...salah, [p]: !salah[p] }; setSalah(next); saveAll(entries, next, goals, reflection, `${p} saved`); }
  function saveGoal(slot: "goal1" | "goal2", value: string) { const next = { ...goals, [slot]: value }; setGoals(next); saveAll(entries, salah, next, reflection, "Goal saved"); }
  function saveReflection(next: Record<string, string>) { setReflection(next); saveAll(entries, salah, goals, next, "Reflection saved"); }

  if (loading) return <main className={pageBg}><section className={`${cardClass} mx-auto max-w-xl`}>Loading today…</section><BottomNav /></main>;
  return <main className={pageBg}><div className="mx-auto max-w-5xl space-y-5"><section className="rounded-[2rem] bg-slate-950 p-6 text-white"><p className="text-sm font-bold text-emerald-300">Log Today</p><h1 className="mt-1 text-4xl font-black">{scoreText(todayScore)} pts today</h1><p className="mt-2 text-slate-300">Total challenge score: {scoreText(globalScore)} / 100</p><div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4"><Quick label={`+1 cup water (+${scoreText(entryPoints("water", 1))})`} onClick={() => add("water", "+1 cup water", 1)} /><Quick label={`+1k steps (+${scoreText(entryPoints("steps", 1000))})`} onClick={() => add("steps", "+1k steps", 1000)} /><Quick label={`+10 min exercise (+${scoreText(entryPoints("exercise", 10))})`} onClick={() => add("exercise", "+10 min exercise", 10)} /><Quick label={`Mark ${nextPrayer(salah)}`} onClick={() => markPrayer()} /></div></section>{message && <p className="rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800">{message}</p>}{error && <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
    <section className={cardClass}><h2 className="text-2xl font-black">Quwwah — Body</h2><div className="mt-4 grid gap-4 md:grid-cols-2"><EntryBox title="Calories" unit="cal" current={totals.calories} target={t.calories} onSave={(a) => add("calories", "Calories", a)} /><EntryBox title="Water" unit="cups" current={totals.water} target={t.water} onSave={(a) => add("water", "Water", a)} /><EntryBox title="Steps" unit="steps" current={totals.steps} target={t.steps} onSave={(a) => add("steps", "Steps", a)} /><EntryBox title="Exercise" unit="min" current={totals.exercise} target={t.exercise} onSave={(a) => add("exercise", "Exercise", a)} /></div></section>
    <section className={cardClass}><h2 className="text-2xl font-black">Imaan — Faith</h2><div className="mt-4 grid gap-3 md:grid-cols-5">{prayers.map((p) => <button key={p} onClick={() => markPrayer(p)} className={`rounded-xl p-3 text-sm font-black ${salah[p] ? "bg-emerald-100 text-emerald-900" : "bg-slate-100 text-slate-700"}`}>{salah[p] ? "✓ " : ""}{p}</button>)}</div><div className="mt-4 grid gap-4 md:grid-cols-2"><EntryBox title="Qur'an memorized" unit={draft.measurementUnit || "units"} current={totals.quranMemorized} target={t.memorize} onSave={(a) => add("quranMemorized", "Qur'an memorized", a)} /><EntryBox title="Qur'an reviewed" unit={draft.measurementUnit || "units"} current={totals.quranReviewed} target={t.review} onSave={(a) => add("quranReviewed", "Qur'an reviewed", a)} /></div></section>
    <section className={cardClass}><h2 className="text-2xl font-black">Sabr — Discipline</h2><p className="mt-1 text-sm font-bold text-slate-500">Discipline points only count after you log this section. No more automatic 100% for doing nothing.</p><div className="mt-4 grid gap-4 md:grid-cols-2"><EntryBox title="Money spent" unit="$" current={totals.money} target={t.money} onSave={(a) => add("money", "Money spent", a)} /><EntryBox title="Screen time" unit="hours" current={totals.screen} target={t.screen} onSave={(a) => add("screen", "Screen time", a)} /></div></section>
    <section className={cardClass}><h2 className="text-2xl font-black">Niyyah — Personal Goals</h2><div className="mt-4 grid gap-4 md:grid-cols-2"><Goal title={draft.goal1 || "Personal Goal 1"} task={draft.goal1Task || "Daily mission"} value={goals.goal1} onChange={(v) => saveGoal("goal1", v)} /><Goal title={draft.goal2 || "Personal Goal 2"} task={draft.goal2Task || "Daily mission"} value={goals.goal2} onChange={(v) => saveGoal("goal2", v)} /></div></section>
    <section className={cardClass}><h2 className="text-2xl font-black">Adab — Reflection</h2><div className="mt-4 flex flex-wrap gap-2">{[["1","😔"],["2","😕"],["3","😐"],["4","🙂"],["5","😄"]].map(([v, face]) => <button key={v} onClick={() => saveReflection({ ...reflection, mood: v })} className={`rounded-2xl px-5 py-3 text-2xl ${reflection.mood === v ? "bg-emerald-600" : "bg-slate-100"}`}>{face}</button>)}</div><textarea className={`${inputClass} mt-4`} rows={3} placeholder="What went well?" value={reflection.wentWell || ""} onChange={(e) => setReflection({ ...reflection, wentWell: e.target.value })} onBlur={() => saveReflection(reflection)} /><textarea className={`${inputClass} mt-3`} rows={3} placeholder="What slipped?" value={reflection.slipped || ""} onChange={(e) => setReflection({ ...reflection, slipped: e.target.value })} onBlur={() => saveReflection(reflection)} /></section>
  </div><BottomNav /></main>;
}
function Quick({ label, onClick }: { label: string; onClick: () => void }) { return <button onClick={onClick} className="rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-black text-slate-950">{label}</button>; }
function EntryBox({ title, unit, current, target, onSave }: { title: string; unit: string; current: number; target: number; onSave: (amount: number) => void }) { const [amount, setAmount] = useState(""); const n = Number(amount); return <div className="rounded-2xl bg-slate-50 p-4"><div className="flex justify-between gap-3"><h3 className="font-black">{title}</h3><span className="text-xs font-black text-emerald-700">{displayAmount(current)} / {displayAmount(target)} {unit}</span></div><input className={`${inputClass} mt-3`} type="number" value={amount} placeholder={`Add ${unit}`} onChange={(e) => setAmount(e.target.value)} /><button disabled={!n || n <= 0} onClick={() => { onSave(n); setAmount(""); }} className="mt-3 rounded-full bg-emerald-600 px-4 py-2 text-sm font-black text-white disabled:opacity-40">Save entry</button></div>; }
function Goal({ title, task, value, onChange }: { title: string; task: string; value: string; onChange: (v: string) => void }) { return <div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{title}</h3><p className="mt-1 text-sm text-slate-600">{task}</p><div className="mt-3 flex gap-2">{["done", "partial", "missed"].map((v) => <button key={v} onClick={() => onChange(v)} className={`rounded-full px-3 py-2 text-xs font-black ${value === v ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`}>{v}</button>)}</div></div>; }
