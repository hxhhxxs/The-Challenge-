import CheckInScoreSafe from "./check-in-score-safe";

export default function CheckInPage() {
  return (
    <>
      <section className="mx-auto max-w-5xl px-4 pt-5">
        <div className="rounded-[2rem] bg-slate-950 p-5 text-white shadow-xl">
          <p className="text-sm font-black text-emerald-300">This Week</p>
          <h2 className="mt-1 text-2xl font-black">Walk 50,000 total steps</h2>
          <p className="mt-1 text-sm font-bold text-slate-300">Use your daily step logs to move this bigger weekly goal.</p>
        </div>
      </section>
      <CheckInScoreSafe />
    </>
  );
}
