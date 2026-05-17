import Link from "next/link";

export default function NotFound() {
  return (
    <main className="theme-page-bg flex min-h-screen items-center justify-center px-5 py-16">
      <section className="theme-card max-w-xl rounded-[2rem] p-8 text-center shadow-xl">
        <p className="text-sm font-black theme-action-text">404</p>
        <h1 className="mt-2 text-4xl font-black">This page does not exist.</h1>
        <p className="mt-3 text-base font-semibold opacity-75">
          The path may have changed, or the page may have been moved while The Challenge is being improved.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/dashboard" className="rounded-full bg-emerald-600 px-5 py-3 font-black text-white">Go Home</Link>
          <Link href="/learning" className="rounded-full bg-slate-100 px-5 py-3 font-black text-slate-800">Open Library</Link>
        </div>
      </section>
    </main>
  );
}
