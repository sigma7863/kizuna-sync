export type LearningSourceType = "book" | "school" | "work" | "other";

const learningSourceLabels: Record<LearningSourceType, string> = {
  book: "本から",
  school: "学校から",
  work: "仕事から",
  other: "くらしから",
};

export function normalizeRouteHighlights(input: string, limit = 4): string[] {
  return Array.from(new Set(input.split(/[、,，\n]/).map((item) => item.trim()).filter(Boolean))).slice(0, limit);
}

export function formatWalkRouteEstimate(distanceKm: string | number, durationMin: number): string {
  const distance = Number(distanceKm);
  const distanceLabel = Number.isFinite(distance) ? `${distance.toFixed(1)} km` : "距離未設定";
  return `${distanceLabel}・約${Math.max(1, Math.round(durationMin))}分`;
}

export function getLearningSourceLabel(sourceType: LearningSourceType): string {
  return learningSourceLabels[sourceType];
}
