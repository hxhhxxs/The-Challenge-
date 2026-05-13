"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureUserRecord } from "@/lib/supabase/ensure-user-record";
import { cardClass, inputClass, pageBg } from "@/lib/challenge-ui";

type Profile = {
  id: string;
  name?: string;
  email?: string;
  username?: string;
  onboarding_complete?: boolean;
  onboarding_draft?: Record<string, any>;
};

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
        return;
      }
      const record = await ensureUserRecord(data.user);
      const draft = (record.onboarding_draft || {}) as Record<string, any>;
      setProfile({ ...record, onboarding_draft: draft });
      setDisplayName(draft.displayName || record.username || record.name || "");
      setShowLeaderboard(draft.showLeaderboard !== false);
    }
    load();
  }, [router]);

  async function save() {
    if (!profile) return;
    const supabase = createSupabaseBrowserClient();
    const nextDraft = { ...(profile.onboarding_draft || {}), displayName, showLeaderboard };
    await supabase.from("users").update({ onboarding_draft: nextDraft }).eq("id", profile.id);
    setMessage("Settings saved.");
    setTimeout(() => setMessage(""), 2000);
  }

  async function logout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/landing");
  }

  if (!profile) return <main className={pageBg}><section className={`${cardClass} mx-auto max-w-xl`}>Loading settings…</section></main>;

  return (
    <main className={pageBg}>
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[2rem] bg-slate-950 p-6 text-white">
          <p className="text-sm font-bold text-emerald-300">Profile & Settings</p>
          <h1 className="mt-1 text-4xl font-black">{profile.name || "Your profile"}</h1>
          <p className="mt-2 text-slate-300">Manage your profile, privacy, challenge tools, and account.</p>
        </section>

        <section className="grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
          <div className={cardClass}>
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500 text-4xl font-black text-slate-950">
              {String(profile.name || profile.username || "C").slice(0, 1)}
            </div>
            <h2 className="mt-4 text-2xl font-black">{profile.name || "Challenger"}</h2>
            <p className="mt-1 text-sm font-bold text-slate-500">@{profile.username || "username"}</p>
            <p className="mt-1 text-sm text-slate-500">{profile.email}</p>
            <Link href="/profile" className="mt-5 inline-block rounded-full bg-emerald-600 px-5 py-3 text-sm font-black text-white">Open Character Sheet</Link>
          </div>

          <div className={cardClass}>
            <h2 className="text-2xl font-black">Profile</h2>
            <label className="mt-4 block">
              <span className="text-sm font-bold text-slate-700">Display name on leaderboard</span>
              <input className={inputClass} value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </label>
            <label className="mt-4 flex gap-2 text-sm font-bold text-slate-700">
              <input type="checkbox" checked={showLeaderboard} onChange={(e) => setShowLeaderboard(e.target.checked)} />
              Show me on leaderboard
            </label>
            {message && <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800">{message}</p>}
            <button onClick={save} className="mt-5 rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Save settings</button>
          </div>
        </section>

        <section className={cardClass}>
          <h2 className="text-2xl font-black">Challenge tools</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <Tool href="/profile" title="Character sheet" />
            <Tool href="/tools" title="All tools" />
            <Tool href="/intentions" title="Implementation intentions" />
            <Tool href="/ramadan" title="Ramadan Mode" />
            <Tool href="/partner" title="Accountability partner" />
            <Tool href="/share-card" title="Share card" />
            <Tool href="/why-reset" title="Why reset" />
            <Tool href="/weekly-review" title="Weekly review" />
            <Tool href="/food-photo" title="Food photo log" />
            <Tool href="/limits" title="Monthly limits" />
          </div>
        </section>

        <section className={cardClass}>
          <h2 className="text-2xl font-black">Account</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/dashboard" className="rounded-full bg-slate-950 px-5 py-3 font-black text-white">Back to dashboard</Link>
            <button onClick={logout} className="rounded-full bg-red-100 px-5 py-3 font-black text-red-700">Logout</button>
          </div>
        </section>
      </div>
    </main>
  );
}

function Tool({ href, title }: { href: string; title: string }) {
  return <Link href={href} className="rounded-2xl bg-slate-50 p-4 text-sm font-black text-slate-800 hover:bg-emerald-50 hover:text-emerald-800">{title} →</Link>;
}
