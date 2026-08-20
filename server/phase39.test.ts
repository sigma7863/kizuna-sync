import { describe, expect, it } from "vitest";
import { comfortColorLabels, countJoinResponses, rainyIdeaMoodLabels, togetherKindLabels } from "../shared/familyTogetherComfort";

describe("phase 39 together and comfort flow", () => {
  it("counts family members who opt into a gentle invitation", () => {
    expect(countJoinResponses([{ response: "join" }, { response: "maybe" }, { response: "join" }])).toBe(2);
  });

  it("exposes warm labels for invitations, comfort colors, and indoor ideas", () => {
    expect(togetherKindLabels.hobby).toBe("趣味");
    expect(comfortColorLabels.soft).toBe("ゆったり");
    expect(rainyIdeaMoodLabels.creative).toBe("つくる");
  });
});
