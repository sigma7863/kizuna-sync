import { describe, expect, it } from "vitest";
import { defaultFamilySharingPreferences, getActiveFamilySharingCount, normalizeFamilySharingPreferences } from "../shared/familySharing";

describe("phase 112 family sharing transparency", () => {
  it("uses explicit safe defaults and preserves each opt-in sharing choice", () => {
    expect(normalizeFamilySharingPreferences()).toEqual(defaultFamilySharingPreferences);
    expect(normalizeFamilySharingPreferences({ shareLocation: false, shareCheckIn: false })).toEqual({ shareLocation: false, shareHealth: true, shareCheckIn: false });
    expect(getActiveFamilySharingCount({ shareLocation: false, shareHealth: true, shareCheckIn: false })).toBe(1);
  });
});
