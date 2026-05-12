"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cardClass, inputClass, pageBg } from "@/lib/challenge-ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function sendReset() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
    setMessage("If an account exists for that email, we sent a link.");
  }

  return <main className={pageBg}><section className={`${cardClass} mx-auto max-w-xl`}><h1 className="text-4xl font-black">Reset password</h1><p className="mt-2 text-sm text-slate-600">Enter your email and we’ll send a reset link if the account exists.</p><div className="mt-6 space-y-4"><input className={inputClass} placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />{message && <p className="rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800">{message}</p>}<button onClick={sendReset} className="w-full rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Send reset link</button></div></section></main>;
}
