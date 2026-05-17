"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="theme-page-bg flex min-h-screen items-center justify-center px-5 py-16">
      <section className="theme-card max-w-xl rounded-[2rem] p-8 text-center shadow-xl">
        <p className="text-sm font-black theme-action-text">Something broke</p>
        <h1 className="mt-2 text-4xl font-black">We hit a temporary issue.</h1>
        <p className="mt-3 text-base font-semibold opacity-75">
          Refresh this page or try again. Your saved challenge data should remain safe.
        </p>
        {error?.digest && <p className="mt-3 rounded-2xl bg-slate-100 p-3 text-xs font-bold opacity-70">Error ID: {error.digest}</p>}
        <button onClick={reset} className="mt-6 rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Try again</button>
      </section>
    </main>
  );
}
