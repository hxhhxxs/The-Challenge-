"use client";

import Link from "next/link";
import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { cardClass, inputClass, pageBg } from "@/lib/challenge-ui";

const encouragements = ["Praying for you", "Get back up", "You got this", "One honest day at a time", "Finish strong tonight"];
const visibleItems = ["Daily mission completion yes/no", "Total score", "Current streak", "Whether today's check-in is submitted", "Short encouragement messages"];
const hiddenItems = ["Weight numbers", "Calories", "Money spent", "Private notes", "Photo proof unless you choose to share later", "Specific Qur'an amount unless you opt in later"];

export default function PartnerPage() {
  const [partnerEmail, setPartnerEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState<string[]>([]);
  function invitePartner() {
    if (!partnerEmail.includes("@")) { setMessage("Enter a valid email for your accountability partner."); return; }
    setMessage(`Invite prepared for ${partnerEmail}. Confirm with your partner before connecting.`);
  }
  function sendEncouragement(text: string) { setSent((current) => [text, ...current].slice(0, 5)); }
  return <main className={pageBg}><div className="mx-auto max-w-6xl space-y-6"><section className="rounded-[2rem] bg-slate-950 p-6 text-white"><p className="text-sm font-bold text-emerald-300">Accountability Partner</p><h1 className="mt-1 text-4xl font-black">Bring one person with you.</h1><p className="mt-2 max-w-2xl text-slate-300">Invite one trusted person. They see your consistency, not your private numbers.</p></section>
    <section className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]"><div className={cardClass}><h2 className="text-2xl font-black">Invite your partner</h2><p className="mt-2 text-sm text-slate-600">Each user gets one trusted partner so accountability stays personal, focused, and private.</p><label className="mt-5 block"><span className="text-sm font-bold text-slate-700">Partner email</span><input className={inputClass} type="email" placeholder="friend@example.com" value={partnerEmail} onChange={(e) => setPartnerEmail(e.target.value)} /></label>{message && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800">{message}</p>}<button onClick={invitePartner} className="mt-5 rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Create invite</button></div>
      <div className={cardClass}><h2 className="text-2xl font-black">Partner preview</h2><div className="mt-4 rounded-2xl bg-slate-50 p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-bold text-slate-500">Your partner sees</p><p className="text-xl font-black text-slate-950">Mission completed: 0 / 15</p></div><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-800">Private-safe</span></div><p className="mt-3 text-sm text-slate-600">They can encourage you without seeing sensitive health, money, or private reflection details.</p></div></div></section>
    <section className="grid gap-4 md:grid-cols-2"><div className={cardClass}><h2 className="text-xl font-black">Visible to partner</h2><div className="mt-4 space-y-2">{visibleItems.map((item) => <p key={item} className="rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-900">✓ {item}</p>)}</div></div><div className={cardClass}><h2 className="text-xl font-black">Always hidden by default</h2><div className="mt-4 space-y-2">{hiddenItems.map((item) => <p key={item} className="rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-700">Private: {item}</p>)}</div></div></section>
    <section className={cardClass}><h2 className="text-2xl font-black">Send encouragement</h2><p className="mt-2 text-sm text-slate-600">Use short pre-written messages so the partner feature stays positive and simple.</p><div className="mt-4 flex flex-wrap gap-2">{encouragements.map((text) => <button key={text} onClick={() => sendEncouragement(text)} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-black text-slate-700 hover:bg-emerald-100">{text}</button>)}</div>{sent.length > 0 && <div className="mt-5 rounded-2xl bg-slate-50 p-4"><p className="text-sm font-black text-slate-500">Recent encouragements</p>{sent.map((item, index) => <p key={`${item}-${index}`} className="mt-2 text-sm font-bold text-slate-900">“{item}”</p>)}</div>}</section>
    <div className="flex gap-3"><Link href="/dashboard" className="rounded-full bg-slate-950 px-5 py-3 font-black text-white">Dashboard</Link><Link href="/intentions" className="rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Plan goals</Link></div></div><BottomNav /></main>;
}