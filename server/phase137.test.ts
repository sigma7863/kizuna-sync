import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migrationSource = readFileSync(
  resolve(process.cwd(), "drizzle/migrations/0003_phase137_family_schema_reconciliation.sql"),
  "utf8"
);
const safetyGuardianSource = readFileSync(
  resolve(process.cwd(), "client/src/components/SafetyGuardian.tsx"),
  "utf8"
);

describe("phase 137 family schema reconciliation", () => {
  it("creates every untracked family feature table without destructive DDL", () => {
    expect((migrationSource.match(/^CREATE TABLE /gm) ?? [])).toHaveLength(104);
    expect(migrationSource).toContain("CREATE TABLE `family_next_step_cards`");
    expect(migrationSource).toContain("CREATE TABLE `family_polls`");
    expect(migrationSource).toContain("CREATE TABLE `family_movement_bingo_cells`");
    expect(migrationSource).toContain("CREATE TABLE `family_album_photos`");
    expect(migrationSource).not.toMatch(/\bDROP\b/i);
    expect(migrationSource).not.toMatch(/\bTRUNCATE\b/i);
  });

  it("keeps the GPS watch independent from changing callback and query references", () => {
    expect(safetyGuardianSource).toContain("useEffect, useRef, useState");
    expect(safetyGuardianSource).toContain("const geofencesRef = useRef(geofences);");
    expect(safetyGuardianSource).toContain("const onLocationUpdateRef = useRef(onLocationUpdate);");
    expect(safetyGuardianSource).toContain("}, [familyGroupId]);");
    expect(safetyGuardianSource).not.toContain("setGeoWatchId");
  });
});
