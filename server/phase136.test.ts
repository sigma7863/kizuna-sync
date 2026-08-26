import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migrationSource = readFileSync(
  resolve(process.cwd(), "drizzle/migrations/0002_phase136_family_detail_tables.sql"),
  "utf8"
);
const routerSource = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");

describe("phase 136 family detail schema migration", () => {
  it("creates every table referenced by the failed family-detail queries", () => {
    for (const tableName of [
      "notification_settings",
      "notifications",
      "wearable_health_snapshots",
      "family_schedule_events",
      "family_check_in_records",
      "family_help_requests",
      "family_shopping_items",
      "family_sharing_preferences",
    ]) {
      expect(migrationSource).toContain(`CREATE TABLE IF NOT EXISTS ${tableName}`);
    }
  });

  it("uses idempotent DDL so deployment does not overwrite existing family data", () => {
    expect(migrationSource).not.toMatch(/\bDROP\b/i);
    expect(migrationSource).not.toMatch(/\bTRUNCATE\b/i);
  });

  it("returns null rather than undefined for unregistered health and sharing settings", () => {
    expect(routerSource).toContain("return (await getFamilySharingPreference(input.familyGroupId, ctx.user.id)) ?? null;");
    expect(routerSource).toContain("return (await getLatestWearableHealthSnapshot(input.familyGroupId, ctx.user.id)) ?? null;");
  });
});
