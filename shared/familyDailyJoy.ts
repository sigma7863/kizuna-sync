export function getLocalDayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function countDailyJoys(entries: Array<{ joy: string }>) {
  return entries.filter((entry) => entry.joy.trim().length > 0).length;
}
