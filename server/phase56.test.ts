import { describe, expect, it } from "vitest";
import { getCardHint, getNewCardIds, sortDiscoveryCards, FAMILY_CARD_DISCOVERY_ITEMS } from "../shared/familyCardDiscovery";

describe("familyCardDiscovery phase 56", () => {
  it("カード利用ヒントと新着カードを取得できる", () => {
    expect(getCardHint(FAMILY_CARD_DISCOVERY_ITEMS[0])).toContain("小さな役割バトン");
    expect(getNewCardIds()).toEqual(["card-household-tips", "card-packing-checks", "card-together-picks"]);
  });
  it("注目・タイトル・最近利用順に整列できる", () => {
    expect(sortDiscoveryCards(FAMILY_CARD_DISCOVERY_ITEMS, "featured")[0].featured).toBe(true);
    expect(sortDiscoveryCards(FAMILY_CARD_DISCOVERY_ITEMS.slice(0, 2), "recent", ["card-place-ideas"])[0].id).toBe("card-place-ideas");
  });
});
