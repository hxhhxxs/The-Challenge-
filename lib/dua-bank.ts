import { extendedDuaBank } from "./extended-dua-bank";

export type DuaItem = {
  id: string;
  title: string;
  arabicText: string;
  transliteration: string;
  translation: string;
  reference: string;
  note?: string;
  themes: string[];
};

export const duaBank: DuaItem[] = extendedDuaBank;

function dayOfYear(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86400000);
}

export function getDailyDua(date = new Date()) {
  return duaBank[dayOfYear(date) % duaBank.length];
}
