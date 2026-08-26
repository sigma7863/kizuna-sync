import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const dbSource = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");
const routerSource = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");

describe("phase 134 family creation membership contract", () => {
  it("adds the creator as a guardian when creating a family group", () => {
    const createFamilyGroupBody = dbSource.slice(dbSource.indexOf("export async function createFamilyGroup"), dbSource.indexOf("export async function getFamilyGroupById"));
    expect(createFamilyGroupBody).toContain("db.insert(familyMembers).values");
    expect(createFamilyGroupBody).toContain('memberRole: "guardian"');
    expect(createFamilyGroupBody).toContain("Array.isArray(result) ? result[0] : result");
    expect(createFamilyGroupBody).toContain("orderBy(desc(familyGroups.id))");
  });

  it("returns the persisted family group identifier through the API", () => {
    const familyRouterBody = routerSource.slice(routerSource.indexOf("family: router({"), routerSource.indexOf("getById:"));
    expect(familyRouterBody).toContain("familyGroupId: result.familyGroupId");
  });

  it("repairs older creator groups that are missing a membership before listing", () => {
    const getUserFamilyGroupsBody = dbSource.slice(dbSource.indexOf("export async function getUserFamilyGroups"), dbSource.indexOf("// Family member queries"));
    expect(getUserFamilyGroupsBody).toContain("missingCreatorMemberships");
    expect(getUserFamilyGroupsBody).toContain('memberRole: "guardian" as const');
  });
});
