import { describe, expect, it } from "vitest";
import { getDisplayScalePercent, getRoleQuickActions } from "../shared/familyAccessibility";

describe("phase 30 family accessibility logic", () => {
  it("offers role-specific quick actions", () => {
    expect(getRoleQuickActions("guardian")).toEqual(["safety", "stats", "assistant"]);
    expect(getRoleQuickActions("child")).toContain("album");
    expect(getRoleQuickActions("elderly")).toContain("shareMood");
  });
  it("maps display choices to readable scales", () => {
    expect(getDisplayScalePercent("standard")).toBe(100);
    expect(getDisplayScalePercent("xlarge")).toBe(125);
  });
});
