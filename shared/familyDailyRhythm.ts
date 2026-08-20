export type TakeHomeCategory = "school" | "work" | "outing" | "other";

const categoryLabels: Record<TakeHomeCategory, string> = {
  school: "学校",
  work: "仕事",
  outing: "外出",
  other: "くらし",
};

export function getMovementBingoProgress(cells: Array<{ isCompleted: boolean }>) {
  const completed = cells.filter((cell) => cell.isCompleted).length;
  return { completed, total: cells.length, isBingo: cells.length >= 3 && completed === cells.length };
}

export function getTakeHomeCategoryLabel(category: TakeHomeCategory): string {
  return categoryLabels[category];
}

export function getDailyMomentCaption(moodSign: string | null | undefined, note: string): string {
  return moodSign ? `${moodSign} · ${note}` : note;
}
