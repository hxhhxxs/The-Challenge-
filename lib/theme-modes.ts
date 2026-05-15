export type AppThemeMode =
  | "fire"
  | "magma"
  | "earth"
  | "life"
  | "light"
  | "order"
  | "water"
  | "ice"
  | "air"
  | "death"
  | "darkness"
  | "chaos";

export type ThemeMode = {
  id: AppThemeMode;
  name: string;
  arabicName?: string;
  description: string;
  preview: string;
};

export const appThemeModes: ThemeMode[] = [
  { id: "fire", name: "Fire", arabicName: "نار", description: "Red power mode for intensity and urgency.", preview: "from-red-200 via-red-100 to-rose-100" },
  { id: "magma", name: "Magma", arabicName: "صهارة", description: "Vermillion heat with a focused, volcanic feel.", preview: "from-orange-300 via-red-200 to-red-100" },
  { id: "earth", name: "Earth", arabicName: "أرض", description: "Orange clay and grounded energy.", preview: "from-orange-200 via-amber-100 to-stone-100" },
  { id: "life", name: "Life", arabicName: "حياة", description: "Amber warmth for steady growth.", preview: "from-amber-200 via-yellow-100 to-lime-100" },
  { id: "light", name: "Light", arabicName: "نور", description: "Yellow brightness for clarity and optimism.", preview: "from-yellow-200 via-yellow-50 to-white" },
  { id: "order", name: "Order", arabicName: "نظام", description: "Chartreuse discipline and structured focus.", preview: "from-lime-200 via-lime-100 to-green-50" },
  { id: "water", name: "Water", arabicName: "ماء", description: "Green calm, balance, and renewal.", preview: "from-green-200 via-emerald-100 to-teal-50" },
  { id: "ice", name: "Ice", arabicName: "جليد", description: "Cyan clarity and clean focus.", preview: "from-cyan-200 via-sky-100 to-white" },
  { id: "air", name: "Air", arabicName: "هواء", description: "Blue spaciousness and light mental clarity.", preview: "from-blue-200 via-sky-100 to-indigo-50" },
  { id: "death", name: "Death", arabicName: "فناء", description: "Ultramarine reflection and seriousness.", preview: "from-blue-950 via-indigo-900 to-blue-700" },
  { id: "darkness", name: "Darkness", arabicName: "ظلام", description: "Purple night mode with deep spiritual focus.", preview: "from-purple-950 via-violet-900 to-purple-700" },
  { id: "chaos", name: "Chaos", arabicName: "فوضى", description: "Magenta creative energy and bold momentum.", preview: "from-fuchsia-300 via-pink-200 to-purple-100" },
];

export function isAppThemeMode(value: string | null | undefined): value is AppThemeMode {
  return ["fire", "magma", "earth", "life", "light", "order", "water", "ice", "air", "death", "darkness", "chaos"].includes(String(value));
}

export function getThemeMode(value: string | null | undefined): AppThemeMode {
  return isAppThemeMode(value) ? value : "water";
}
