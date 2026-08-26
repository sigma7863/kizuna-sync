import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

function countUtilsHookCalls(filePath: string) {
  return (readFileSync(resolve(process.cwd(), filePath), "utf8").match(/trpc\.useUtils\(\)/g) ?? []).length;
}

describe("phase 132 hook-safety regression guard", () => {
  it("does not use the tRPC utility hook in Home's create-family path", () => {
    expect(countUtilsHookCalls("client/src/pages/Home.tsx")).toBe(0);
  });

  it("does not use the tRPC utility hook in FamilyDetail's mutation paths", () => {
    expect(countUtilsHookCalls("client/src/pages/FamilyDetail.tsx")).toBe(0);
  });
});
