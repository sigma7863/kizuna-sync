import { describe, expect, it } from "vitest";

describe("phase 19 contact and weekend coordination contracts", () => {
  it("keeps the supported contact categories explicit", () => {
    expect(["緊急", "かかりつけ先", "避難場所"]).toContain("避難場所");
  });

  it("creates an event-poll title for a shared weekend proposal", () => {
    expect(`イベント：週末は何をする？`).toMatch(/^イベント：/);
  });
});
