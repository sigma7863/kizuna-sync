import { describe, expect, it } from "vitest";
import { getDiscoveryOperationGuide, normalizeDiscoveryDescriptionSize, normalizeDiscoveryGuideVisibility } from "../shared/familyCardDiscovery";

describe("familyCardDiscovery phase 68", () => {
  it("検索・絞り込み・共有の操作ガイドを返す", () => {
    expect(getDiscoveryOperationGuide()).toHaveLength(3);
  });

  it("説明文字の大きさを安全に正規化する", () => {
    expect(normalizeDiscoveryDescriptionSize("large")).toBe("large");
    expect(normalizeDiscoveryDescriptionSize("huge")).toBe("standard");
  });

  it("操作ガイドは既定で表示する", () => {
    expect(normalizeDiscoveryGuideVisibility(undefined)).toBe(true);
    expect(normalizeDiscoveryGuideVisibility(false)).toBe(false);
  });
});
