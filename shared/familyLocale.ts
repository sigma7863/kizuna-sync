import type { Language } from "../client/src/contexts/I18nContext";

const languageLocales: Record<Language, string> = {
  ja: "ja-JP",
  en: "en-US",
  zh: "zh-CN",
  ko: "ko-KR",
};

export function getFamilyLocale(language: Language) {
  return languageLocales[language];
}

export function formatFamilyTime(value: Date | string | number, language: Language) {
  return new Intl.DateTimeFormat(getFamilyLocale(language), {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatFamilyDateTime(value: Date | string | number, language: Language) {
  return new Intl.DateTimeFormat(getFamilyLocale(language), {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}
