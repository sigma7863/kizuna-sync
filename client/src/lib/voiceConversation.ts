import type { Language } from "@/contexts/I18nContext";

export type VoiceTurnStatus = "ready" | "listening" | "transcribing" | "thinking" | "speaking";
export type VoiceInputErrorKind = "unavailable" | "permission" | "missingDevice" | "recording" | "emptyTranscript";

export const speechRateOptions = [0.8, 1, 1.2] as const;

export function speechLanguageFor(language: Language) {
  const languages: Record<Language, string> = {
    ja: "ja-JP",
    en: "en-US",
    zh: "zh-CN",
    ko: "ko-KR",
  };
  return languages[language];
}

export function normalizeSpeechRate(value: number) {
  return speechRateOptions.reduce((closest, option) => Math.abs(option - value) < Math.abs(closest - value) ? option : closest, 1);
}

export function getVoiceInputErrorKind(error: unknown): VoiceInputErrorKind {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError" || error.name === "SecurityError") return "permission";
    if (error.name === "NotFoundError") return "missingDevice";
  }
  return "recording";
}
