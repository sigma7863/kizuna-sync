import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function countUtilsHookCalls(filePath: string) {
  return (readFileSync(resolve(process.cwd(), filePath), "utf8").match(/trpc\.useUtils\(\)/g) ?? []).length;
}

describe("phase 132 hook-safety regression guard", () => {
  it("uses the tRPC utility hook once in Home's component body", () => {
    expect(countUtilsHookCalls("client/src/pages/Home.tsx")).toBe(1);
  });

  it("uses the tRPC utility hook once in FamilyDetail's component body", () => {
    expect(countUtilsHookCalls("client/src/pages/FamilyDetail.tsx")).toBe(1);
  });
});
