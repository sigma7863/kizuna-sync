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
