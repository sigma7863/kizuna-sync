import { describe, expect, it } from "vitest";
import { getTodayFamilyPurposeShortcuts, getTodayFamilyPurposeUsageSummary, normalizeTodayFamilyPurposeSuggestionVisibility } from "../shared/familyCardDiscovery";

describe("familyCardDiscovery phase 72", () => {
  it("今日の家族目的ショートカットを返す", () => {
    expect(getTodayFamilyPurposeShortcuts().map((item) => item.label)).toContain("気分を分け合う");
  });

  it("今日の目的ごとの利用状況を要約する", () => {
    expect(getTodayFamilyPurposeUsageSummary(["card-place-ideas"]).entries).toHaveLength(3);
  });

  it("今日の家族目的提案は既定で表示する", () => {
    expect(normalizeTodayFamilyPurposeSuggestionVisibility(undefined)).toBe(true);
    expect(normalizeTodayFamilyPurposeSuggestionVisibility(false)).toBe(false);
  });
});
