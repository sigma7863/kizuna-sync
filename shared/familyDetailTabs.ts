export const familyDetailTabs = [
  "timeline",
  "safety",
  "trail",
  "ai",
  "assistant",
  "celebration",
  "digest",
  "album",
  "stats",
  "automation",
  "health",
] as const;

export type FamilyDetailTab = (typeof familyDetailTabs)[number];

export function normalizeFamilyDetailTab(value: string | null | undefined): FamilyDetailTab | undefined {
  return typeof value === "string" && (familyDetailTabs as readonly string[]).includes(value)
    ? (value as FamilyDetailTab)
    : undefined;
}

export function getInitialFamilyDetailTab(
  requestedTab: string | null | undefined,
  lastOpenedTab: string | null | undefined,
): FamilyDetailTab {
  return normalizeFamilyDetailTab(requestedTab) ?? normalizeFamilyDetailTab(lastOpenedTab) ?? "timeline";
}

export function createFamilyDetailTabPath(familyGroupId: number, tab: FamilyDetailTab): string {
  return `/family/${familyGroupId}?tab=${tab}`;
}

export function getFamilyDetailTabStorageKey(familyGroupId: number) {
  return `kizuna-sync-last-family-detail-tab:${familyGroupId}`;
}

export function getFamilyDetailTabRecentsStorageKey(familyGroupId: number) {
  return `kizuna-sync-family-detail-tab-recents-${familyGroupId}`;
}

export function getFamilyDetailTabPinsStorageKey(familyGroupId: number) {
  return `kizuna-sync-family-detail-tab-pins-${familyGroupId}`;
}

export type FamilyDetailTabMove = "next" | "previous" | "first" | "last";

export function getMovedFamilyDetailTab(currentTab: FamilyDetailTab, move: FamilyDetailTabMove): FamilyDetailTab {
  const currentIndex = familyDetailTabs.indexOf(currentTab);

  if (move === "first") return familyDetailTabs[0];
  if (move === "last") return familyDetailTabs[familyDetailTabs.length - 1];
  if (move === "next") return familyDetailTabs[(currentIndex + 1) % familyDetailTabs.length];
  return familyDetailTabs[(currentIndex - 1 + familyDetailTabs.length) % familyDetailTabs.length];
}

export function getFamilyNavigationScrollBehavior(prefersReducedMotion: boolean): "smooth" | "auto" {
  return prefersReducedMotion ? "auto" : "smooth";
}

export function getFamilyDetailTabPosition(tab: FamilyDetailTab) {
  return { current: familyDetailTabs.indexOf(tab) + 1, total: familyDetailTabs.length };
}

export function normalizeRecentFamilyDetailTabs(value: unknown): FamilyDetailTab[] {
  if (!Array.isArray(value)) return [];
  return value.reduce<FamilyDetailTab[]>((tabs, candidate) => {
    const tab = normalizeFamilyDetailTab(candidate);
    return tab && !tabs.includes(tab) ? [...tabs, tab] : tabs;
  }, []).slice(0, 3);
}

export function recordRecentFamilyDetailTab(existing: unknown, tab: FamilyDetailTab) {
  return [tab, ...normalizeRecentFamilyDetailTabs(existing).filter((candidate) => candidate !== tab)].slice(0, 3);
}

export function normalizePinnedFamilyDetailTabs(value: unknown): FamilyDetailTab[] {
  if (!Array.isArray(value)) return [];
  return value.reduce<FamilyDetailTab[]>((tabs, candidate) => {
    const tab = normalizeFamilyDetailTab(candidate);
    return tab && !tabs.includes(tab) ? [...tabs, tab] : tabs;
  }, []).slice(0, 5);
}

export function togglePinnedFamilyDetailTab(existing: unknown, tab: FamilyDetailTab) {
  const pins = normalizePinnedFamilyDetailTabs(existing);
  return pins.includes(tab) ? pins.filter((candidate) => candidate !== tab) : [...pins, tab].slice(0, 5);
}

export const familyDetailTabSearchTerms: Record<FamilyDetailTab, readonly string[]> = {
  timeline: ["timeline", "mood", "message", "タイムライン", "気分", "投稿"],
  safety: ["safety", "location", "安心", "見守り", "位置"],
  trail: ["trail", "route", "history", "移動", "経路", "履歴"],
  ai: ["ai", "proposal", "suggestion", "提案", "アイデア"],
  assistant: ["assistant", "schedule", "予定", "相談", "アシスタント"],
  celebration: ["celebration", "anniversary", "お祝い", "記念日"],
  digest: ["digest", "summary", "振り返り", "ダイジェスト"],
  album: ["album", "photo", "写真", "思い出"],
  stats: ["stats", "trend", "統計", "傾向"],
  automation: ["automation", "weekly", "自動", "週間"],
  health: ["health", "wellbeing", "健康", "ヘルス"],
};

export function filterFamilyDetailTabs(query: string, labels: Record<FamilyDetailTab, string>): FamilyDetailTab[] {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  if (!normalizedQuery) return familyDetailTabs.slice();
  return familyDetailTabs.filter((tab) => [labels[tab], ...familyDetailTabSearchTerms[tab]]
    .some((term) => term.toLocaleLowerCase().includes(normalizedQuery)));
}

export function getRecommendedFamilyDetailTabs(role: "guardian" | "child" | "elderly"): FamilyDetailTab[] {
  if (role === "guardian") return ["safety", "assistant", "stats"];
  if (role === "child") return ["timeline", "celebration", "album"];
  return ["assistant", "safety", "health"];
}

export function getFamilyDetailRecommendationStorageKey(familyGroupId: number, role: "guardian" | "child" | "elderly") {
  return `kizuna-sync-family-detail-recommendations-${familyGroupId}-${role}`;
}

export function normalizeRecommendedFamilyDetailTabs(value: unknown): FamilyDetailTab[] {
  if (!Array.isArray(value)) return [];
  return value.reduce<FamilyDetailTab[]>((tabs, candidate) => {
    const tab = normalizeFamilyDetailTab(candidate);
    return tab && !tabs.includes(tab) ? [...tabs, tab] : tabs;
  }, []).slice(0, 3);
}

export function toggleRecommendedFamilyDetailTab(existing: unknown, tab: FamilyDetailTab): FamilyDetailTab[] {
  const recommendations = normalizeRecommendedFamilyDetailTabs(existing);
  return recommendations.includes(tab)
    ? recommendations.filter((candidate) => candidate !== tab)
    : [...recommendations, tab].slice(0, 3);
}

export function createFamilyDetailRecommendationSharePath(familyGroupId: number, recommendations: readonly FamilyDetailTab[]): string {
  return createFamilyDetailTabPath(familyGroupId, recommendations[0] ?? "timeline");
}

export function getFamilyDetailSafetyTabs(): FamilyDetailTab[] {
  return ["safety", "health", "assistant"];
}

export type FamilyDetailDayPeriod = "morning" | "daytime" | "evening";

export function getFamilyDetailDayPeriod(hour: number): FamilyDetailDayPeriod {
  if (hour >= 5 && hour < 11) return "morning";
  if (hour >= 11 && hour < 18) return "daytime";
  return "evening";
}

export function getFamilyDetailDailyRhythmTabs(period: FamilyDetailDayPeriod): FamilyDetailTab[] {
  if (period === "morning") return ["safety", "assistant", "timeline"];
  if (period === "daytime") return ["trail", "health", "assistant"];
  return ["digest", "album", "celebration"];
}
