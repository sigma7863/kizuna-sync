import { describe, expect, it } from "vitest";
import { getDailyDiscoveryPick, getDiscoveryStateSummary, normalizeDailySuggestionVisibility } from "../shared/familyCardDiscovery";

describe("familyCardDiscovery phase 65", () => {
  it("未確認のお気に入りを今日の一枚として優先する", () => {
    const pick = getDailyDiscoveryPick([], ["b"], [{ id: "a", title: "A", description: "", group: "予定" }, { id: "b", title: "B", description: "", group: "予定" }]);
    expect(pick?.id).toBe("b");
  });

  it("現在の探索状態を短く要約する", () => {
    expect(getDiscoveryStateSummary(12, 3, { query: "予定", group: "予定", favoritesOnly: false })).toContain("3/12");
  });

  it("日々の提案表示の既定値はオンにする", () => {
    expect(normalizeDailySuggestionVisibility(undefined)).toBe(true);
    expect(normalizeDailySuggestionVisibility(false)).toBe(false);
  });
});
