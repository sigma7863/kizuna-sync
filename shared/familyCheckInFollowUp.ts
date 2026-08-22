import type { FamilyMemberRole } from "./familyAccessibility";
import type { FamilyCheckInStatus } from "./familyCheckIn";

export type CheckInFollowUpStatus = Exclude<FamilyCheckInStatus, "okay">;

export type CheckInFollowUpTimelineEntry = {
  userId: number;
  metadata: unknown;
};

export type CheckInFollowUpCandidate = {
  userId: number;
  status: CheckInFollowUpStatus;
};

const followUpStatuses = new Set<CheckInFollowUpStatus>(["rest", "available"]);

function getCheckInStatus(metadata: unknown): CheckInFollowUpStatus | null {
  if (!metadata || typeof metadata !== "object") return null;
  const value = metadata as Record<string, unknown>;
  return value.isCheckIn === true && typeof value.status === "string" && followUpStatuses.has(value.status as CheckInFollowUpStatus)
    ? value.status as CheckInFollowUpStatus
    : null;
}

export function getLatestCheckInFollowUp(entries: CheckInFollowUpTimelineEntry[], currentUserId?: number): CheckInFollowUpCandidate | null {
  for (const entry of entries) {
    const status = getCheckInStatus(entry.metadata);
    if (status && entry.userId !== currentUserId) return { userId: entry.userId, status };
  }
  return null;
}

export function getCheckInFollowUpMessageKey(status: CheckInFollowUpStatus, role: FamilyMemberRole):
  | "family.checkInFollowUpRestGuardian"
  | "family.checkInFollowUpRestChild"
  | "family.checkInFollowUpRestElderly"
  | "family.checkInFollowUpAvailableGuardian"
  | "family.checkInFollowUpAvailableChild"
  | "family.checkInFollowUpAvailableElderly" {
  const roleName = role === "guardian" ? "Guardian" : role === "child" ? "Child" : "Elderly";
  return `family.checkInFollowUp${status === "rest" ? "Rest" : "Available"}${roleName}` as ReturnType<typeof getCheckInFollowUpMessageKey>;
}
