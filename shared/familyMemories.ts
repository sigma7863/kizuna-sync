export function isFamilyEventPoll(question: string) {
  return question.startsWith("イベント：");
}

export function selectMemoryBookmark<T extends { content: string | null }>(entries: T[]) {
  return entries.find((entry) => entry.content?.includes("ありがとう")) ?? entries[0] ?? null;
}
