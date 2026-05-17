"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureUserRecord } from "@/lib/supabase/ensure-user-record";
import { cardClass, inputClass, pageBg } from "@/lib/challenge-ui";
import { appThemeModes, getThemeMode, type AppThemeMode } from "@/lib/theme-modes";
import { setChallengeThemeMode } from "@/components/ThemeModeProvider";

type Profile = { id: string; name?: string; email?: string; username?: string; display_name?: string; onboarding_complete?: boolean; onboarding_draft?: Record<string, any> };
function hasAutoSuffix(username?: string) { return /_[a-f0-9]{4,}$/i.test(username || ""); }
function cleanUsername(value: string) { return value.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "").slice(0, 30); }

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [themeMode, setThemeMode] = useState<AppThemeMode>("light");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => { async function load() { const supabase = createSupabaseBrowserClient(); const { data } = await supabase.auth.getUser(); if (!data.user) { router.push("/login"); return; } const record = await ensureUserRecord(data.user); const draft = (record.onboarding_draft || {}) as Record<string, any>; const savedTheme = getThemeMode(draft.themeMode || (typeof window !== "undefined" ? window.localStorage.getItem("challenge_theme_mode") : "light")); setProfile({ ...record, onboarding_draft: draft }); setDisplayName(draft.displayName || (record as any).display_name || record.username || record.name || ""); setUsername(record.username || ""); setShowLeaderboard(draft.showLeaderboard !== false); setThemeMode(savedTheme); setChallengeThemeMode(savedTheme); } load(); }, [router]);

  async function save() {
    if (!profile) return;
    setError(""); setMessage("");
    const nextUsername = cleanUsername(username);
    if (!nextUsername || nextUsername.length < 3) { setError("Username must be at least 3 characters."); return; }
    const supabase = createSupabaseBrowserClient();
    if (nextUsername !== profile.username) {
      const { data: taken } = await supabase.from("users").select("id").eq("username", nextUsername).neq("id", profile.id).maybeSingle();
      if (taken) { setError("Username taken — try your full name, initials, or a clean number like hamzeh01."); return; }
    }
    const nextDraft = { ...(profile.onboarding_draft || {}), displayName, showLeaderboard, themeMode };
    const { error: updateError } = await supabase.from("users").update({ username: nextUsername, display_name: displayName, onboarding_draft: nextDraft }).eq("id", profile.id);
    if (updateError) { setError(updateError.message); return; }
    setProfile({ ...profile, username: nextUsername, display_name: displayName, onboarding_draft: nextDraft });
    setUsername(nextUsername);
    setMessage("Settings saved ✓");
    setTimeout(() => setMessage(""), 2500);
  }

  function downloadMyData() {
    if (!profile) return;
    const exportData = { exportedAt: new Date().toISOString(), profile };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `the-challenge-profile-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setMessage("Data export downloaded ✓");
    setTimeout(() => setMessage(""), 2500);
  }

  function chooseTheme(mode: AppThemeMode) { setThemeMode(mode); setChallengeThemeMode(mode); }
  async function logout() { const supabase = createSupabaseBrowserClient(); await supabase.auth.signOut(); router.push("/landing"); }

  if (!profile) return <main className={pageBg}><section className={`${cardClass} mx-auto max-w-xl`}>Loading settings…</section><BottomNav /></main>;

  return <main className={pageBg}><div className="mx-auto max-w-5xl space-y-6"><section className="rounded-[2rem] bg-slate-950 p-6 text-white"><p className="text-sm font-bold text-emerald-300">Profile & Settings</p><h1 className="mt-1 text-4xl font-black">{profile.name || "Your profile"}</h1><p className="mt-2 text-slate-300">Manage your profile, privacy, challenge tools, visual modes, and account.</p></section>
    <section className="grid gap-4 md:grid-cols-[0.8fr_1.2fr]"><div className={cardClass}><div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500 text-4xl font-black text-slate-950">{String(profile.name || profile.username || "C").slice(0, 1)}</div><h2 className="mt-4 text-2xl font-black">{profile.name || "Challenger"}</h2><p className="mt-1 text-sm font-bold text-slate-500">@{profile.username || "username"}</p><p className="mt-1 text-sm text-slate-500">{profile.email}</p>{hasAutoSuffix(profile.username) && <p className="mt-4 rounded-2xl bg-amber-50 p-3 text-sm font-bold text-amber-800">Your username looks auto-generated. Choose a clean username before presenting or sharing.</p>}<Link href="/profile" className="mt-5 inline-block rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white">Open Character Sheet</Link></div>
      <div className={cardClass}><h2 className="text-2xl font-black">Profile</h2><label className="mt-4 block"><span className="text-sm font-bold text-slate-700">Display name on leaderboard</span><input className={inputClass} value={displayName} onChange={(e) => setDisplayName(e.target.value)} /></label><label className="mt-4 block"><span className="text-sm font-bold text-slate-700">Username</span><input className={inputClass} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="hamzeh.adi" /></label><label className="mt-4 flex gap-2 text-sm font-bold text-slate-700"><input type="checkbox" checked={showLeaderboard} onChange={(e) => setShowLeaderboard(e.target.checked)} />Show me on leaderboard</label><div aria-live="polite">{message && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800">{message}</p>}{error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}</div><button onClick={save} className="mt-5 rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Save settings</button></div></section>
    <section className={cardClass}><div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between"><div><p className="text-sm font-black text-emerald-700">Appearance</p><h2 className="text-2xl font-black">Choose your mode</h2><p className="mt-1 text-sm text-slate-500">Pick a calm light/dark mode or an elemental visual style.</p></div><div className="flex flex-wrap gap-2"><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">Current: {appThemeModes.find((mode) => mode.id === themeMode)?.name}</span><button onClick={() => chooseTheme("light")} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">Reset to default</button></div></div><div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{appThemeModes.map((mode) => <button key={mode.id} onClick={() => chooseTheme(mode.id)} className={`overflow-hidden rounded-[1.5rem] border text-left transition hover:-translate-y-1 ${themeMode === mode.id ? "border-emerald-600 ring-4 ring-emerald-100" : "border-slate-200"}`}><div className={`h-24 bg-gradient-to-br ${mode.preview}`}><div className="flex h-full items-end gap-2 p-3"><span className="h-8 flex-1 rounded-full bg-white/80" /><span className="h-8 flex-1 rounded-full bg-black/25" /><span className="h-8 flex-1 rounded-full bg-white/30" /></div></div><div className="bg-white/90 p-4 backdrop-blur"><div className="flex items-center justify-between gap-3"><h3 className="text-lg font-black text-slate-950">{mode.name}</h3>{mode.arabicName && <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-black text-slate-700">{mode.arabicName}</span>}</div><p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{mode.description}</p><p className="mt-3 text-xs font-black text-slate-950">{themeMode === mode.id ? "Selected" : "Tap to preview"}</p></div></button>)}</div></section>
    <section className={cardClass}><h2 className="text-2xl font-black">Challenge tools</h2><div className="mt-4 grid gap-3 md:grid-cols-3"><Tool href="/profile" title="Character sheet" /><Tool href="/tools" title="All tools" /><Tool href="/edit-plan" title="Edit plan" /><Tool href="/intentions" title="Implementation intentions" /><Tool href="/ramadan" title="Ramadan Mode" /><Tool href="/partner" title="Accountability partner" /><Tool href="/share-card" title="Share card" /><Tool href="/why-reset" title="Why reset" /><Tool href="/weekly-review" title="Weekly review" /><Tool href="/food-photo" title="Food photo log" /><Tool href="/limits" title="Monthly limits" /></div></section>
    <section className={cardClass}><h2 className="text-2xl font-black">Data & Privacy</h2><p className="mt-2 text-sm font-bold text-slate-500">Download a JSON copy of your profile settings and challenge plan.</p><button onClick={downloadMyData} className="mt-4 rounded-full bg-slate-950 px-5 py-3 font-black text-white">Download my data</button></section>
    <section className={cardClass}><h2 className="text-2xl font-black">Account</h2><div className="mt-4 flex flex-wrap gap-3"><button onClick={logout} className="rounded-full bg-red-100 px-5 py-3 font-black text-red-700">Logout</button></div></section></div><BottomNav /></main>;
}
function Tool({ href, title }: { href: string; title: string }) { return <Link href={href} className="rounded-2xl bg-slate-50 p-4 text-sm font-black text-slate-800 hover:bg-emerald-50 hover:text-emerald-800">{title} →</Link>; }
