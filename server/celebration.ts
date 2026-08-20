export type CelebrationOccasion = "birthday" | "achievement" | "welcome" | "thanks" | "encouragement" | "general";

export interface CelebrationStamp {
  emoji: string;
  label: string;
  tone: "pink" | "amber" | "blue" | "green" | "purple";
}

const STAMPS: Record<CelebrationOccasion, CelebrationStamp> = {
  birthday: { emoji: "🎂", label: "Birthday", tone: "pink" },
  achievement: { emoji: "🏆", label: "Achievement", tone: "amber" },
  welcome: { emoji: "🌸", label: "Welcome", tone: "blue" },
  thanks: { emoji: "💐", label: "Thanks", tone: "green" },
  encouragement: { emoji: "🌟", label: "You can do it", tone: "purple" },
  general: { emoji: "🎉", label: "Celebration", tone: "pink" },
};

const KEYWORDS: Record<Exclude<CelebrationOccasion, "general">, string[]> = {
  birthday: ["誕生日", "たんじょうび", "birthday", "생일", "生日"],
  achievement: ["合格", "成功", "達成", "おめでとう", "congrat", "achievement", "축하", "恭喜"],
  welcome: ["ようこそ", "歓迎", "welcome", "환영", "欢迎"],
  thanks: ["ありがとう", "感謝", "thanks", "thank you", "고마워", "谢谢"],
  encouragement: ["がんば", "応援", "ファイト", "good luck", "応援", "힘내", "加油"],
};

export function detectCelebrationOccasion(message: string, requested?: CelebrationOccasion): CelebrationOccasion {
  if (requested && requested !== "general") return requested;
  const normalized = message.toLowerCase();
  for (const [occasion, keywords] of Object.entries(KEYWORDS) as Array<[Exclude<CelebrationOccasion, "general">, string[]]>) {
    if (keywords.some((keyword) => normalized.includes(keyword.toLowerCase()))) return occasion;
  }
  return "general";
}

export function getCelebrationStamp(occasion: CelebrationOccasion): CelebrationStamp {
  return STAMPS[occasion] ?? STAMPS.general;
}

export function buildCelebrationMetadata(message: string, requested?: CelebrationOccasion) {
  const occasion = detectCelebrationOccasion(message, requested);
  const stamp = getCelebrationStamp(occasion);
  return {
    isCelebration: true,
    occasion,
    stamp: stamp.emoji,
    stampLabel: stamp.label,
    tone: stamp.tone,
  } as const;
}
