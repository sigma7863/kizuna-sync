import { describe, expect, it } from "vitest";
import { createDefaultDiscoveryFilters, filterFavoriteCards } from "../shared/familyCardDiscovery";

describe("familyCardDiscovery phase 62", () => {
  it("お気に入りだけへ絞り込める", () => {
    expect(filterFavoriteCards([{ id: "a", title: "A", description: "", group: "予定" }, { id: "b", title: "B", description: "", group: "予定" }], ["b"], true).map((card) => card.id)).toEqual(["b"]);
  });

  it("探索フィルターの初期状態を返す", () => {
    expect(createDefaultDiscoveryFilters()).toEqual({ query: "", group: "すべて", sortMode: "featured", favoritesOnly: false });
  });
});
