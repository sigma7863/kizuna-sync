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
