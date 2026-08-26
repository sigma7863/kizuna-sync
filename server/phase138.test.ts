import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const dbSource = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");
const routerSource = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
const themeSwitcherSource = readFileSync(resolve(process.cwd(), "client/src/components/ThemeModeSwitcher.tsx"), "utf8");
const stylesheet = readFileSync(resolve(process.cwd(), "client/src/index.css"), "utf8");

describe("phase 138 usability improvements", () => {
  it("deletes a family only through a creator-authorized, metadata-scoped cleanup", () => {
    expect(dbSource).toContain("export async function deleteFamilyGroup");
    expect(dbSource).toContain("information_schema.columns");
    expect(dbSource).toContain("column_name = 'family_group_id'");
    expect(dbSource).toContain("await db.transaction");
    expect(routerSource).toContain("Only the family creator can delete this group");
    expect(routerSource).toContain("return await deleteFamilyGroup(input.familyGroupId)");
  });

  it("requires an explicit name confirmation before deleting from the home screen", () => {
    expect(homeSource).toContain("deleteConfirmation !== groupPendingDeletion?.name");
    expect(homeSource).toContain("この操作は取り消せません");
    expect(homeSource).toContain("trpc.family.delete.useMutation");
  });

  it("uses a real button to cycle theme modes and improves dark contrast tokens", () => {
    expect(themeSwitcherSource).toContain("<button");
    expect(themeSwitcherSource).toContain("onClick={() => setMode(nextMode)}");
    expect(themeSwitcherSource).not.toContain("<select");
    expect(stylesheet).toContain("--foreground: oklch(0.96 0.008 80)");
    expect(stylesheet).toContain("--muted-foreground: oklch(0.8 0.012 80)");
  });
});
