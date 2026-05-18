"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureUserRecord } from "@/lib/supabase/ensure-user-record";
import { cardClass, inputClass, pageBg } from "@/lib/challenge-ui";

type GalleryPhoto = {
  id: string;
  date: string;
  title: string;
  caption: string;
  pillar: "quwwah" | "imaan" | "sabr" | "niyyah" | "adab";
  dataUrl?: string;
  createdAt: string;
};

const PILLARS = [
  { id: "all", label: "All" },
  { id: "quwwah", label: "Quwwah" },
  { id: "imaan", label: "Imaan" },
  { id: "sabr", label: "Sabr" },
  { id: "niyyah", label: "Niyyah" },
  { id: "adab", label: "Adab" },
];

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function pillarLabel(pillar: string) { return PILLARS.find((p) => p.id === pillar)?.label || "Memory"; }
function resizeImage(file: File): Promise<string> { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onerror = () => reject(new Error("Could not read image.")); reader.onload = () => { const img = new Image(); img.onerror = () => reject(new Error("Could not load image.")); img.onload = () => { const max = 900; const scale = Math.min(1, max / Math.max(img.width, img.height)); const canvas = document.createElement("canvas"); canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale); const ctx = canvas.getContext("2d"); if (!ctx) return reject(new Error("Canvas unavailable.")); ctx.drawImage(img, 0, 0, canvas.width, canvas.height); resolve(canvas.toDataURL("image/jpeg", 0.78)); }; img.src = String(reader.result || ""); }; reader.readAsDataURL(file); }); }

