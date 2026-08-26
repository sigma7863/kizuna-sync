import { Sun, Moon, Laptop } from "lucide-react";
import { useTheme, type ThemeMode } from "@/contexts/ThemeContext";

const themeOptions: Array<{ value: ThemeMode; label: string; Icon: typeof Sun }> = [
  { value: "light", label: "ライト", Icon: Sun },
  { value: "dark", label: "ダーク", Icon: Moon },
  { value: "system", label: "システム", Icon: Laptop },
];

export function ThemeModeSwitcher() {
  const { mode, setMode } = useTheme();
  const selected = themeOptions.find((option) => option.value === mode) ?? themeOptions[2];
  const Icon = selected.Icon;
  const nextMode: ThemeMode = mode === "light" ? "dark" : mode === "dark" ? "system" : "light";
  return (
    <button
      type="button"
      title={`表示テーマ: ${selected.label}。クリックで${themeOptions.find((option) => option.value === nextMode)?.label}へ切替`}
      aria-label={`表示テーマ: ${selected.label}。クリックでテーマを切り替える`}
      aria-pressed={mode === "dark"}
      onClick={() => setMode(nextMode)}
      className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-pink-200 bg-white/90 text-slate-800 shadow-sm transition-colors hover:bg-pink-50 dark:border-slate-500 dark:bg-slate-800 dark:text-slate-50 dark:hover:bg-slate-700"
    >
      <Icon className="h-4 w-4 text-pink-500" aria-hidden="true" />
      <span className="sr-only">表示テーマ: {selected.label}</span>
    </button>
  );
}
