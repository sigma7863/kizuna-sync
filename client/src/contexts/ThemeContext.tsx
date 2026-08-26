import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { normalizeThemeMode, resolveThemeMode, type Theme, type ThemeMode } from "@shared/themeMode";

export type { Theme, ThemeMode } from "@shared/themeMode";

const THEME_STORAGE_KEY = "kizuna-sync-theme-mode";

function getSystemTheme(): Theme {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveTheme(mode: ThemeMode): Theme {
  return resolveThemeMode(mode, getSystemTheme() === "dark");
}

interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleTheme?: () => void;
  switchable: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeMode;
  switchable?: boolean;
}

export function ThemeProvider({ children, defaultTheme = "system", switchable = false }: ThemeProviderProps) {
  const [mode, updateMode] = useState<ThemeMode>(() => {
    if (!switchable) return defaultTheme;
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return normalizeThemeMode(stored, defaultTheme);
  });
  const [theme, setTheme] = useState<Theme>(() => resolveTheme(switchable ? mode : defaultTheme));
  const setMode = useCallback((nextMode: ThemeMode) => updateMode(nextMode), []);

  useEffect(() => {
    const resolvedTheme = resolveTheme(switchable ? mode : defaultTheme);
    setTheme(resolvedTheme);
    if (switchable) window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  }, [defaultTheme, mode, switchable]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    if (!switchable || mode !== "system" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemThemeChange = (event: MediaQueryListEvent) => setTheme(event.matches ? "dark" : "light");
    mediaQuery.addEventListener("change", onSystemThemeChange);
    return () => mediaQuery.removeEventListener("change", onSystemThemeChange);
  }, [mode, switchable]);

  const toggleTheme = switchable ? () => updateMode((current) => resolveTheme(current) === "light" ? "dark" : "light") : undefined;
  const value = useMemo(() => ({ theme, mode, setMode, toggleTheme, switchable }), [mode, setMode, switchable, theme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
