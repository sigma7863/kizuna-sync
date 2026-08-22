import { describe, expect, it } from "vitest";
import { createCardSharePath, createDailyCardDigest, FAMILY_CARD_DISCOVERY_ITEMS } from "../shared/familyCardDiscovery";

describe("familyCardDiscovery phase 54", () => {
  it("注目・お気に入り・最近のカードを重複なく今日の整理へ集める", () => {
    const priority = FAMILY_CARD_DISCOVERY_ITEMS.find((card) => card.id === "card-priority-flow")!;
    const packing = FAMILY_CARD_DISCOVERY_ITEMS.find((card) => card.id === "card-packing-checks")!;
    expect(createDailyCardDigest([priority], [priority, packing], []).map((card) => card.id)).toEqual(["card-priority-flow", "card-packing-checks"]);
  });

  it("カードへの共有パスを生成する", () => {
    expect(createCardSharePath("card-next-steps")).toBe("#card-next-steps");
  });
});
