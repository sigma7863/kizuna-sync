import { createFamilyDetailTabPath, getInitialFamilyDetailTab, normalizeFamilyDetailTab } from "../shared/familyDetailTabs";
import { describe, expect, it } from "vitest";

describe("family detail tab navigation phase 74", () => {
  it("共有URL用の有効なタブだけを受け入れる", () => {
    expect(normalizeFamilyDetailTab("album")).toBe("album");
    expect(normalizeFamilyDetailTab("unknown")).toBeUndefined();
  });

  it("共有URLを最後に開いたタブより優先して選ぶ", () => {
    expect(getInitialFamilyDetailTab("safety", "album")).toBe("safety");
    expect(getInitialFamilyDetailTab(null, "album")).toBe("album");
    expect(getInitialFamilyDetailTab("unknown", "invalid")).toBe("timeline");
  });

  it("家族IDとタブから共有可能な詳細URLを作る", () => {
    expect(createFamilyDetailTabPath(42, "assistant")).toBe("/family/42?tab=assistant");
  });
});
