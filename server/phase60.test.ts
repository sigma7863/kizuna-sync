import { describe, expect, it } from "vitest";
import { createDiscoveryGroupSharePath, getDiscoveryPurposeShortcuts, normalizeDiscoverySortMode } from "../shared/familyCardDiscovery";

describe("familyCardDiscovery phase 60", () => {
  it("利用できる目的別ショートカットを返す", () => {
    expect(getDiscoveryPurposeShortcuts().map((shortcut) => shortcut.group)).toContain("予定");
  });

  it("選択カテゴリを共有できるアンカー付きパスを作る", () => {
    expect(createDiscoveryGroupSharePath("支え合い")).toBe("?cardGroup=%E6%94%AF%E3%81%88%E5%90%88%E3%81%84#family-card-navigator");
  });

  it("許可された並び順だけを保持する", () => {
    expect(normalizeDiscoverySortMode("title")).toBe("title");
    expect(normalizeDiscoverySortMode("unknown")).toBe("featured");
  });
});
