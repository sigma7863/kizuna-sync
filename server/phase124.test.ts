import { describe, expect, it } from "vitest";
import { getKoshienDemoSteps } from "../shared/koshienDemo";

describe("phase 124 Koshien demo contracts", () => {
  it("keeps the three-minute story ordered and bound to the current family", () => {
    const steps = getKoshienDemoSteps(42);
    expect(steps.map((step) => step.id)).toEqual(["create", "safety", "checkIn", "memory", "recovery"]);
    expect(steps.slice(1).every((step) => step.path.includes("/family/42"))).toBe(true);
  });
});
