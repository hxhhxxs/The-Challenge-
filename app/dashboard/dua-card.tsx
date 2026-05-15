import { getDailyDua, type DuaItem } from "@/lib/dua-bank";

export function DailyDuaCard({ date = new Date() }: { date?: Date }) {
  const dua = getDailyDua(date);
  return <DuaCard dua={dua} />;
}

function DuaCard({ dua }: { dua: DuaItem }) {
  return (
    <section className="theme-hero rounded-[2rem] p-6 shadow-xl">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <p className="text-sm font-black theme-gradient-text">Du'a of the Day</p>
          <h2 className="mt-1 text-2xl font-black">{dua.title}</h2>
        </div>
        <span className="theme-pill w-fit rounded-full px-3 py-1 text-xs font-black">{dua.reference}</span>
      </div>
      <div className="theme-border mt-5 rounded-[1.5rem] border bg-white/10 p-5">
        <p dir="rtl" className="text-right text-3xl font-black leading-loose">{dua.arabicText}</p>
      </div>
      <p className="mt-4 text-sm font-semibold leading-7 opacity-80">{dua.transliteration}</p>
      <p className="mt-3 text-lg font-bold leading-8">{dua.translation}</p>
      {dua.note && <p className="theme-pill mt-4 rounded-2xl p-4 text-sm font-bold">{dua.note}</p>}
    </section>
  );
}
