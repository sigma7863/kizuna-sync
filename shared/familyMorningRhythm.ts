export type AchievementCategory = "help" | "movement" | "challenge" | "other";

const achievementLabels: Record<AchievementCategory, string> = { help: "お手伝い", movement: "からだ", challenge: "挑戦", other: "その他" };

export function parseMorningItems(input: string, limit = 6): string[] {
  return Array.from(new Set(input.split(/[、,，\n]/).map((item) => item.trim()).filter(Boolean))).slice(0, limit);
}

export function getAchievementCategoryLabel(category: AchievementCategory): string { return achievementLabels[category]; }

export function formatVoiceDuration(seconds: number): string {
  const safeSeconds = Math.max(0, Math.round(seconds));
  return `${Math.floor(safeSeconds / 60)}:${String(safeSeconds % 60).padStart(2, "0")}`;
}
