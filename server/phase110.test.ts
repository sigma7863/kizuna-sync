import { describe, expect, it } from "vitest";
import { isFamilyMember } from "../shared/familyMembership";

describe("phase 110 family data access guards", () => {
  it("allows only actual family members to access family-scoped data", () => {
    const members = [{ users: { id: 3 } }, { users: { id: 9 } }];

    expect(isFamilyMember(members, 3)).toBe(true);
    expect(isFamilyMember(members, 9)).toBe(true);
    expect(isFamilyMember(members, 7)).toBe(false);
  });
});
