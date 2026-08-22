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

export function getFamilyDetailTabStorageKey(familyGroupId: number): string {
  return `kizuna-sync-last-family-detail-tab:${familyGroupId}`;
}

export type FamilyDetailTabMove = "next" | "previous" | "first" | "last";

export function getMovedFamilyDetailTab(currentTab: FamilyDetailTab, move: FamilyDetailTabMove): FamilyDetailTab {
  const currentIndex = familyDetailTabs.indexOf(currentTab);

  if (move === "first") return familyDetailTabs[0];
  if (move === "last") return familyDetailTabs[familyDetailTabs.length - 1];
  if (move === "next") return familyDetailTabs[(currentIndex + 1) % familyDetailTabs.length];
  return familyDetailTabs[(currentIndex - 1 + familyDetailTabs.length) % familyDetailTabs.length];
}
