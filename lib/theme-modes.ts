export type AppThemeMode = "light" | "dark" | "earth" | "ocean" | "fire" | "night";

export type ThemeMode = {
  id: AppThemeMode;
  name: string;
  arabicName?: string;
  description: string;
  preview: string;
};

export const appThemeModes: ThemeMode[] = [
  { id: "light", name: "Light", arabicName: "نور", description: "Clean cream and emerald. Best for daytime use.", preview: "from-emerald-100 via-white to-amber-50" },
  { id: "dark", name: "Dark", arabicName: "ليل", description: "Deep slate with soft emerald accents.", preview: "from-slate-950 via-slate-900 to-emerald-950" },
  { id: "earth", name: "Earth", arabicName: "أرض", description: "Warm sand, olive, and calm natural tones.", preview: "from-stone-200 via-amber-100 to-lime-100" },
  { id: "ocean", name: "Ocean", arabicName: "بحر", description: "Blue-green focus mode with a peaceful feel.", preview: "from-cyan-100 via-sky-100 to-emerald-100" },
  { id: "fire", name: "Fire", arabicName: "همّة", description: "High-energy amber and rose for motivation.", preview: "from-orange-100 via-amber-100 to-rose-100" },
  { id: "night", name: "Night Sky", arabicName: "سماء", description: "Spiritual night mode with indigo and emerald glow.", preview: "from-indigo-950 via-slate-950 to-emerald-950" },
];

export function isAppThemeMode(value: string | null | undefined): value is AppThemeMode {
  return ["light", "dark", "earth", "ocean", "fire", "night"].includes(String(value));
}

export function getThemeMode(value: string | null | undefined): AppThemeMode {
  return isAppThemeMode(value) ? value : "light";
}
