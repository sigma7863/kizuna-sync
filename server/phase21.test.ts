import { describe, expect, it } from "vitest";
import { pickFamilyFunPrompt } from "../shared/familyFun";

describe("phase 21 family fun lottery", () => {
  const prompts = [{ id: 1, content: "今日のよかったことを話す" }, { id: 2, content: "家族で一曲選ぶ" }];

  it("returns no draw from an empty family lottery", () => {
    expect(pickFamilyFunPrompt([])).toBeUndefined();
  });

  it("selects a deterministic prompt from a supplied random value", () => {
    expect(pickFamilyFunPrompt(prompts, () => 0)?.id).toBe(1);
    expect(pickFamilyFunPrompt(prompts, () => 0.9)?.id).toBe(2);
  });
});
