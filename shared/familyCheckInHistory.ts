import type { FamilyCheckInStatus } from "./familyCheckIn";

export type FamilyCheckInHistoryEntry = {
  userId: number;
  status: FamilyCheckInStatus;
  createdAt: Date;
};

export function getLatestSharedCheckInByUser(entries: FamilyCheckInHistoryEntry[]): Map<number, FamilyCheckInHistoryEntry> {
  return entries.reduce((latest, entry) => {
    const current = latest.get(entry.userId);
    if (!current || entry.createdAt.getTime() > current.createdAt.getTime()) latest.set(entry.userId, entry);
    return latest;
  }, new Map<number, FamilyCheckInHistoryEntry>());
}

export function getCheckInHistoryDisplayLimit(): number {
  return 7;
}
