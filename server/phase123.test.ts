import { describe, expect, it } from "vitest";
import { highPriorityAuditPolicy, isWithinFamilyTextLimit, normalizeFamilyText } from "../shared/familyDataQuality";

describe("phase 123 family data quality contracts", () => {
  it("normalizes whitespace and keeps text within explicit bounds", () => {
    expect(normalizeFamilyText("  きょう   は   元気  ")).toBe("きょう は 元気");
    expect(isWithinFamilyTextLimit("   ", 120)).toBe(false);
    expect(isWithinFamilyTextLimit("家族へ", 3)).toBe(true);
  });

  it("defines least-disclosure audit fields for high-priority actions", () => {
    expect(highPriorityAuditPolicy.checkIn).toEqual(["familyGroupId", "actorUserId", "status", "createdAt"]);
    expect(highPriorityAuditPolicy.invite).not.toContain("inviteToken");
    expect(highPriorityAuditPolicy.sharingPreferences).not.toContain("healthValue");
  });
});
