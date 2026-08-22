import { describe, expect, it } from "vitest";
import { getOfflineRecoveryState, shouldShowOfflineRecovery } from "../shared/offlineRecovery";

describe("phase 119 offline recovery contracts", () => {
  it("prioritizes an offline state above queued or syncing status", () => {
    expect(getOfflineRecoveryState({ isOnline: false, isSyncing: true, pendingCount: 2 })).toBe("offline");
    expect(getOfflineRecoveryState({ isOnline: true, isSyncing: true, pendingCount: 2, conflictCount: 1 })).toBe("conflict");
    expect(getOfflineRecoveryState({ isOnline: true, isSyncing: true, pendingCount: 2 })).toBe("syncing");
    expect(getOfflineRecoveryState({ isOnline: true, isSyncing: false, pendingCount: 2 })).toBe("pending");
  });

  it("keeps meaningful recovery information visible but dismisses a settled connection", () => {
    expect(shouldShowOfflineRecovery({ state: "pending", recentlyReconnected: false })).toBe(true);
    expect(shouldShowOfflineRecovery({ state: "synced", recentlyReconnected: true })).toBe(true);
    expect(shouldShowOfflineRecovery({ state: "synced", recentlyReconnected: false })).toBe(false);
  });
});
