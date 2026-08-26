export type Theme = "light" | "dark";
export type ThemeMode = Theme | "system";

export function normalizeThemeMode(value: string | null | undefined, fallback: ThemeMode = "system"): ThemeMode {
  return value === "light" || value === "dark" || value === "system" ? value : fallback;
}

export function resolveThemeMode(mode: ThemeMode, systemPrefersDark: boolean): Theme {
  return mode === "system" ? (systemPrefersDark ? "dark" : "light") : mode;
}
