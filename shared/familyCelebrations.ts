export function formatWordBatonContent(content: string) {
  return `今日のよかったこと：${content.trim()}`;
}

export function isUpcomingCelebration(date: Date, now = new Date()) {
  return date.getTime() >= now.getTime();
}
