import { describe, expect, it } from "vitest";
import { orderCardsByRecent, recordRecentCard, searchFamilyCards } from "../shared/familyCardDiscovery";

describe("familyCardDiscovery", () => {
  it("タイトル・説明・グループ名からカードを検索できる", () => {
    expect(searchFamilyCards("持ち物").map((card) => card.id)).toEqual(["card-packing-checks"]);
    expect(searchFamilyCards("注目").map((card) => card.id)).toContain("card-priority-flow");
  });

  it("最近使ったカードを重複なく先頭へ記録する", () => {
    expect(recordRecentCard(["b", "a"], "a")).toEqual(["a", "b"]);
  });

  it("カードを最近利用順で並べ替える", () => {
    const cards = searchFamilyCards("予定");
    expect(orderCardsByRecent(cards, ["card-family-notices", "card-place-ideas"])[0].id).toBe("card-family-notices");
  });
});
