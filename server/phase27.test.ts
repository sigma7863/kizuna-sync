import { describe, expect, it } from "vitest";
import { getReadingRelaySummary, getWeatherLabel, getWeatherPackingHint } from "../shared/familyDailyCheckins";

describe("phase 27 daily connection logic", () => {
  it("maps manual weather selections to labels and gentle packing hints", () => {
    expect(getWeatherLabel("rainy")).toBe("雨");
    expect(getWeatherPackingHint("rainy")).toBe("傘やタオル");
  });
  it("sums pages without treating missing values as a number", () => {
    expect(getReadingRelaySummary([{ pageCount: 12 }, { pageCount: null }, { pageCount: 8 }])).toEqual({ entries: 3, pages: 20 });
  });
});
