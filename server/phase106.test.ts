import { describe, expect, it } from "vitest";
import { getCheckInFollowUpMessageKey, getLatestCheckInFollowUp } from "../shared/familyCheckInFollowUp";

describe("phase 106 check-in follow-up", () => {
  it("chooses the newest non-self check-in that asks for rest or conversation without exposing notes", () => {
    const result = getLatestCheckInFollowUp([
      { userId: 12, metadata: { isCheckIn: true, status: "available", note: "private note" } },
      { userId: 8, metadata: { isCheckIn: true, status: "rest", note: "do not surface" } },
    ], 8);

    expect(result).toEqual({ userId: 12, status: "available" });
    expect(result).not.toHaveProperty("note");
  });

  it("does not offer a reply for ordinary or self-authored check-ins and picks role-aware messages", () => {
    expect(getLatestCheckInFollowUp([
      { userId: 8, metadata: { isCheckIn: true, status: "rest" } },
      { userId: 12, metadata: { isCheckIn: true, status: "okay" } },
    ], 8)).toBeNull();
    expect(getCheckInFollowUpMessageKey("rest", "guardian")).toBe("family.checkInFollowUpRestGuardian");
    expect(getCheckInFollowUpMessageKey("available", "elderly")).toBe("family.checkInFollowUpAvailableElderly");
  });
});
