export type FamilyCheckInStatus = "okay" | "rest" | "available";

export const familyCheckInStatuses: FamilyCheckInStatus[] = ["okay", "rest", "available"];

export function composeFamilyCheckInNote(status: FamilyCheckInStatus, statusLabel: string, note: string): string | undefined {
  const parts = [statusLabel.trim(), note.trim()].filter(Boolean);
  return parts.length ? parts.join(" — ") : undefined;
}
