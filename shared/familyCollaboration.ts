export function parseFamilyStrengths(input: string, limit = 8): string[] {
  return Array.from(new Set(input.split(/[、,，\n]/).map((skill) => skill.trim()).filter(Boolean))).slice(0, limit);
}

export function filterBookshelfByTheme<T extends { theme: string }>(items: T[], theme: string): T[] {
  return theme === "すべて" ? items : items.filter((item) => item.theme === theme);
}

export function getOutingChecklistProgress(items: Array<{ isCompleted: boolean }>) {
  const completed = items.filter((item) => item.isCompleted).length;
  return { completed, total: items.length, isReady: items.length > 0 && completed === items.length };
}
