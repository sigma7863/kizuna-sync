import { describe, expect, it } from "vitest";
import { getReassuranceActionShortcuts, getReassuranceUsageSummary, normalizeReassuranceSuggestionVisibility } from "../shared/familyCardDiscovery";

describe("familyCardDiscovery phase 67", () => {
  it("安心行動の目的別ショートカットを返す", () => {
    expect(getReassuranceActionShortcuts().map((item) => item.label)).toContain("気づかいを届ける");
  });

  it("利用が少ない安心行動の次の一歩を案内する", () => {
    expect(getReassuranceUsageSummary(["card-role-handoff"]).message).toContain("次は");
  });

  it("安心提案の既定値は表示する", () => {
    expect(normalizeReassuranceSuggestionVisibility(undefined)).toBe(true);
    expect(normalizeReassuranceSuggestionVisibility(false)).toBe(false);
  });
});
