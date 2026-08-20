import { describe, expect, it } from "vitest";
import { countQuestionAnswers, getDayKey, getEncouragementStampLabel } from "../shared/familyDailyFlow";

describe("phase 33 family daily flow", () => {
  it("uses a local-readable calendar key and counts answers", () => {
    expect(getDayKey(new Date("2026-08-20T00:00:00Z"))).toBe("2026-08-20");
    expect(countQuestionAnswers([{ questionId: 3 }, { questionId: 3 }, { questionId: 4 }], 3)).toBe(2);
  });
  it("gives family stamps friendly labels", () => { expect(getEncouragementStampLabel("rainbow")).toBe("にじ"); });
});
