export type EnergyLevel = 1 | 2 | 3 | 4 | 5;
export type WishCategory = "place" | "activity" | "challenge" | "other";

const energyCues: Record<EnergyLevel, { label: string; tone: string }> = {
  1: { label: "充電したい", tone: "rose" },
  2: { label: "ゆっくりめ", tone: "amber" },
  3: { label: "ふつう", tone: "sky" },
  4: { label: "元気", tone: "emerald" },
  5: { label: "เต็มタン", tone: "violet" },
};

const wishLabels: Record<WishCategory, string> = { place: "行きたい場所", activity: "やってみたいこと", challenge: "小さな挑戦", other: "そのほか" };

export function getEnergyCue(level: EnergyLevel) { return energyCues[level]; }
export function getWishCategoryLabel(category: WishCategory) { return wishLabels[category]; }
export function getEncouragementSummary(posts: Array<{ recipientUserId: number | null }>, userId: number) { return { total: posts.length, addressedToMe: posts.filter((post) => post.recipientUserId === userId).length }; }

export function getLatestEnergyStatuses<T extends { userId: number }>(statuses: readonly T[]): Map<number, T> {
  return statuses.reduce((latestByUser, status) => {
    if (!latestByUser.has(status.userId)) latestByUser.set(status.userId, status);
    return latestByUser;
  }, new Map<number, T>());
}
