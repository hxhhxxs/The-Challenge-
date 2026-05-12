"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cardClass, inputClass, pageBg } from "@/lib/challenge-ui";

export default function CheckInPage() {
  const router = useRouter();
  const [form, setForm] = useState({ weight: "", calories: "", protein: "", water: "", steps: "", exerciseMinutes: "", exerciseType: "walking", memorized: "", reviewed: "", goal1: "done", goal2: "done", money: "", restaurants: "", screen: "", social: "", youtube: "", gaming: "", tv: "", sleep: "", bedtime: "", wake: "", mood: "", notes: "", slipped: "", wentWell: "" });
  const [message, setMessage] = useState("");
  function submit() { setMessage("Check-in locked for today. Supabase daily_logs save is the next backend step."); setTimeout(() => router.push("/dashboard"), 900); }
  return <main className={pageBg}><section className={`${cardClass} mx-auto max-w-4xl`}><p className="text-sm font-bold text-emerald-700">Honest report</p><h1 className="mt-2 text-4xl font-black">Daily Check-In</h1><p className="mt-2 text-slate-600">Be honest. Lying hurts only you. The app calculates the result — you do the change.</p><div className="mt-6 grid gap-4 md:grid-cols-2">{Object.keys(form).map((key) => key === "goal1" || key === "goal2" ? <label key={key} className="block"><span className="text-sm font-bold text-slate-700">{key}</span><select className={inputClass} value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}><option>done</option><option>partial</option><option>missed</option></select></label> : <label key={key} className="block"><span className="text-sm font-bold text-slate-700">{key}</span><input className={inputClass} value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></label>)}</div>{message && <p className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800">{message}</p>}<button onClick={submit} className="mt-6 w-full rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Submit & lock today</button></section></main>;
}
