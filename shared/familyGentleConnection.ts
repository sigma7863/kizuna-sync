export const talkTimingLabels = { available: "今なら話せる", later: "あとで話したい", quiet: "静かに過ごしたい" } as const;
export const bookmarkSourceLabels = { photo: "写真", post: "投稿", other: "そのほか" } as const;

export function getMondayKey(date = new Date()) {
  const value = new Date(date); const day = value.getDay(); const offset = day === 0 ? -6 : 1 - day;
  value.setDate(value.getDate() + offset); value.setHours(0, 0, 0, 0);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}

export function countCompletedPromises(entries: Array<{ isCompleted: boolean }>) {
  return entries.filter((entry) => entry.isCompleted).length;
}
