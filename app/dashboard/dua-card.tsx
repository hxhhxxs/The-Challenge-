import { getDailyDua, type DuaItem } from "@/lib/dua-bank";

export function DailyDuaCard({ date = new Date() }: { date?: Date }) {
  const dua = getDailyDua(date);
  return <DuaCard dua={dua} />;
}

function DuaCard({ dua }: { dua: DuaItem }) {
  return (
    <section className="rounded-[2rem] bg-emerald-950 p-6 text-white shadow-xl">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <p className="text-sm font-black text-emerald-300">Du'a of the Day</p>
          <h2 className="mt-1 text-2xl font-black">{dua.title}</h2>
        </div>
        <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-black text-emerald-100">{dua.reference}</span>
      </div>
      <p dir="rtl" className="mt-5 text-right text-3xl font-black leading-loose">{dua.arabicText}</p>
      <p className="mt-4 text-sm font-semibold leading-7 text-emerald-100">{dua.transliteration}</p>
      <p className="mt-3 text-lg font-bold leading-8 text-white">{dua.translation}</p>
      {dua.note && <p className="mt-4 rounded-2xl bg-white/10 p-4 text-sm font-bold text-emerald-50">{dua.note}</p>}
    </section>
  );
}
