import { describe, expect, it } from "vitest";
import { getDiscoveryRecoveryLabel, normalizeDiscoveryRecoveryVisibility } from "../shared/familyCardDiscovery";

describe("familyCardDiscovery phase 69", () => {
  it("直前の探索目的を短く表現する", () => {
    expect(getDiscoveryRecoveryLabel({ query: "予定", group: "予定", sortMode: "recent", favoritesOnly: false })).toBe("「予定」・予定・最近順");
  });

  it("復帰案内の既定値は表示する", () => {
    expect(normalizeDiscoveryRecoveryVisibility(undefined)).toBe(true);
    expect(normalizeDiscoveryRecoveryVisibility(false)).toBe(false);
  });
});
