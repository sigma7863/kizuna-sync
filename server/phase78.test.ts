import { describe, expect, it } from "vitest";
import { normalizeFamilyCardAnchor } from "../shared/familyCardDiscovery";

describe("family card shared-link recovery phase 78", () => {
  it("共有URLの有効なカードアンカーだけを受け入れる", () => {
    expect(normalizeFamilyCardAnchor("#card-role-handoff")).toBe("card-role-handoff");
    expect(normalizeFamilyCardAnchor("card-place-ideas")).toBe("card-place-ideas");
    expect(normalizeFamilyCardAnchor("#unknown-card")).toBeUndefined();
  });
});
