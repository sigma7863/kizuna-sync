import { describe, expect, it } from "vitest";
import { getDiscoverySceneShortcuts, getRelatedDiscoveryCards, normalizeSceneSuggestionVisibility } from "../shared/familyCardDiscovery";

describe("familyCardDiscovery phase 66", () => {
  it("使える生活シーン別ショートカットを返す", () => {
    expect(getDiscoverySceneShortcuts().map((item) => item.label)).toContain("朝の準備");
  });

  it("最後に開いたカードと同じ目的のカードを提案する", () => {
    expect(getRelatedDiscoveryCards("card-place-ideas").map((card) => card.id)).toContain("card-family-notices");
  });

  it("シーン提案の既定値は表示する", () => {
    expect(normalizeSceneSuggestionVisibility(undefined)).toBe(true);
    expect(normalizeSceneSuggestionVisibility(false)).toBe(false);
  });
});
