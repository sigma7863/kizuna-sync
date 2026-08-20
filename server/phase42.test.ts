import { describe, expect, it } from "vitest";
import { countUnreceivedThanks, moodResetKindLabels, outingCharmKindLabels } from "../shared/familyTinySupports";

describe("phase 42 tiny family supports", () => {
  it("counts gratitude relays that have not yet been gently received", () => {
    expect(countUnreceivedThanks([{ isReceived: false }, { isReceived: true }, { isReceived: false }])).toBe(2);
  });

  it("labels mood-reset and outing-charm choices in warm Japanese", () => {
    expect(moodResetKindLabels.breath).toBe("深呼吸");
    expect(outingCharmKindLabels.cheer).toBe("応援");
  });
});
