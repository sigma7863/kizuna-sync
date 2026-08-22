export const familyFollowUpChoices = ["rest", "water", "contact"] as const;
export type FamilyFollowUpChoice = (typeof familyFollowUpChoices)[number];

export function getFamilyFollowUpStorageKey(familyGroupId: number) {
  return `kizuna-sync-follow-up:${familyGroupId}`;
}

export function isFamilyFollowUpChoice(value: unknown): value is FamilyFollowUpChoice {
  return typeof value === "string" && familyFollowUpChoices.includes(value as FamilyFollowUpChoice);
}
