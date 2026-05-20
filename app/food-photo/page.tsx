"use client";

import Link from "next/link";
import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { cardClass, inputClass, pageBg } from "@/lib/challenge-ui";

type Estimate = { mealName: string; calories: string; protein: string; confidence: string; note: string };

export default function FoodPhotoPage() {
  const [preview, setPreview] = useState("");
  const [estimate, setEstimate] = useState<Estimate>({ mealName: "", calories: "", protein: "", confidence: "", note: "" });
  const [saved, setSaved] = useState(false);

  function onPhoto(file?: File) {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setEstimate({ mealName: "Meal photo", calories: "", protein: "", confidence: "Manual review", note: "Add portion details, sauces, drinks, or anything important before saving." });
    setSaved(false);
  }

  return <main className={pageBg}><div className="mx-auto max-w-5xl space-y-6"><section className="rounded-[2rem] bg-slate-950 p-6 text-white"><p className="text-sm font-bold text-emerald-300">Photo Food Log</p><h1 className="mt-1 text-4xl font-black">Capture the meal. Confirm the numbers.</h1><p className="mt-2 max-w-2xl text-slate-300">Take or upload a food photo, then enter the calories and protein you want saved with the meal.</p></section>
    <section className="grid gap-6 md:grid-cols-[0.9fr_1.1fr]"><div className={cardClass}><h2 className="text-2xl font-black">Upload meal photo</h2><p className="mt-2 text-sm text-slate-600">Use your phone camera or upload from your gallery. You stay in control of the final calorie number.</p><label className="mt-5 flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-slate-200 p-5 text-center hover:border-emerald-400">{preview ? <img src={preview} alt="Food preview" className="h-64 w-full rounded-[1.5rem] object-cover" /> : <><span className="text-5xl">📸</span><span className="mt-3 font-black text-slate-900">Tap to add food photo</span><span className="mt-1 text-xs font-semibold text-slate-500">JPG, PNG, or camera image</span></>}<input className="hidden" type="file" accept="image/*" capture="environment" onChange={(e) => onPhoto(e.target.files?.[0])} /></label>{preview && <button onClick={() => { setPreview(""); setEstimate({ mealName: "", calories: "", protein: "", confidence: "", note: "" }); }} className="mt-3 rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700">Remove photo</button>}</div>
      <div className={cardClass}><h2 className="text-2xl font-black">Confirm meal details</h2><div className="mt-5 space-y-4"><label className="block"><span className="text-sm font-bold text-slate-700">Meal name</span><input className={inputClass} placeholder="Chicken bowl, eggs, salad..." value={estimate.mealName} onChange={(e) => setEstimate({ ...estimate, mealName: e.target.value })} /></label><label className="block"><span className="text-sm font-bold text-slate-700">Calories</span><input className={inputClass} type="number" placeholder="Enter calories" value={estimate.calories} onChange={(e) => setEstimate({ ...estimate, calories: e.target.value })} /></label><label className="block"><span className="text-sm font-bold text-slate-700">Protein grams optional</span><input className={inputClass} type="number" placeholder="Protein g" value={estimate.protein} onChange={(e) => setEstimate({ ...estimate, protein: e.target.value })} /></label><label className="block"><span className="text-sm font-bold text-slate-700">Notes</span><textarea className={inputClass} rows={4} placeholder="Portion size, sauces, drinks, or anything important..." value={estimate.note} onChange={(e) => setEstimate({ ...estimate, note: e.target.value })} /></label></div><div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-900">Photo meal logs are designed for honesty and memory. Confirm the numbers before adding them to your day.</div>{saved && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800">Meal details confirmed. Add these calories on the Log page.</p>}<button onClick={() => setSaved(true)} className="mt-5 w-full rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Confirm meal</button></div></section>
    <section className={cardClass}><h2 className="text-2xl font-black">How to use this well</h2><div className="mt-4 grid gap-3 md:grid-cols-3"><Step title="1. Capture" text="Take one clear photo before eating." /><Step title="2. Confirm" text="Enter calories and protein based on your best estimate." /><Step title="3. Log" text="Add the meal to today's calories from the Log page." /></div></section>
    <div className="flex flex-wrap gap-3"><Link href="/check-in" className="rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Open Log</Link><Link href="/tools" className="rounded-full bg-slate-100 px-5 py-3 font-black text-slate-800">More tools</Link></div></div><BottomNav /></main>;
}
function Step({ title, text }: { title: string; text: string }) { return <div className="rounded-2xl bg-slate-50 p-4"><p className="font-black text-slate-950">{title}</p><p className="mt-1 text-sm text-slate-600">{text}</p></div>; }