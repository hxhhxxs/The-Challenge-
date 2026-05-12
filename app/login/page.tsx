"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureUserRecord } from "@/lib/supabase/ensure-user-record";
import { cardClass, inputClass, pageBg } from "@/lib/challenge-ui";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setMessage("");
    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email: form.email.trim().toLowerCase(), password: form.password });
      if (error) throw new Error("Wrong email or password.");
      if (!data.user) throw new Error("Wrong email or password.");
      const record = await ensureUserRecord(data.user);
      router.push(record.onboarding_complete ? "/dashboard" : "/onboarding");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Wrong email or password.");
    } finally {
      setBusy(false);
    }
  }

  return <main className={pageBg}><section className={`${cardClass} mx-auto max-w-xl`}><p className="text-sm font-bold text-emerald-700">The Challenge</p><h1 className="mt-2 text-4xl font-black">Log in</h1><div className="mt-6 space-y-4"><input className={inputClass} placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /><input className={inputClass} placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /><label className="flex gap-2 text-sm font-semibold text-slate-700"><input type="checkbox" checked={form.remember} onChange={(e) => setForm({ ...form, remember: e.target.checked })} /> Remember me</label>{message && <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{message}</p>}<button disabled={busy} onClick={submit} className="w-full rounded-full bg-emerald-600 px-5 py-3 font-black text-white disabled:opacity-50">{busy ? "Logging in..." : "Log in"}</button><div className="flex justify-between text-sm"><Link className="font-bold text-slate-500" href="/forgot-password">Forgot password?</Link><Link className="font-black text-emerald-700" href="/signup">Create an account</Link></div></div></section></main>;
}
