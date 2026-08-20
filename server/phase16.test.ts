import { describe, expect, it } from "vitest";
import { summarizeFamilyPoll } from "../shared/familyPolls";
import { buildTimeCapsuleCron } from "./time-capsule-scheduler";

describe("phase 16 shared family tools", () => {
  it("creates a UTC Heartbeat cron for the capsule opening time", () => {
    expect(buildTimeCapsuleCron(new Date("2026-12-03T04:05:00.000Z"))).toBe("0 5 4 3 12 *");
  });

  it("aggregates poll responses while only exposing the viewer's own selection", () => {
    const result = summarizeFamilyPoll(["家で過ごす", "公園へ行く"], [
      { respondentUserId: 11, optionIndex: 0 },
      { respondentUserId: 12, optionIndex: 1 },
      { respondentUserId: 13, optionIndex: 1 },
    ], 12);
    expect(result).toEqual({ counts: [1, 2], responseCount: 3, ownOptionIndex: 1 });
  });
});
