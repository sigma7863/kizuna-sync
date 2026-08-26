import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const schemaSource = readFileSync(resolve(process.cwd(), "drizzle/schema.ts"), "utf8");
const migrationSource = readFileSync(resolve(process.cwd(), "drizzle/migrations/0004_phase140_family_theme_preferences.sql"), "utf8");
const dbSource = readFileSync(resolve(process.cwd(), "server/db.ts"), "utf8");
const routerSource = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
const detailSource = readFileSync(resolve(process.cwd(), "client/src/pages/FamilyDetail.tsx"), "utf8");

describe("phase 140 family operation and themes", () => {
  it("stores one persisted display preference for each family and member", () => {
    expect(schemaSource).toContain('mysqlTable("family_theme_preferences"');
    expect(migrationSource).toContain("CREATE TABLE IF NOT EXISTS `family_theme_preferences`");
    expect(migrationSource).toContain("UNIQUE(`family_group_id`,`user_id`)");
    expect(routerSource).toContain("familyThemePreferences: router");
    expect(routerSource).toContain("saveFamilyThemePreference");
  });

  it("caches deletion metadata and dispatches scoped cleanup without serial UI delay", () => {
    expect(dbSource).toContain("familyScopedTableNamesCache");
    expect(dbSource).toContain("await Promise.all(scopedTables.map");
    expect(homeSource).toContain("家族データを削除しています…完了まであと少しです。");
    expect(homeSource).toContain('toast.success("家族グループを削除しました")');
  });

  it("explains create failures and applies the selected family theme immediately", () => {
    expect(homeSource).toContain('toast.error("家族グループを作成できませんでした"');
    expect(detailSource).toContain("trpc.familyThemePreferences.getMine.useQuery");
    expect(detailSource).toContain("trpc.familyThemePreferences.updateMine.useMutation");
    expect(detailSource).toContain("setAppThemeMode(themeMode);");
  });
});
