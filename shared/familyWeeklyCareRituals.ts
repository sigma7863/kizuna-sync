export const tinyBadgeKindLabels = { kindness: "やさしさ", effort: "がんばり", bravery: "勇気", care: "気づかい" } as const;
export const bedtimePreparationKindLabels = { bag: "かばん", clothes: "服", plan: "予定", care: "いたわり" } as const;

export function getMondayWeekKey(date = new Date()) {
  const copy = new Date(date); const day = copy.getDay() || 7; copy.setDate(copy.getDate() - day + 1); copy.setHours(0, 0, 0, 0); return copy.toLocaleDateString("sv-SE");
}
