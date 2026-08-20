import { describe, expect, it } from "vitest";
import { getCareReplyCount, getConsultationKindLabel, getSeasonLabel } from "../shared/familySupportCircle";

describe("phase 32 family support circle", () => {
  it("uses gentle labels for asking the family", () => {
    expect(getConsultationKindLabel("listen")).toBe("聞いてほしい");
    expect(getSeasonLabel("autumn")).toBe("秋");
  });
  it("counts small care replies", () => { expect(getCareReplyCount([{ reaction: "🫶" }, { reaction: "ありがとう" }])).toBe(2); });
});
