import { familyDetailTabs, normalizeFamilyDetailTab, type FamilyDetailTab } from "./familyDetailTabs";

export type FamilyFeatureLayout = {
  order: FamilyDetailTab[];
  hidden: FamilyDetailTab[];
};

export const defaultFamilyFeatureLayout: FamilyFeatureLayout = {
  order: [...familyDetailTabs],
  hidden: [],
};

export function normalizeFamilyFeatureLayout(value: Partial<FamilyFeatureLayout> | null | undefined): FamilyFeatureLayout {
  const ordered = Array.isArray(value?.order)
    ? value.order.reduce<FamilyDetailTab[]>((tabs, candidate) => {
        const tab = normalizeFamilyDetailTab(candidate);
        return tab && !tabs.includes(tab) ? [...tabs, tab] : tabs;
      }, [])
    : [];
  const order = [...ordered, ...familyDetailTabs.filter((tab) => !ordered.includes(tab))];
  const hidden = Array.isArray(value?.hidden)
    ? value.hidden.reduce<FamilyDetailTab[]>((tabs, candidate) => {
        const tab = normalizeFamilyDetailTab(candidate);
        return tab && !tabs.includes(tab) ? [...tabs, tab] : tabs;
      }, [])
    : [];

  // A family must always retain at least one recoverable entry point.
  return { order, hidden: hidden.length === familyDetailTabs.length ? hidden.filter((tab) => tab !== "timeline") : hidden };
}

export function getVisibleFamilyDetailTabs(layout: Partial<FamilyFeatureLayout> | null | undefined): FamilyDetailTab[] {
  const normalized = normalizeFamilyFeatureLayout(layout);
  return normalized.order.filter((tab) => !normalized.hidden.includes(tab));
}

export function moveFamilyFeature(layout: FamilyFeatureLayout, tab: FamilyDetailTab, direction: "up" | "down"): FamilyFeatureLayout {
  const order = [...layout.order];
  const index = order.indexOf(tab);
  const nextIndex = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || nextIndex < 0 || nextIndex >= order.length) return layout;
  [order[index], order[nextIndex]] = [order[nextIndex], order[index]];
  return { ...layout, order };
}
