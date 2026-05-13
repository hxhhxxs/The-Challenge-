"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cardClass, inputClass, pageBg } from "@/lib/challenge-ui";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureUserRecord } from "@/lib/supabase/ensure-user-record";
import { aggregateCheckInScores, computePointsFromSavedCheckIn } from "@/lib/scoring";

type Entry = { id: number; label: string; amount: number; note?: string };

type EntryState = {
  calories: Entry[];
  water: Entry[];
  steps: Entry[];
  exercise: Entry[];
  quranMemorized: Entry[];
  quranReviewed: Entry[];
  money: Entry[];
  screen: Entry[];
};

type ProofState = { goal1?: string; goal2?: string };

const emptyEntries: EntryState = {
  calories: [],
  water: [],
  steps: [],
  exercise: [],
  quranMemorized: [],
  quranReviewed: [],
  money: [],
  screen: [],
};

function sum(entries: Entry[]) {
  return entries.reduce((total, entry) => total + (Number(entry.amount) || 0), 0);
}

function localDateKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeDailyLog(row: any) {
  if (!row) return null;
  return {
    entries: row.entries || emptyEntries,
    weight: row.weight ? String(row.weight) : "",
    sleep: row.sleep || { hours: "", bedtime: "", wake: "" },
    goals: row.goals || { goal1: "", goal2: "" },
    salah: row.salah || { Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false },
    reflection: row.reflection || { mood: "", notes: "", slipped: "", wentWell: "" },
    computedPoints: row.computed_points || row.computedPoints || { total: 0 },
    localDate: row.date,
  };
}

