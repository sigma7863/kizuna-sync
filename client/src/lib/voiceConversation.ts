import type { Language } from "@/contexts/I18nContext";

export type VoiceTurnStatus = "ready" | "listening" | "transcribing" | "thinking" | "speaking";

export function speechLanguageFor(language: Language) {
  const languages: Record<Language, string> = {
    ja: "ja-JP",
    en: "en-US",
    zh: "zh-CN",
    ko: "ko-KR",
  };
  return languages[language];
}
