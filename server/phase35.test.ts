import { describe, expect, it } from "vitest";
import { countHelpedMemos, getMoodLabel } from "../shared/familyEveningRhythm";

describe("phase 35 evening family rhythm", () => {
  it("labels a nightly mood in warm Japanese", () => {
    expect(getMoodLabel("grateful")).toBe("ありがとう");
    expect(getMoodLabel("anxious")).toBe("そわそわ");
  });

  it("counts only meaningful helped-by notes", () => {
    expect(countHelpedMemos([{ helperNote: "夕食を手伝ってくれた" }, { helperNote: "   " }, { helperNote: "迎えに来てくれた" }])).toBe(2);
  });
});
