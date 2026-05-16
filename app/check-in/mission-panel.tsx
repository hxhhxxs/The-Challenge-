"use client";

import { useEffect, useMemo, useState } from "react";
import { getDailySmallMissions } from "@/lib/small-mission-bank";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureUserRecord } from "@/lib/supabase/ensure-user-record";

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function safeNum(v: any) { const n = Number(v); return Number.isFinite(n) ? n : 0; }
function round3(n: number) { return Math.round(n * 1000) / 1000; }
function daysBetween(start?: string, end?: string) {
  if (!start || !end) return 90;
  const s = new Date(`${String(start).slice(0, 10)}T00:00:00`);
  const e = new Date(`${String(end).slice(0, 10)}T00:00:00`);
  return Math.max(1, Math.floor((e.getTime() - s.getTime()) / 86400000) + 1);
}
function missionPoints(value: string, dailyMax: number) {
  if (value === "done") return dailyMax * 0.05;
  if (value === "partial") return dailyMax * 0.025;
  return 0;
}

export function MissionPanel() {
  const date = todayKey();
  const missions = useMemo(() => getDailySmallMissions(new Date(), 2), [date]);
  const [status, setStatus] = useState<Record<number, string>>({});
  const [userId, setUserId] = useState("");
  const [draft, setDraft] = useState<Record<string, any>>({});
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      const record = await ensureUserRecord(data.user);
      const d = (record.onboarding_draft || {}) as Record<string, any>;
      setUserId(record.id);
      setDraft(d);
      const { data: row } = await supabase.from("daily_logs").select("goals").eq("user_id", record.id).eq("date", date).maybeSingle();
      setStatus((row?.goals?.smallMissions || d.checkins?.[date]?.goals?.smallMissions || {}) as Record<number, string>);
    }
    load();
  }, [date]);

  async function saveStatus(missionId: number, value: string) {
    if (!userId) return;
    const supabase = createSupabaseBrowserClient();
    const nextStatus = { ...status, [missionId]: value };
    setStatus(nextStatus);
    setSaving(true);

    const { data: row } = await supabase.from("daily_logs").select("*").eq("user_id", userId).eq("date", date).maybeSingle();
    const dailyMax = 100 / daysBetween(draft.startDate, draft.endDate);
    const smallMissionPoints = round3(Object.values(nextStatus).reduce((sum, v) => sum + missionPoints(String(v), dailyMax), 0));

    const old = row?.computed_points || row?.computedPoints || {};
    const previousSmall = safeNum(old.smallMissionPoints);
    const personal = round3(Math.max(0, safeNum(old.personal) - previousSmall) + smallMissionPoints);
    const computedPoints = {
      ...old,
      smallMissionPoints,
      personal,
      total: round3(safeNum(old.body) + safeNum(old.quran) + safeNum(old.discipline) + personal + safeNum(old.character)),
    };
    const goals = { ...(row?.goals || {}), smallMissions: nextStatus };

    await supabase.from("daily_logs").upsert({ user_id: userId, date, goals, computed_points: computedPoints }, { onConflict: "user_id,date" });

    const checkins = { ...(draft.checkins || {}), [date]: { ...(draft.checkins?.[date] || {}), goals, computedPoints } };
    const totalScore = round3(Object.values(checkins).reduce((sum: number, item: any) => sum + safeNum(item.computedPoints?.total || item.computed_points?.total), 0));
    const pillarScores = { ...(draft.pillar_scores || {}) };
    pillarScores.niyyah = round3(Object.values(checkins).reduce((sum: number, item: any) => sum + safeNum(item.computedPoints?.personal || item.computed_points?.personal), 0));
    const nextDraft = { ...draft, checkins, current_score: totalScore, pillar_scores: pillarScores };
    await supabase.from("users").update({ onboarding_draft: nextDraft, current_score: totalScore, pillar_scores: pillarScores }).eq("id", userId);

    setDraft(nextDraft);
    setSaving(false);
    setMessage(`${value === "done" ? "Mission complete" : "Mission saved"} • +${missionPoints(value, dailyMax).toFixed(3)} Niyyah pts`);
    setTimeout(() => setMessage(""), 2200);
  }

  return (
    <section className="mx-auto max-w-5xl px-4 pt-5">
      <div className="rounded-[2rem] border border-emerald-100 bg-white p-5 shadow-xl">
        <div className="flex flex-col justify-between gap-2 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-black text-emerald-700">Niyyah Mission</p>
            <h2 className="text-2xl font-black text-slate-950">Today’s 2 small missions</h2>
            <p className="mt-1 text-sm font-bold text-slate-500">Useful tasks that take 20 minutes to 2 hours. Two rotate in each day.</p>
          </div>
          {(saving || message) && <p className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-800">{saving ? "Saving…" : message}</p>}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {missions.map((mission) => (
            <div key={mission.id} className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">{mission.category}</p>
              <h3 className="mt-1 text-lg font-black text-slate-950">{mission.title}</h3>
              <p className="mt-1 text-xs font-bold text-slate-500">20 min–2 hours</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["done", "partial", "missed"].map((choice) => (
                  <button key={choice} onClick={() => saveStatus(mission.id, choice)} className={`rounded-full px-4 py-2 text-sm font-black ${status[mission.id] === choice ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`}>{choice}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