export default function CheckInPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [userId, setUserId] = useState("");
  const [draft, setDraft] = useState<Record<string, any>>({});
  const [computedTotal, setComputedTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [proof, setProof] = useState<ProofState>({});
  const [entries, setEntries] = useState<EntryState>(emptyEntries);
  const [weight, setWeight] = useState("");
  const [sleep, setSleep] = useState({ hours: "", bedtime: "", wake: "" });
  const [goals, setGoals] = useState({ goal1: "", goal2: "" });
  const [salah, setSalah] = useState({ Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false });
  const [reflection, setReflection] = useState({ mood: "", notes: "", slipped: "", wentWell: "" });

  const todayKey = localDateKey();

  useEffect(() => {
    async function loadSavedCheckIn() {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
        return;
      }

      const record = await ensureUserRecord(data.user);
      const loadedDraft = (record.onboarding_draft || {}) as Record<string, any>;
      let saved = null;

      const { data: dailyLog, error: dailyLogError } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", data.user.id)
        .eq("date", todayKey)
        .maybeSingle();

      if (dailyLog && !dailyLogError) {
        saved = normalizeDailyLog(dailyLog);
      } else {
        saved = loadedDraft?.checkins?.[todayKey];
      }

      setUserId(data.user.id);
      setDraft(loadedDraft);
      if (saved) {
        setEntries(saved.entries || emptyEntries);
        setWeight(saved.weight || "");
        setSleep(saved.sleep || { hours: "", bedtime: "", wake: "" });
        setGoals(saved.goals || { goal1: "", goal2: "" });
        setSalah(saved.salah || { Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false });
        setReflection(saved.reflection || { mood: "", notes: "", slipped: "", wentWell: "" });
        setComputedTotal(Number(saved.computedPoints?.total || 0));
      }
      setLoading(false);
    }
    loadSavedCheckIn();
  }, [router, todayKey]);

  const totals = useMemo(() => ({
    calories: sum(entries.calories),
    water: sum(entries.water),
    steps: sum(entries.steps),
    exercise: sum(entries.exercise),
    quranMemorized: sum(entries.quranMemorized),
    quranReviewed: sum(entries.quranReviewed),
    money: sum(entries.money),
    screen: sum(entries.screen),
  }), [entries]);

  async function saveCheckIn(next?: Partial<{ entries: EntryState; weight: string; sleep: typeof sleep; goals: typeof goals; salah: typeof salah; reflection: typeof reflection }>, successMessage = "Saved ✓") {
    if (!userId) return;
    setSaving(true);
    setError("");
    const supabase = createSupabaseBrowserClient();
    const payloadWithoutPoints = {
      entries: next?.entries || entries,
      weight: next?.weight ?? weight,
      sleep: next?.sleep || sleep,
      goals: next?.goals || goals,
      salah: next?.salah || salah,
      reflection: next?.reflection || reflection,
      updatedAt: new Date().toISOString(),
      localDate: todayKey,
    };
    const computedPoints = computePointsFromSavedCheckIn(draft, payloadWithoutPoints);
    const payload = { ...payloadWithoutPoints, computedPoints };

    const { error: logError } = await supabase.from("daily_logs").upsert(
      {
        user_id: userId,
        date: todayKey,
        entries: payload.entries,
        weight: payload.weight ? Number(payload.weight) : null,
        sleep: payload.sleep,
        goals: payload.goals,
        salah: payload.salah,
        reflection: payload.reflection,
        computed_points: computedPoints,
      },
      { onConflict: "user_id,date" }
    );

    const nextDraftWithoutAggregate = {
      ...draft,
      checkins: {
        ...(draft.checkins || {}),
        [todayKey]: payload,
      },
    };
    const aggregate = aggregateCheckInScores(nextDraftWithoutAggregate);
    const nextDraft = {
      ...nextDraftWithoutAggregate,
      current_score: aggregate.total,
      pillar_scores: aggregate.pillars,
    };

    const { error: userError } = await supabase
      .from("users")
      .update({
        onboarding_draft: nextDraft,
        current_score: aggregate.total,
        pillar_scores: aggregate.pillars,
      })
      .eq("id", userId);

    setSaving(false);
    if (logError && userError) {
      setError(`Could not save: ${logError.message || userError.message}`);
      return;
    }
    if (logError) {
      setMessage("Saved to profile backup. Run the daily_logs migration to enable full backend logs.");
    } else {
      setMessage(`${successMessage} • Today: ${Number(computedPoints.total || 0).toFixed(3)} pts`);
    }
    setDraft(nextDraft);
    setComputedTotal(computedPoints.total || 0);
    setTimeout(() => setMessage(""), 2600);
  }

  function addEntry(category: keyof EntryState, entry: Omit<Entry, "id">) {
    if (!entry.amount || Number(entry.amount) <= 0) return;
    const nextEntries = { ...entries, [category]: [...entries[category], { ...entry, id: Date.now() }] };
    setEntries(nextEntries);
    saveCheckIn({ entries: nextEntries }, `${entry.label || "Entry"} saved ✓`);
  }

  function removeEntry(category: keyof EntryState, id: number) {
    const nextEntries = { ...entries, [category]: entries[category].filter((entry) => entry.id !== id) };
    setEntries(nextEntries);
    saveCheckIn({ entries: nextEntries }, "Entry removed ✓");
  }

  function previewPhoto(slot: "goal1" | "goal2", file?: File) {
    if (!file) return;
    setProof((current) => ({ ...current, [slot]: URL.createObjectURL(file) }));
  }

  async function finalize() {
    await saveCheckIn(undefined, "Today saved. Returning to dashboard…");
    setTimeout(() => router.push("/dashboard"), 900);
  }

  if (loading) {
    return <main className={pageBg}><section className={`${cardClass} mx-auto max-w-xl`}>Loading today’s saved check-in…</section></main>;
  }

  return (
    <main className={pageBg}>
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[2rem] bg-slate-950 p-6 text-white">
          <p className="text-sm font-bold text-emerald-300">Tracking Today</p>
          <h1 className="mt-1 text-4xl font-black">Log things as they happen.</h1>
          <p className="mt-2 max-w-2xl text-slate-300">Add multiple entries in each category. Every save updates today’s points and writes to daily logs when enabled.</p>
          <p className="mt-4 inline-block rounded-full bg-emerald-400 px-4 py-2 text-sm font-black text-slate-950">Today’s points: {computedTotal.toFixed(3)}</p>
        </section>

        {saving && <p className="rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-700">Saving…</p>}
        {message && <p className="rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800">{message}</p>}
        {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <TotalCard title="Calories" value={totals.calories} suffix="cal" />
          <TotalCard title="Water" value={totals.water} suffix="cups" />
          <TotalCard title="Steps" value={totals.steps} suffix="steps" />
          <TotalCard title="Exercise" value={totals.exercise} suffix="min" />
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <EntrySection title="Calories" description="Add meals separately throughout the day." total={totals.calories} suffix="cal" category="calories" labels={["Breakfast", "Lunch", "Dinner", "Snack", "Drink", "Other"]} placeholder="e.g. 500" entries={entries.calories} onAdd={addEntry} onRemove={removeEntry} extraLink={<Link href="/food-photo" className="text-sm font-black text-emerald-700">Use photo food log →</Link>} />
          <EntrySection title="Water" description="Add every cup/bottle as you drink it." total={totals.water} suffix="cups" category="water" labels={["Cup", "Bottle", "Before meal", "After workout", "Other"]} placeholder="e.g. 1" entries={entries.water} onAdd={addEntry} onRemove={removeEntry} />
          <EntrySection title="Steps" description="Add step updates whenever you check them." total={totals.steps} suffix="steps" category="steps" labels={["Morning", "Afternoon", "Evening", "Workout", "Walk", "Other"]} placeholder="e.g. 2500" entries={entries.steps} onAdd={addEntry} onRemove={removeEntry} />
          <EntrySection title="Exercise" description="Add separate workout blocks." total={totals.exercise} suffix="min" category="exercise" labels={["Walking", "Boxing", "Gym", "Bodyweight", "Swimming", "Sports", "Other"]} placeholder="e.g. 30" entries={entries.exercise} onAdd={addEntry} onRemove={removeEntry} />
          <EntrySection title="Qur'an memorized" description="Add memorization sessions separately." total={totals.quranMemorized} suffix="units" category="quranMemorized" labels={["After Fajr", "Before class", "After Maghrib", "Before sleep", "Other"]} placeholder="e.g. 5" entries={entries.quranMemorized} onAdd={addEntry} onRemove={removeEntry} />
          <EntrySection title="Qur'an reviewed" description="Add review sessions separately." total={totals.quranReviewed} suffix="units" category="quranReviewed" labels={["Old review", "New review", "After Fajr", "Before sleep", "Other"]} placeholder="e.g. 10" entries={entries.quranReviewed} onAdd={addEntry} onRemove={removeEntry} />
          <EntrySection title="Money spent" description="Add each purchase separately." total={totals.money} suffix="$" category="money" labels={["Food", "Gas", "Shopping", "School", "Entertainment", "Other"]} placeholder="e.g. 12" entries={entries.money} onAdd={addEntry} onRemove={removeEntry} />
          <EntrySection title="Screen time" description="Add blocks of screen time as they happen." total={totals.screen} suffix="hours" category="screen" labels={["Social", "YouTube", "TikTok/Reels", "Gaming", "TV", "Other"]} placeholder="e.g. 1" entries={entries.screen} onAdd={addEntry} onRemove={removeEntry} />
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <section className={cardClass}>
            <h2 className="text-2xl font-black">Weight + Sleep</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <label className="block"><span className="text-sm font-bold text-slate-700">Today's weight</span><input className={inputClass} type="number" value={weight} onChange={(e) => setWeight(e.target.value)} onBlur={() => saveCheckIn({ weight }, "Weight saved ✓")} placeholder="lbs" /></label>
              <label className="block"><span className="text-sm font-bold text-slate-700">Sleep hours</span><input className={inputClass} type="number" value={sleep.hours} onChange={(e) => setSleep({ ...sleep, hours: e.target.value })} onBlur={() => saveCheckIn({ sleep }, "Sleep saved ✓")} placeholder="e.g. 8" /></label>
              <label className="block"><span className="text-sm font-bold text-slate-700">Bedtime</span><input className={inputClass} type="time" value={sleep.bedtime} onChange={(e) => setSleep({ ...sleep, bedtime: e.target.value })} onBlur={() => saveCheckIn({ sleep }, "Bedtime saved ✓")} /></label>
              <label className="block"><span className="text-sm font-bold text-slate-700">Wake time</span><input className={inputClass} type="time" value={sleep.wake} onChange={(e) => setSleep({ ...sleep, wake: e.target.value })} onBlur={() => saveCheckIn({ sleep }, "Wake time saved ✓")} /></label>
            </div>
          </section>

          <section className={cardClass}>
            <h2 className="text-2xl font-black">Salah</h2>
            <div className="mt-4 grid gap-2 md:grid-cols-5">{Object.keys(salah).map((prayer) => <label key={prayer} className="rounded-xl bg-slate-50 p-3 text-sm font-bold"><input className="mr-2" type="checkbox" checked={(salah as any)[prayer]} onChange={(e) => { const nextSalah = { ...salah, [prayer]: e.target.checked }; setSalah(nextSalah); saveCheckIn({ salah: nextSalah }, `${prayer} saved ✓`); }} />{prayer}</label>)}</div>
          </section>
        </section>

        <section className={cardClass}>
          <h2 className="text-2xl font-black">Personal Goals</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <GoalCard title="Personal Goal 1" value={goals.goal1} onChange={(value) => { const nextGoals = { ...goals, goal1: value }; setGoals(nextGoals); saveCheckIn({ goals: nextGoals }, "Goal 1 saved ✓"); }} preview={proof.goal1} onFile={(file) => previewPhoto("goal1", file)} onRemove={() => setProof((current) => ({ ...current, goal1: undefined }))} />
            <GoalCard title="Personal Goal 2" value={goals.goal2} onChange={(value) => { const nextGoals = { ...goals, goal2: value }; setGoals(nextGoals); saveCheckIn({ goals: nextGoals }, "Goal 2 saved ✓"); }} preview={proof.goal2} onFile={(file) => previewPhoto("goal2", file)} onRemove={() => setProof((current) => ({ ...current, goal2: undefined }))} />
          </div>
        </section>

        <section className={cardClass}>
          <h2 className="text-2xl font-black">Reflection</h2>
          <p className="mt-2 text-sm text-slate-600">Do this at the end of the day.</p>
          <div className="mt-4 flex flex-wrap gap-2">{[["1", "😔"], ["2", "😕"], ["3", "😐"], ["4", "🙂"], ["5", "😄"]].map(([value, emoji]) => <button key={value} onClick={() => { const nextReflection = { ...reflection, mood: value }; setReflection(nextReflection); saveCheckIn({ reflection: nextReflection }, "Mood saved ✓"); }} className={`rounded-2xl px-5 py-3 text-2xl ${reflection.mood === value ? "bg-emerald-500" : "bg-slate-100"}`}>{emoji}</button>)}</div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <textarea className={inputClass} rows={4} placeholder="Notes" value={reflection.notes} onChange={(e) => setReflection({ ...reflection, notes: e.target.value })} onBlur={() => saveCheckIn({ reflection }, "Reflection saved ✓")} />
            <textarea className={inputClass} rows={4} placeholder="What slipped?" value={reflection.slipped} onChange={(e) => setReflection({ ...reflection, slipped: e.target.value })} onBlur={() => saveCheckIn({ reflection }, "Reflection saved ✓")} />
            <textarea className={inputClass} rows={4} placeholder="What went well?" value={reflection.wentWell} onChange={(e) => setReflection({ ...reflection, wentWell: e.target.value })} onBlur={() => saveCheckIn({ reflection }, "Reflection saved ✓")} />
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <button onClick={finalize} className="rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Finalize today</button>
          <Link href="/dashboard" className="rounded-full bg-slate-950 px-5 py-3 font-black text-white">Back to dashboard</Link>
        </div>
      </div>
    </main>
  );
}

