export const moodResetKindLabels = { breath: "深呼吸", music: "音楽", move: "少し動く", rest: "休む" } as const;
export const outingCharmKindLabels = { item: "持ち物", caution: "気をつけること", cheer: "応援" } as const;

export function countUnreceivedThanks(entries: Array<{ isReceived: boolean }>) {
  return entries.filter((entry) => !entry.isReceived).length;
}
