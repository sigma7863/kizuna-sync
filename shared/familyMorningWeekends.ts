export function countOpenQuestions(entries: Array<{ isOpened: boolean }>) {
  return entries.filter((entry) => !entry.isOpened).length;
}

export function getNextWeekendDate(now = new Date()) {
  const date = new Date(now); const day = date.getDay(); const daysUntilSaturday = day === 6 ? 0 : 6 - day;
  date.setDate(date.getDate() + daysUntilSaturday); date.setHours(16, 0, 0, 0);
  return date;
}
