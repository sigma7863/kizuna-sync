import { describe, expect, it } from "vitest";
import { createDiscoveryStateSharePath, getSearchAssistSuggestions, normalizeDiscoverySharedState } from "../shared/familyCardDiscovery";

describe("familyCardDiscovery phase 64", () => {
  it("入力語に近い目的やカード名の候補を返す", () => {
    expect(getSearchAssistSuggestions("予")).toContain("予定");
  });

  it("探索状態を共有できるリンクのパスを作る", () => {
    expect(createDiscoveryStateSharePath({ query: "予定", group: "予定", sortMode: "recent", favoritesOnly: true })).toContain("cardFavorites=1");
  });

  it("共有状態を安全な既定値へ正規化する", () => {
    expect(normalizeDiscoverySharedState({ sortMode: "bad", favoritesOnly: "yes" })).toEqual({ query: "", group: "すべて", sortMode: "featured", favoritesOnly: false });
  });
});
