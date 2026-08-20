export const tomorrowKindLabels = { plan: "予定", care: "気づかい", fun: "楽しみ" } as const;
export const guideCategoryLabels = { housework: "家事", device: "端末", health: "体調", other: "そのほか" } as const;

export function getMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function getTomorrowRange(now = new Date()) {
  const start = new Date(now); start.setDate(start.getDate() + 1); start.setHours(0, 0, 0, 0);
  const end = new Date(start); end.setHours(23, 59, 59, 999);
  return { start, end };
}
