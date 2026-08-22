import { describe, expect, it } from "vitest";
import { getEncouragementSummary, getEnergyCue, getLatestEnergyStatuses, getWishCategoryLabel } from "../shared/familyEncouragement";

describe("phase 25 family encouragement logic", () => {
  it("returns a gentle cue for a self-reported energy level", () => {
    expect(getEnergyCue(1)).toEqual({ label: "充電したい", tone: "rose" });
    expect(getEnergyCue(4).label).toBe("元気");
  });

  it("keeps the newest energy status for each family member", () => {
    const latest = getLatestEnergyStatuses([
      { userId: 1, energyLevel: 2 },
      { userId: 2, energyLevel: 5 },
      { userId: 1, energyLevel: 4 },
    ]);
    expect(latest.get(1)?.energyLevel).toBe(2);
    expect(latest.get(2)?.energyLevel).toBe(5);
  });

  it("labels shared wishes in compact cards", () => {
    expect(getWishCategoryLabel("place")).toBe("行きたい場所");
    expect(getWishCategoryLabel("challenge")).toBe("小さな挑戦");
  });

  it("summarizes family encouragements addressed to the current member", () => {
    expect(getEncouragementSummary([{ recipientUserId: 2 }, { recipientUserId: null }, { recipientUserId: 2 }], 2)).toEqual({ total: 3, addressedToMe: 2 });
  });
});