function TotalCard({ title, value, suffix }: { title: string; value: number; suffix: string }) {
  return <div className={cardClass}><p className="text-sm font-bold text-slate-500">{title}</p><p className="mt-1 text-3xl font-black text-slate-950">{value}</p><p className="text-sm font-bold text-emerald-700">{suffix}</p></div>;
}

function EntrySection({ title, description, total, suffix, category, labels, placeholder, entries, onAdd, onRemove, extraLink }: { title: string; description: string; total: number; suffix: string; category: keyof EntryState; labels: string[]; placeholder: string; entries: Entry[]; onAdd: (category: keyof EntryState, entry: Omit<Entry, "id">) => void; onRemove: (category: keyof EntryState, id: number) => void; extraLink?: React.ReactNode }) {
  const [label, setLabel] = useState(labels[0]);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  return <section className={cardClass}><div className="flex items-start justify-between gap-4"><div><h2 className="text-2xl font-black">{title}</h2><p className="mt-1 text-sm text-slate-600">{description}</p></div><div className="rounded-2xl bg-emerald-100 px-4 py-2 text-right"><p className="text-2xl font-black text-emerald-950">{total}</p><p className="text-xs font-black text-emerald-700">{suffix}</p></div></div><div className="mt-4 grid gap-2 md:grid-cols-[1fr_1fr]"><select className={inputClass} value={label} onChange={(e) => setLabel(e.target.value)}>{labels.map((item) => <option key={item}>{item}</option>)}</select><input className={inputClass} type="number" placeholder={placeholder} value={amount} onChange={(e) => setAmount(e.target.value)} /></div><input className={`${inputClass} mt-2`} placeholder="Optional note" value={note} onChange={(e) => setNote(e.target.value)} />{extraLink && <div className="mt-2">{extraLink}</div>}<button onClick={() => { onAdd(category, { label, amount: Number(amount), note }); setAmount(""); setNote(""); }} className="mt-3 rounded-full bg-emerald-600 px-4 py-2 text-sm font-black text-white">Save this entry</button><div className="mt-4 space-y-2">{entries.map((entry) => <div key={entry.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 text-sm"><div><p className="font-black">{entry.label}: {entry.amount} {suffix}</p>{entry.note && <p className="text-xs text-slate-500">{entry.note}</p>}</div><button onClick={() => onRemove(category, entry.id)} className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-500">Remove</button></div>)}</div></section>;
}

function GoalCard({ title, value, onChange, preview, onFile, onRemove }: { title: string; value: string; onChange: (value: string) => void; preview?: string; onFile: (file?: File) => void; onRemove: () => void }) {
  return <div className="rounded-2xl bg-slate-50 p-4"><h3 className="font-black">{title}</h3><select className={`${inputClass} mt-3`} value={value} onChange={(e) => onChange(e.target.value)}><option value="">Select status</option><option value="done">Done</option><option value="partial">Partial</option><option value="missed">Missed</option></select><label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-4 text-center text-sm font-bold text-slate-600"><span>Optional photo proof</span><input className="hidden" type="file" accept="image/*" capture="environment" onChange={(e) => onFile(e.target.files?.[0])} /></label>{preview && <div className="mt-3"><img src={preview} alt={`${title} preview`} className="h-44 w-full rounded-2xl object-cover" /><button onClick={onRemove} className="mt-2 rounded-full bg-white px-4 py-2 text-xs font-black text-slate-700">Remove photo</button></div>}</div>;
}
