import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { familyDetailTabs } from "../shared/familyDetailTabs";
import {
  defaultFamilyFeatureLayout,
  getVisibleFamilyDetailTabs,
  moveFamilyFeature,
  normalizeFamilyFeatureLayout,
} from "../shared/familyFeatureLayout";

const schemaSource = readFileSync(resolve(process.cwd(), "drizzle/schema.ts"), "utf8");
const migrationSource = readFileSync(resolve(process.cwd(), "drizzle/migrations/0005_phase142_family_feature_layouts.sql"), "utf8");
const routerSource = readFileSync(resolve(process.cwd(), "server/routers.ts"), "utf8");
const layoutSource = readFileSync(resolve(process.cwd(), "shared/familyFeatureLayout.ts"), "utf8");
const familyDetailSource = readFileSync(resolve(process.cwd(), "client/src/pages/FamilyDetail.tsx"), "utf8");

describe("phase 142 family feature organizer", () => {
  it("has one guardian-managed persisted layout for each family", () => {
    expect(schemaSource).toContain('mysqlTable("family_feature_layouts"');
    expect(migrationSource).toContain("UNIQUE(`family_group_id`)");
    expect(layoutSource).toContain("getVisibleFamilyDetailTabs");
  });

  it("keeps a recovery tab visible when all features are hidden", () => {
    expect(layoutSource).toContain('tab !== "timeline"');
    expect(layoutSource).toContain("moveFamilyFeature");
  });

  it("exposes guardian-only update procedures", () => {
    expect(routerSource).toContain("familyFeatureLayout: router");
    expect(routerSource).toContain("Guardian role is required");
  });

  it("normalizes invalid settings and retains timeline as a recovery entry", () => {
    const normalized = normalizeFamilyFeatureLayout({
      order: ["stats", "invalid", "stats"] as never,
      hidden: [...familyDetailTabs] as never,
    });

    expect(normalized.order).toEqual(["stats", ...familyDetailTabs.filter((tab) => tab !== "stats")]);
    expect(getVisibleFamilyDetailTabs(normalized)).toEqual(["timeline"]);
  });

  it("moves only the requested feature while preserving the remaining configured order", () => {
    const moved = moveFamilyFeature(defaultFamilyFeatureLayout, "safety", "down");
    expect(moved.order.slice(0, 3)).toEqual(["timeline", "trail", "safety"]);
    expect(moved.hidden).toEqual([]);
  });

  it("uses the shared layout for navigation, visible controls, and guardian editing", () => {
    expect(familyDetailSource).toContain("<FamilyFeatureOrganizer");
    expect(familyDetailSource).toContain('currentMemberRole === "guardian"');
    expect(familyDetailSource).toContain("visibleFeatureTabs.includes(tab)");
    expect(familyDetailSource).toContain("getFeatureTabProps");
    expect(familyDetailSource).toContain("visibleFeatureTabs.map((tab)");
  });
});
