export const wellbeingStateLabels = { good: "元気", slow: "ゆっくり", tired: "つかれ気味", need_space: "静かにしたい" } as const;

export function getMonthKey(date = new Date()) {
  return date.toLocaleDateString("sv-SE", { year: "numeric", month: "2-digit" });
}

export function countSavedGoodFinds(entries: Array<{ isSaved: boolean }>) { return entries.filter((entry) => entry.isSaved).length; }
