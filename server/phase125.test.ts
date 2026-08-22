import { describe, expect, it } from "vitest";
import { getFamilyMemberRole, isFamilyMember } from "../shared/familyMembership";

describe("phase 125 release authorization audit", () => {
  const members = [
    { users: { id: 1 }, family_members: { memberRole: "guardian" as const } },
    { users: { id: 2 }, family_members: { memberRole: "elderly" as const } },
  ];

  it("keeps geofence-relevant membership and guardian checks distinguishable", () => {
    expect(isFamilyMember(members, 2)).toBe(true);
    expect(isFamilyMember(members, 3)).toBe(false);
    expect(getFamilyMemberRole(members, 1)).toBe("guardian");
    expect(getFamilyMemberRole(members, 2)).not.toBe("guardian");
  });
});
