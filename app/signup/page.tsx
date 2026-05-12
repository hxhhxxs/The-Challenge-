"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ensureUserRecord } from "@/lib/supabase/ensure-user-record";
import { cardClass, inputClass, pageBg } from "@/lib/challenge-ui";

function ageFromDob(dob: string) {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", username: "", password: "", confirmPassword: "", dob: "", terms: false });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    setMessage("");
    try {
      const email = form.email.trim().toLowerCase();
      const username = form.username.trim().toLowerCase();
      if (form.name.trim().length < 2) throw new Error("Enter your full name.");
      if (!email.includes("@")) throw new Error("Enter a valid email.");
      if (!/^[a-z0-9_]{3,20}$/.test(username)) throw new Error("Username must be 3–20 lowercase letters, numbers, or underscores.");
      if (!/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password) || form.password.length < 8) throw new Error("Password must be 8+ characters with at least 1 letter and 1 number.");
      if (form.password !== form.confirmPassword) throw new Error("Passwords do not match.");
      if (!form.dob || ageFromDob(form.dob) < 13) throw new Error("You must be at least 13.");
      if (!form.terms) throw new Error("You must agree to the Terms and Privacy Policy.");

      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signUp({ email, password: form.password, options: { data: { name: form.name.trim(), username, dob: form.dob } } });
      if (error) throw error;

      if (data.user && data.session) {
        await ensureUserRecord(data.user);
        router.push("/onboarding");
        return;
      }

      const login = await supabase.auth.signInWithPassword({ email, password: form.password });
      if (login.error) throw login.error;
      if (login.data.user) await ensureUserRecord(login.data.user);
      router.push("/onboarding");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create account.");
    } finally {
      setBusy(false);
    }
  }

  return <main className={pageBg}><section className={`${cardClass} mx-auto max-w-xl`}><p className="text-sm font-bold text-emerald-700">The Challenge</p><h1 className="mt-2 text-4xl font-black">Create Account</h1><p className="mt-2 text-sm text-slate-600">Create your account, then build your challenge plan.</p><div className="mt-6 space-y-4"><input className={inputClass} placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /><input className={inputClass} placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /><input className={inputClass} placeholder="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase() })} /><input className={inputClass} placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /><input className={inputClass} placeholder="Confirm password" type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} /><label className="block"><span className="text-sm font-bold text-slate-700">Date of birth</span><input className={inputClass} type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} /></label><label className="flex gap-2 text-sm font-semibold text-slate-700"><input type="checkbox" checked={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.checked })} /> I agree to the Terms and Privacy Policy</label>{message && <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{message}</p>}<button disabled={busy} onClick={submit} className="w-full rounded-full bg-emerald-600 px-5 py-3 font-black text-white disabled:opacity-50">{busy ? "Creating..." : "Create Account"}</button><p className="text-center text-sm text-slate-600">Already have an account? <Link className="font-black text-emerald-700" href="/login">Log in</Link></p></div></section></main>;
}
