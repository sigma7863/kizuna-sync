export function getWeekStartKey(date = new Date()) { const copy = new Date(date); const day = copy.getDay() || 7; copy.setDate(copy.getDate() - day + 1); copy.setHours(0, 0, 0, 0); return copy.toLocaleDateString("sv-SE"); }
export function countReadyRelays(entries: Array<{ isReady: boolean }>) { return entries.filter((entry) => entry.isReady).length; }
