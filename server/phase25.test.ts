import { describe, expect, it } from "vitest";
import { getEncouragementSummary, getEnergyCue, getWishCategoryLabel } from "../shared/familyEncouragement";

describe("phase 25 family encouragement logic", () => {
  it("returns a gentle cue for a self-reported energy level", () => {
    expect(getEnergyCue(1)).toEqual({ label: "充電したい", tone: "rose" });
    expect(getEnergyCue(4).label).toBe("元気");
  });

  it("labels shared wishes in compact cards", () => {
    expect(getWishCategoryLabel("place")).toBe("行きたい場所");
    expect(getWishCategoryLabel("challenge")).toBe("小さな挑戦");
  });

  it("summarizes family encouragements addressed to the current member", () => {
    expect(getEncouragementSummary([{ recipientUserId: 2 }, { recipientUserId: null }, { recipientUserId: 2 }], 2)).toEqual({ total: 3, addressedToMe: 2 });
  });
});
