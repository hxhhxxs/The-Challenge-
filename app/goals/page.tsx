"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cardClass, inputClass, pageBg } from "@/lib/challenge-ui";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureUserRecord } from "@/lib/supabase/ensure-user-record";

type CustomGoal = {
  id: string;
  name: string;
  why: string;
  endGoal: string;
  dailyTask: string;
  daysPerWeek: number;
  proofMethod: string;
  active: boolean;
};

type CustomDailyTask = {
  id: string;
  name: string;
  category: string;
  frequency: "daily" | "weekly" | "custom";
  points: number;
  active: boolean;
};

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const emptyGoal = { name: "", why: "", endGoal: "", dailyTask: "", daysPerWeek: 5, proofMethod: "log entry" };
const emptyTask = { name: "", category: "Personal", frequency: "daily" as const, points: 1 };

export default function GoalsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [draft, setDraft] = useState<Record<string, any> | null>(null);
  const [goals, setGoals] = useState<CustomGoal[]>([]);
  const [tasks, setTasks] = useState<CustomDailyTask[]>([]);
  const [goalForm, setGoalForm] = useState(emptyGoal);
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [message, setMessage] = useState("");
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
      const loadedDraft = (record.onboarding_draft || {}) as Record<string, any>;
      setUserId(data.user.id);
      setDraft(loadedDraft);
      setGoals((loadedDraft.custom_personal_goals || []) as CustomGoal[]);
      setTasks((loadedDraft.custom_daily_tasks || []) as CustomDailyTask[]);
    }
    load();
  }, [router]);

  async function save(nextGoals = goals, nextTasks = tasks, success = "Saved ✓") {
    if (!userId || !draft) return;
    setError("");
    const supabase = createSupabaseBrowserClient();
    const nextDraft = {
      ...draft,
      custom_personal_goals: nextGoals,
      custom_daily_tasks: nextTasks,
      updatedAt: new Date().toISOString(),
    };
    const { error: saveError } = await supabase.from("users").update({ onboarding_draft: nextDraft }).eq("id", userId);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    setDraft(nextDraft);
    setGoals(nextGoals);
    setTasks(nextTasks);
    setMessage(success);
    setTimeout(() => setMessage(""), 2000);
  }

  function addGoal() {
    if (goalForm.name.trim().length < 2) {
      setError("Goal name is required.");
      return;
    }
    if (goalForm.dailyTask.trim().length < 5) {
      setError("Daily task needs a little more detail.");
      return;
    }
    const nextGoals = [
      ...goals,
      {
        id: makeId(),
        name: goalForm.name.trim(),
        why: goalForm.why.trim(),
        endGoal: goalForm.endGoal.trim(),
        dailyTask: goalForm.dailyTask.trim(),
        daysPerWeek: Number(goalForm.daysPerWeek) || 5,
        proofMethod: goalForm.proofMethod,
        active: true,
      },
    ];
    setGoalForm(emptyGoal);
    save(nextGoals, tasks, "Personal goal added ✓");
  }

  function addTask() {
    if (taskForm.name.trim().length < 3) {
      setError("Task name is required.");
      return;
    }
    const nextTasks = [
      ...tasks,
      {
        id: makeId(),
        name: taskForm.name.trim(),
        category: taskForm.category.trim() || "Personal",
        frequency: taskForm.frequency,
        points: Number(taskForm.points) || 1,
        active: true,
      },
    ];
    setTaskForm(emptyTask);
    save(goals, nextTasks, "Daily task added ✓");
  }

  function toggleGoal(id: string) {
    const nextGoals = goals.map((goal) => goal.id === id ? { ...goal, active: !goal.active } : goal);
    save(nextGoals, tasks, "Goal updated ✓");
  }

  function deleteGoal(id: string) {
    const nextGoals = goals.filter((goal) => goal.id !== id);
    save(nextGoals, tasks, "Goal removed ✓");
  }

  function toggleTask(id: string) {
    const nextTasks = tasks.map((task) => task.id === id ? { ...task, active: !task.active } : task);
    save(goals, nextTasks, "Task updated ✓");
  }

  function deleteTask(id: string) {
    const nextTasks = tasks.filter((task) => task.id !== id);
    save(goals, nextTasks, "Task removed ✓");
  }

  if (!draft) return <main className={pageBg}><section className={`${cardClass} mx-auto max-w-xl`}>Loading goals…</section></main>;

  return (
    <main className={pageBg}>
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-[2rem] bg-slate-950 p-6 text-white">
          <p className="text-sm font-bold text-emerald-300">My Goals & Tasks</p>
          <h1 className="mt-1 text-4xl font-black">Add more goals. Build your own daily mission.</h1>
          <p className="mt-2 max-w-2xl text-slate-300">Your original two goals stay, but now you can add extra personal goals and custom daily tasks for yourself.</p>
        </section>

        {message && <p className="rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800">{message}</p>}
        {error && <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}

        <section className="grid gap-5 lg:grid-cols-2">
          <section className={cardClass}>
            <p className="text-sm font-black text-emerald-700">Add personal goal</p>
            <h2 className="mt-1 text-2xl font-black">Extra personal goal</h2>
            <div className="mt-4 space-y-3">
              <input className={inputClass} placeholder="Goal name, e.g. Boxing, Business, Hygiene" value={goalForm.name} onChange={(e) => setGoalForm({ ...goalForm, name: e.target.value })} />
              <textarea className={inputClass} rows={3} placeholder="Why do you want this?" value={goalForm.why} onChange={(e) => setGoalForm({ ...goalForm, why: e.target.value })} />
              <textarea className={inputClass} rows={3} placeholder="End goal by the end of the challenge" value={goalForm.endGoal} onChange={(e) => setGoalForm({ ...goalForm, endGoal: e.target.value })} />
              <input className={inputClass} placeholder="Daily task, e.g. Practice boxing footwork for 20 minutes" value={goalForm.dailyTask} onChange={(e) => setGoalForm({ ...goalForm, dailyTask: e.target.value })} />
              <div className="grid gap-3 md:grid-cols-2">
                <label className="text-sm font-bold text-slate-700">Days/week<input className={inputClass} type="number" min={1} max={7} value={goalForm.daysPerWeek} onChange={(e) => setGoalForm({ ...goalForm, daysPerWeek: Number(e.target.value) })} /></label>
                <label className="text-sm font-bold text-slate-700">Proof method<select className={inputClass} value={goalForm.proofMethod} onChange={(e) => setGoalForm({ ...goalForm, proofMethod: e.target.value })}><option>log entry</option><option>photo</option><option>time tracked</option><option>count</option><option>free text</option></select></label>
              </div>
              <button onClick={addGoal} className="rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Add personal goal</button>
            </div>
          </section>

          <section className={cardClass}>
            <p className="text-sm font-black text-emerald-700">Add daily task</p>
            <h2 className="mt-1 text-2xl font-black">Custom daily task</h2>
            <div className="mt-4 space-y-3">
              <input className={inputClass} placeholder="Task name, e.g. Read 10 pages" value={taskForm.name} onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })} />
              <div className="grid gap-3 md:grid-cols-3">
                <label className="text-sm font-bold text-slate-700">Category<input className={inputClass} value={taskForm.category} onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value })} /></label>
                <label className="text-sm font-bold text-slate-700">Frequency<select className={inputClass} value={taskForm.frequency} onChange={(e) => setTaskForm({ ...taskForm, frequency: e.target.value as CustomDailyTask["frequency"] })}><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="custom">Custom</option></select></label>
                <label className="text-sm font-bold text-slate-700">Points<input className={inputClass} type="number" min={1} max={10} value={taskForm.points} onChange={(e) => setTaskForm({ ...taskForm, points: Number(e.target.value) })} /></label>
              </div>
              <button onClick={addTask} className="rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Add daily task</button>
            </div>
          </section>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <section className={cardClass}>
            <div className="flex items-end justify-between gap-3">
              <div><p className="text-sm font-black text-emerald-700">Extra goals</p><h2 className="text-2xl font-black">{goals.length} added</h2></div>
            </div>
            <div className="mt-4 space-y-3">
              {goals.length === 0 ? <p className="text-sm text-slate-600">No extra goals yet.</p> : goals.map((goal) => <div key={goal.id} className="rounded-2xl bg-slate-50 p-4"><div className="flex justify-between gap-3"><div><p className="font-black text-slate-950">{goal.name}</p><p className="mt-1 text-sm text-slate-600">{goal.dailyTask}</p><p className="mt-1 text-xs font-bold text-emerald-700">{goal.daysPerWeek} days/week • {goal.proofMethod}</p></div><span className={`h-fit rounded-full px-3 py-1 text-xs font-black ${goal.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-500"}`}>{goal.active ? "Active" : "Paused"}</span></div><div className="mt-3 flex gap-2"><button onClick={() => toggleGoal(goal.id)} className="rounded-full bg-white px-3 py-2 text-xs font-black text-slate-700">{goal.active ? "Pause" : "Activate"}</button><button onClick={() => deleteGoal(goal.id)} className="rounded-full bg-white px-3 py-2 text-xs font-black text-red-600">Delete</button></div></div>)}
            </div>
          </section>

          <section className={cardClass}>
            <div className="flex items-end justify-between gap-3">
              <div><p className="text-sm font-black text-emerald-700">Custom daily tasks</p><h2 className="text-2xl font-black">{tasks.length} added</h2></div>
            </div>
            <div className="mt-4 space-y-3">
              {tasks.length === 0 ? <p className="text-sm text-slate-600">No custom tasks yet.</p> : tasks.map((task) => <div key={task.id} className="rounded-2xl bg-slate-50 p-4"><div className="flex justify-between gap-3"><div><p className="font-black text-slate-950">{task.name}</p><p className="mt-1 text-xs font-bold text-emerald-700">{task.category} • {task.frequency} • {task.points} pts</p></div><span className={`h-fit rounded-full px-3 py-1 text-xs font-black ${task.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-500"}`}>{task.active ? "Active" : "Paused"}</span></div><div className="mt-3 flex gap-2"><button onClick={() => toggleTask(task.id)} className="rounded-full bg-white px-3 py-2 text-xs font-black text-slate-700">{task.active ? "Pause" : "Activate"}</button><button onClick={() => deleteTask(task.id)} className="rounded-full bg-white px-3 py-2 text-xs font-black text-red-600">Delete</button></div></div>)}
            </div>
          </section>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard" className="rounded-full bg-slate-950 px-5 py-3 font-black text-white">Back to dashboard</Link>
          <Link href="/check-in" className="rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Log today</Link>
        </div>
      </div>
    </main>
  );
}
