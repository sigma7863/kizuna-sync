import { describe, expect, it } from "vitest";
import { buildFamilyDailySupportSummary } from "../shared/familyDailySupport";

describe("phase 115 role-aware daily support", () => {
  const input = { shoppingItems: [{ isPurchased: false }, { isPurchased: true }], helpRequests: [{ status: "open" as const }, { status: "completed" as const }] };

  it("summarizes unfinished support and completed small achievements without exposing content", () => {
    expect(buildFamilyDailySupportSummary("guardian", input)).toEqual({ openShoppingCount: 1, openHelpCount: 1, completedCount: 2, action: "coordinate" });
    expect(buildFamilyDailySupportSummary("child", input).action).toBe("contribute");
    expect(buildFamilyDailySupportSummary("elderly", input).action).toBe("rest");
  });
});
