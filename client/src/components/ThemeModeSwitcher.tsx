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
  return (
    <label title={`表示テーマ: ${selected.label}`} className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-pink-100 bg-white/80 text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-100">
      <Icon className="h-4 w-4 text-pink-500" aria-hidden="true" />
      <span className="sr-only">表示テーマ: {selected.label}</span>
      <select
        aria-label="表示テーマ"
        value={mode}
        onChange={(event) => setMode(event.target.value as ThemeMode)}
        className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
      >
        {themeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}
