import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(resolve(process.cwd(), "client/src/components/FamilyTrailHeatmap.tsx"), "utf8");

describe("phase 141 trail map compatibility", () => {
  it("does not rely on the removed Google Maps visualization heatmap API", () => {
    expect(source).not.toContain("HeatmapLayer");
    expect(source).not.toContain("maps.visualization");
    expect(source).toContain("new window.google.maps.Circle");
  });

  it("bounds map draw work and contains map-only failures", () => {
    expect(source).toContain("MAX_TRAIL_CIRCLES = 600");
    expect(source).toContain("TrailMapBoundary");
    expect(source).toContain("移動履歴の地図を表示できませんでした");
  });
});
