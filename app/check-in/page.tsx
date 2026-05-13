"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cardClass, inputClass, pageBg } from "@/lib/challenge-ui";

export default function CheckInPage() {
  const router = useRouter();
  const [form, setForm] = useState({ weight: "", calories: "", protein: "", water: "", steps: "", exerciseMinutes: "", exerciseType: "walking", memorized: "", reviewed: "", goal1: "done", goal2: "done", money: "", restaurants: "", screen: "", social: "", youtube: "", gaming: "", tv: "", sleep: "", bedtime: "", wake: "", mood: "", notes: "", slipped: "", wentWell: "" });
  const [proof, setProof] = useState<{ goal1?: string; goal2?: string }>({});
  const [message, setMessage] = useState("");

  function previewPhoto(slot: "goal1" | "goal2", file?: File) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setProof((current) => ({ ...current, [slot]: url }));
  }

  function submit() {
    setMessage("Check-in locked for today. Photo proof is private and ready for Supabase Storage in the next backend step.");
    setTimeout(() => router.push("/dashboard"), 1200);
  }

  return <main className={pageBg}><section className={`${cardClass} mx-auto max-w-4xl`}><p className="text-sm font-bold text-emerald-700">Honest report</p><h1 className="mt-2 text-4xl font-black">Daily Check-In</h1><p className="mt-2 text-slate-600">Be honest. Lying hurts only you. The app calculates the result — you do the change.</p><div className="mt-6 grid gap-4 md:grid-cols-2">{Object.keys(form).map((key) => key === "goal1" || key === "goal2" ? <label key={key} className="block"><span className="text-sm font-bold text-slate-700">{key}</span><select className={inputClass} value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}><option>done</option><option>partial</option><option>missed</option></select></label> : <label key={key} className="block"><span className="text-sm font-bold text-slate-700">{key}</span><input className={inputClass} value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></label>)}</div><section className="mt-6 rounded-[2rem] bg-slate-50 p-5"><div className="flex items-center justify-between gap-3"><div><h2 className="text-xl font-black">Optional photo proof</h2><p className="mt-1 text-sm text-slate-600">Attach a private photo for your personal goals. This can be a cleaned room, workout proof, study page, or anything that proves progress.</p></div><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">Private</span></div><div className="mt-4 grid gap-4 md:grid-cols-2"><PhotoProofCard title="Personal Goal 1 proof" preview={proof.goal1} onFile={(file) => previewPhoto("goal1", file)} onRemove={() => setProof((current) => ({ ...current, goal1: undefined }))} /><PhotoProofCard title="Personal Goal 2 proof" preview={proof.goal2} onFile={(file) => previewPhoto("goal2", file)} onRemove={() => setProof((current) => ({ ...current, goal2: undefined }))} /></div></section>{message && <p className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800">{message}</p>}<button onClick={submit} className="mt-6 w-full rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Submit & lock today</button></section></main>;
}

function PhotoProofCard({ title, preview, onFile, onRemove }: { title: string; preview?: string; onFile: (file?: File) => void; onRemove: () => void }) {
  return <div className="rounded-2xl bg-white p-4"><h3 className="font-black text-slate-950">{title}</h3><p className="mt-1 text-xs font-semibold text-slate-500">Optional. Only you can see this for now.</p><label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-4 text-center text-sm font-bold text-slate-600 hover:border-emerald-400"><span>Upload photo proof</span><span className="mt-1 text-xs font-semibold text-slate-400">JPG, PNG, or phone camera image</span><input className="hidden" type="file" accept="image/*" capture="environment" onChange={(e) => onFile(e.target.files?.[0])} /></label>{preview && <div className="mt-3"><img src={preview} alt={`${title} preview`} className="h-44 w-full rounded-2xl object-cover" /><button onClick={onRemove} className="mt-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-black text-slate-700">Remove photo</button></div>}</div>;
}
