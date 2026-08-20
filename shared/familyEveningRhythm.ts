export const eveningMoodLabels = {
  calm: "ゆったり",
  tired: "つかれた",
  happy: "うれしい",
  anxious: "そわそわ",
  grateful: "ありがとう",
} as const;

export type EveningMood = keyof typeof eveningMoodLabels;

export function getMoodLabel(mood: EveningMood) {
  return eveningMoodLabels[mood];
}

export function countHelpedMemos(entries: Array<{ helperNote: string }>) {
  return entries.filter((entry) => entry.helperNote.trim().length > 0).length;
}
