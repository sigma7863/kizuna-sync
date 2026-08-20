import { describe, expect, it } from "vitest";
import { bedtimePreparationKindLabels, getMondayWeekKey, tinyBadgeKindLabels } from "../shared/familyWeeklyCareRituals";

describe("phase 43 weekly care rituals", () => {
  it("builds the Monday key for a week", () => {
    expect(getMondayWeekKey(new Date("2026-08-20T12:00:00Z"))).toBe("2026-08-17");
  });

  it("labels tiny achievements and bedtime preparations", () => {
    expect(tinyBadgeKindLabels.kindness).toBe("やさしさ");
    expect(bedtimePreparationKindLabels.bag).toBe("かばん");
  });
});
