"use client";

import { useEffect, useState } from "react";
import { getThemeMode, type AppThemeMode } from "@/lib/theme-modes";

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("challenge_theme_mode");
    const theme = getThemeMode(saved);
    document.documentElement.dataset.theme = theme;
    setReady(true);
  }, []);

  useEffect(() => {
    function handleThemeChange(event: Event) {
      const custom = event as CustomEvent<{ theme: AppThemeMode }>;
      const theme = getThemeMode(custom.detail?.theme);
      document.documentElement.dataset.theme = theme;
      window.localStorage.setItem("challenge_theme_mode", theme);
    }
    window.addEventListener("challenge-theme-change", handleThemeChange);
    return () => window.removeEventListener("challenge-theme-change", handleThemeChange);
  }, []);

  return <>{children}</>;
}

export function setChallengeThemeMode(theme: AppThemeMode) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("challenge-theme-change", { detail: { theme } }));
}
