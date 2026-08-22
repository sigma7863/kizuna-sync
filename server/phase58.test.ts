import { describe, expect, it } from "vitest";
import { compareCardsByGroup, getDiscoveryOnboardingSteps, getSafeSearchSuggestions } from "../shared/familyCardDiscovery";

describe("familyCardDiscovery phase 58", () => {
  it("初回利用者向けの探索手順を返す", () => {
    expect(getDiscoveryOnboardingSteps()).toHaveLength(3);
  });
  it("目的別比較と検索結果なし時の候補を返す", () => {
    expect(compareCardsByGroup([{ id: "a", title: "予定", description: "確認", group: "予定" }], "予定")).toHaveLength(1);
    expect(getSafeSearchSuggestions("一致しない語")).not.toHaveLength(0);
  });
});
