import { describe, expect, it } from "vitest";
import { filterCardsByGroup, getDiscoveryGroups, searchFamilyCards, toggleFavoriteCard } from "../shared/familyCardDiscovery";

describe("familyCardDiscovery phase 53", () => {
  it("利用可能なカテゴリを重複なく返し、カテゴリでカードを絞り込む", () => {
    expect(getDiscoveryGroups()).toContain("暮らし");
    expect(filterCardsByGroup(searchFamilyCards(""), "暮らし").every((card) => card.group === "暮らし")).toBe(true);
  });

  it("お気に入りを追加・解除できる", () => {
    expect(toggleFavoriteCard(["card-priority-flow"], "card-packing-checks")).toEqual(["card-packing-checks", "card-priority-flow"]);
    expect(toggleFavoriteCard(["card-priority-flow"], "card-priority-flow")).toEqual([]);
  });
});
