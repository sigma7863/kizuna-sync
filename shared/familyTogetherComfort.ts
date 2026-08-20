export const togetherKindLabels = { chore: "家事", hobby: "趣味", other: "そのほか" } as const;
export const comfortColorLabels = { sunny: "晴れやか", soft: "ゆったり", cloudy: "少し気がかり", rainy: "休みたい" } as const;
export const rainyIdeaMoodLabels = { quiet: "ゆっくり", creative: "つくる", active: "からだを動かす" } as const;

export function countJoinResponses(entries: Array<{ response: "join" | "maybe" }>) {
  return entries.filter((entry) => entry.response === "join").length;
}
