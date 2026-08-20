export type WeatherKind = "sunny" | "cloudy" | "rainy" | "cold" | "hot" | "other";

const weatherLabels: Record<WeatherKind, string> = { sunny: "晴れ", cloudy: "くもり", rainy: "雨", cold: "寒い", hot: "暑い", other: "そのほか" };

export function getWeatherLabel(weather: WeatherKind): string { return weatherLabels[weather]; }
export function getWeatherPackingHint(weather: WeatherKind): string {
  return { sunny: "帽子や水分", cloudy: "羽織りもの", rainy: "傘やタオル", cold: "あたたかい上着", hot: "水分と日よけ", other: "その日の様子に合わせて" }[weather];
}
export function getReadingRelaySummary(entries: Array<{ pageCount: number | null }>) { return { entries: entries.length, pages: entries.reduce((total, entry) => total + (entry.pageCount ?? 0), 0) }; }
