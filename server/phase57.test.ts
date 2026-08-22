import { describe, expect, it } from "vitest";
import { FAMILY_CARD_DISCOVERY_ITEMS, getUsageSummary, groupDiscoveryCards, recordSearchHistory } from "../shared/familyCardDiscovery";

describe("familyCardDiscovery phase 57", () => {
  it("カード利用状況と検索履歴を集計する", () => {
    expect(getUsageSummary(FAMILY_CARD_DISCOVERY_ITEMS, ["card-next-steps"])).toEqual({ usedCount: 1, unvisitedCount: 8 });
    expect(recordSearchHistory(["予定"], "持ち物")).toEqual(["持ち物", "予定"]);
  });
  it("カードを目的別の群へまとめる", () => {
    expect(groupDiscoveryCards(FAMILY_CARD_DISCOVERY_ITEMS).暮らし).toHaveLength(2);
  });
});
