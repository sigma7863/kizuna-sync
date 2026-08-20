export const tableTopicToneLabels = { laugh: "わらう", share: "知る", think: "考える" } as const;

export function countOpenConversationMoments(entries: Array<{ isFollowedUp?: boolean; isDiscussed?: boolean }>) {
  return entries.filter((entry) => !(entry.isFollowedUp ?? entry.isDiscussed ?? false)).length;
}
