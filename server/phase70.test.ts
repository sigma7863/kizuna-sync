import { describe, expect, it } from "vitest";
import { getLifeBalanceSummary, normalizeLifeBalanceSuggestionVisibility } from "../shared/familyCardDiscovery";

describe("familyCardDiscovery phase 70", () => {
  it("予定・暮らし・楽しみの利用状況と次の目的を返す", () => {
    const result = getLifeBalanceSummary(["card-place-ideas"]);
    expect(result.entries).toHaveLength(3);
    expect(result.message).toContain("次は");
  });

  it("バランス提案の既定値は表示する", () => {
    expect(normalizeLifeBalanceSuggestionVisibility(undefined)).toBe(true);
    expect(normalizeLifeBalanceSuggestionVisibility(false)).toBe(false);
  });
});
