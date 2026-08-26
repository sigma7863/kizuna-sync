import { describe, expect, it } from "vitest";
import { FAMILY_REALTIME_SOCKET_OPTIONS } from "../shared/familyRealtime";
import { getActiveFamilySharingCount, normalizeFamilySharingPreferences } from "../shared/familySharing";
import { isFamilyVoiceMemoDurationValid, parseFamilyVoiceMemoDataUrl } from "../shared/familyVoiceMemo";

describe("phase 129 trusted sharing state contracts", () => {
  it("preserves an explicit opt-out while defaulting only omitted privacy fields", () => {
    const preferences = normalizeFamilySharingPreferences({ shareLocation: false, shareCheckIn: false });
    expect(preferences).toEqual({ shareLocation: false, shareHealth: true, shareCheckIn: false });
    expect(getActiveFamilySharingCount(preferences)).toBe(1);
  });

  it("keeps realtime reconnection bounded so the UI can honestly leave live state", () => {
    expect(FAMILY_REALTIME_SOCKET_OPTIONS.reconnection).toBe(true);
    expect(FAMILY_REALTIME_SOCKET_OPTIONS.reconnectionAttempts).toBe(5);
    expect(FAMILY_REALTIME_SOCKET_OPTIONS.timeout).toBe(8_000);
  });

  it("retains a valid recorded audio payload for a safe retry and rejects invalid durations", () => {
    expect(parseFamilyVoiceMemoDataUrl("data:audio/webm;base64,SGVsbG8=", "audio/webm")?.base64).toBe("SGVsbG8=");
    expect(isFamilyVoiceMemoDurationValid(120)).toBe(true);
    expect(isFamilyVoiceMemoDurationValid(601)).toBe(false);
  });
});
