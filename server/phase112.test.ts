import { describe, expect, it } from "vitest";
import { defaultFamilySharingPreferences, getActiveFamilySharingCount, normalizeFamilySharingPreferences } from "../shared/familySharing";
import { getCheckInHistoryDisplayLimit, getLatestSharedCheckInByUser } from "../shared/familyCheckInHistory";

describe("phase 112 family sharing transparency", () => {
  it("uses explicit safe defaults and preserves each opt-in sharing choice", () => {
    expect(normalizeFamilySharingPreferences()).toEqual(defaultFamilySharingPreferences);
    expect(normalizeFamilySharingPreferences({ shareLocation: false, shareCheckIn: false })).toEqual({ shareLocation: false, shareHealth: true, shareCheckIn: false });
    expect(getActiveFamilySharingCount({ shareLocation: false, shareHealth: true, shareCheckIn: false })).toBe(1);
  });

  it("keeps only the latest note-free shared status per family member and limits the personal view", () => {
    const latest = getLatestSharedCheckInByUser([
      { userId: 3, status: "okay", createdAt: new Date("2026-08-21T08:00:00Z") },
      { userId: 3, status: "rest", createdAt: new Date("2026-08-21T10:00:00Z") },
      { userId: 9, status: "available", createdAt: new Date("2026-08-21T09:00:00Z") },
    ]);
    expect(latest.get(3)?.status).toBe("rest");
    expect(latest.get(9)?.status).toBe("available");
    expect(getCheckInHistoryDisplayLimit()).toBe(7);
  });
});
