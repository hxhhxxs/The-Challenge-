"use client";

import { useMemo, useState } from "react";
import { getDailySmallMissions } from "@/lib/small-mission-bank";

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function MissionPanel() {
  const date = todayKey();
  const missions = useMemo(() => getDailySmallMissions(new Date(), 2), [date]);
  const [status, setStatus] = useState<Record<number, string>>({});

  return (
    <section className="mx-auto max-w-5xl px-4 pt-5">
      <div className="rounded-[2rem] border border-emerald-100 bg-white p-5 shadow-xl">
        <p className="text-sm font-black text-emerald-700">Niyyah Mission</p>
        <h2 className="text-2xl font-black text-slate-950">Today’s 2 small missions</h2>
        <p className="mt-1 text-sm font-bold text-slate-500">Useful tasks that take 20 minutes to 2 hours. Two rotate in each day.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {missions.map((mission) => (
            <div key={mission.id} className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black uppercase tracking-wide text-emerald-700">{mission.category}</p>
              <h3 className="mt-1 text-lg font-black text-slate-950">{mission.title}</h3>
              <p className="mt-1 text-xs font-bold text-slate-500">20 min–2 hours</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["done", "partial", "missed"].map((choice) => (
                  <button key={choice} onClick={() => setStatus({ ...status, [mission.id]: choice })} className={`rounded-full px-4 py-2 text-sm font-black ${status[mission.id] === choice ? "bg-emerald-600 text-white" : "bg-white text-slate-700"}`}>{choice}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
