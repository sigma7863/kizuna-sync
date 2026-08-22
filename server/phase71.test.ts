import { describe, expect, it } from "vitest";
import { getDailyPurposeShortcuts, getDailyPurposeUsageSummary, normalizeDailyPurposeSuggestionVisibility } from "../shared/familyCardDiscovery";

describe("familyCardDiscovery phase 71", () => {
  it("日常目的のショートカットを返す", () => {
    expect(getDailyPurposeShortcuts().map((item) => item.label)).toContain("ひとこと声かけ");
  });

  it("日常目的ごとの利用状況を要約する", () => {
    expect(getDailyPurposeUsageSummary(["card-place-ideas"]).entries).toHaveLength(3);
  });

  it("日常目的の提案は既定で表示する", () => {
    expect(normalizeDailyPurposeSuggestionVisibility(undefined)).toBe(true);
    expect(normalizeDailyPurposeSuggestionVisibility(false)).toBe(false);
  });
});
