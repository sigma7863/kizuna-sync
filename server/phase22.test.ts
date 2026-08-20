import { describe, expect, it } from "vitest";
import { getChallengeProgress } from "../shared/familyChallenge";

describe("phase 22 monthly family challenge", () => {
  it("keeps progress bounded for display while preserving completion", () => {
    expect(getChallengeProgress(3, 5)).toEqual({ progress: 3, target: 5, isCompleted: false });
    expect(getChallengeProgress(7, 5)).toEqual({ progress: 5, target: 5, isCompleted: true });
  });
});
