import { describe, expect, it } from "vitest";
import { getFamilyMemberRole, isFamilyMember } from "../shared/familyMembership";

describe("phase 110 family data access guards", () => {
  it("allows only actual family members to access family-scoped data", () => {
    const members = [{ users: { id: 3 }, family_members: { memberRole: "guardian" as const } }, { users: { id: 9 }, family_members: { memberRole: "child" as const } }];

    expect(isFamilyMember(members, 3)).toBe(true);
    expect(isFamilyMember(members, 9)).toBe(true);
    expect(isFamilyMember(members, 7)).toBe(false);
    expect(getFamilyMemberRole(members, 3)).toBe("guardian");
    expect(getFamilyMemberRole(members, 9)).toBe("child");
    expect(getFamilyMemberRole(members, 7)).toBeUndefined();
  });
});
