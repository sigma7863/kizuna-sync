export function normalizeFamilyText(value: string) {
  return value.trim().replace(/\s{2,}/g, " ");
}

export function isWithinFamilyTextLimit(value: string, maxLength: number) {
  const normalized = normalizeFamilyText(value);
  return normalized.length > 0 && normalized.length <= maxLength;
}

export type HighPriorityFamilyAction = "checkIn" | "invite" | "sharingPreferences";

export const highPriorityAuditPolicy: Record<HighPriorityFamilyAction, readonly string[]> = {
  checkIn: ["familyGroupId", "actorUserId", "status", "createdAt"],
  invite: ["familyGroupId", "actorUserId", "recipientRole", "createdAt"],
  sharingPreferences: ["familyGroupId", "actorUserId", "changedFields", "createdAt"],
};