export default function GalleryPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [draft, setDraft] = useState<Record<string, any>>({});
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [filter, setFilter] = useState("all");
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [pillar, setPillar] = useState<GalleryPhoto["pillar"]>("quwwah");
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { async function load() { const supabase = createSupabaseBrowserClient(); const { data } = await supabase.auth.getUser(); if (!data.user) { router.push("/login"); return; } const record = await ensureUserRecord(data.user); const d = (record.onboarding_draft || {}) as Record<string, any>; setUserId(record.id); setDraft(d); setPhotos(Array.isArray(d.galleryPhotos) ? d.galleryPhotos : []); } load(); }, [router]);
  const filtered = useMemo(() => { const list = filter === "all" ? photos : photos.filter((photo) => photo.pillar === filter); return [...list].sort((a, b) => String(b.date).localeCompare(String(a.date)) || String(b.createdAt).localeCompare(String(a.createdAt))); }, [photos, filter]);
  async function chooseFile(file?: File) { setError(""); if (!file) return; if (!file.type.startsWith("image/")) { setError("Please choose an image file."); return; } try { const dataUrl = await resizeImage(file); setPreview(dataUrl); if (!title) setTitle(file.name.replace(/\.[^.]+$/, "").slice(0, 40)); } catch (err: any) { setError(err?.message || "Image preview failed."); } }
  async function savePhoto() { setError(""); setMessage(""); if (!preview) { setError("Choose a photo first."); return; } if (!title.trim()) { setError("Give the memory a short title."); return; } const photo: GalleryPhoto = { id: crypto.randomUUID(), date: todayKey(), title: title.trim(), caption: caption.trim(), pillar, dataUrl: preview, createdAt: new Date().toISOString() }; const nextPhotos = [photo, ...photos].slice(0, 200); const nextDraft = { ...draft, galleryPhotos: nextPhotos }; const supabase = createSupabaseBrowserClient(); const { error: updateError } = await supabase.from("users").update({ onboarding_draft: nextDraft }).eq("id", userId); if (updateError) { setError(updateError.message); return; } setDraft(nextDraft); setPhotos(nextPhotos); setTitle(""); setCaption(""); setPreview(""); setPillar("quwwah"); setMessage("Photo saved to your private gallery ✓"); setTimeout(() => setMessage(""), 2500); }
  async function deletePhoto(id: string) { const nextPhotos = photos.filter((photo) => photo.id !== id); const nextDraft = { ...draft, galleryPhotos: nextPhotos }; const supabase = createSupabaseBrowserClient(); const { error: updateError } = await supabase.from("users").update({ onboarding_draft: nextDraft }).eq("id", userId); if (updateError) { setError(updateError.message); return; } setDraft(nextDraft); setPhotos(nextPhotos); }

  return <main className={pageBg}><div className="mx-auto max-w-6xl space-y-6"><section className="rounded-[2rem] bg-slate-950 p-6 text-white"><p className="text-sm font-bold text-emerald-300">Private Gallery</p><h1 className="mt-1 text-4xl font-black">Your challenge memories.</h1><p className="mt-2 max-w-2xl text-slate-300">Save photos from meals, workouts, Qur’an sessions, family moments, and mission proof. Private by default.</p></section>
    <section className={cardClass}><div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between"><div><p className="text-sm font-black text-emerald-700">Add a memory</p><h2 className="text-2xl font-black">Upload today’s photo</h2><p className="mt-1 text-sm font-bold text-slate-500">Save a private photo memory from today’s challenge.</p></div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">{photos.length} photos</span></div><div className="mt-5 grid gap-4 md:grid-cols-[0.8fr_1.2fr]"><div className="flex min-h-64 items-center justify-center overflow-hidden rounded-[1.5rem] bg-slate-100">{preview ? <img src={preview} alt="Preview" className="h-full w-full object-cover" /> : <p className="p-8 text-center text-sm font-bold text-slate-500">Choose a photo to preview it here.</p>}</div><div className="space-y-3"><input className={inputClass} type="file" accept="image/*" onChange={(e) => chooseFile(e.target.files?.[0])} /><input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Short title, like Gym Day 3" /><textarea className={inputClass} rows={3} value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Optional caption" /><select className={inputClass} value={pillar} onChange={(e) => setPillar(e.target.value as GalleryPhoto["pillar"])}><option value="quwwah">Quwwah — Body</option><option value="imaan">Imaan — Faith</option><option value="sabr">Sabr — Discipline</option><option value="niyyah">Niyyah — Mission</option><option value="adab">Adab — Character</option></select><button onClick={savePhoto} className="rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Save photo</button></div></div>{error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}{message && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800">{message}</p>}</section>
    <section className={cardClass}><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><p className="text-sm font-black text-emerald-700">Browse</p><h2 className="text-2xl font-black">Photo timeline</h2></div><div className="flex flex-wrap gap-2">{PILLARS.map((p) => <button key={p.id} onClick={() => setFilter(p.id)} className={`rounded-full px-3 py-2 text-xs font-black ${filter === p.id ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"}`}>{p.label}</button>)}</div></div>{filtered.length === 0 ? <div className="mt-5 rounded-2xl bg-slate-50 p-8 text-center"><p className="text-lg font-black text-slate-950">No photos yet.</p><p className="mt-1 text-sm font-bold text-slate-500">Add your first challenge memory above.</p></div> : <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((photo) => <article key={photo.id} className="overflow-hidden rounded-[1.5rem] bg-slate-50"><div className="aspect-square bg-slate-100">{photo.dataUrl ? <img src={photo.dataUrl} alt={photo.title} className="h-full w-full object-cover" /> : null}</div><div className="p-4"><div className="flex items-center justify-between gap-3"><p className="rounded-full bg-white px-3 py-1 text-xs font-black text-emerald-700">{pillarLabel(photo.pillar)}</p><p className="text-xs font-bold text-slate-500">{photo.date}</p></div><h3 className="mt-3 text-lg font-black text-slate-950">{photo.title}</h3>{photo.caption && <p className="mt-1 text-sm font-semibold text-slate-600">{photo.caption}</p>}<button onClick={() => deletePhoto(photo.id)} className="mt-4 text-xs font-black text-red-600">Delete</button></div></article>)}</div>}</section>
    <section className="rounded-[2rem] bg-amber-100 p-5 text-amber-950"><p className="text-sm font-black uppercase tracking-wide">Photo proof</p><p className="mt-1 text-sm font-semibold">Use this gallery to document your meals, workouts, Qur’an sessions, and personal-goal proof throughout the challenge.</p><Link href="/check-in" className="mt-4 inline-block rounded-full bg-amber-900 px-5 py-3 text-sm font-black text-white">Go log today</Link></section>
  </div><BottomNav /></main>;
}
