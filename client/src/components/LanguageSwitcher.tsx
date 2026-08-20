import { Languages } from "lucide-react";
import { useI18n, type Language } from "@/contexts/I18nContext";

const languageOptions: Array<{ value: Language; label: string }> = [
  { value: "ja", label: "日本語" },
  { value: "en", label: "English" },
  { value: "zh", label: "中文" },
  { value: "ko", label: "한국어" },
];

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n();
  return (
    <label className="inline-flex items-center gap-2 rounded-full border border-pink-100 bg-white/80 px-3 py-1.5 text-xs text-gray-600 shadow-sm">
      <Languages className="h-4 w-4 text-pink-500" aria-hidden="true" />
      <span className="sr-only">{t("common.language")}</span>
      <select
        aria-label={t("common.language")}
        value={language}
        onChange={(event) => setLanguage(event.target.value as Language)}
        className="bg-transparent font-medium outline-none"
      >
        {languageOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
