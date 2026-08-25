import { describe, expect, it } from "vitest";
import { isFamilyVoiceMemoDurationValid, parseFamilyVoiceMemoDataUrl } from "../shared/familyVoiceMemo";

describe("phase 128 family voice memo contracts", () => {
  it("accepts matching supported audio data URLs and derives safe extensions", () => {
    expect(parseFamilyVoiceMemoDataUrl("data:audio/webm;base64,SGVsbG8=", "audio/webm")).toEqual({ base64: "SGVsbG8=", extension: "webm" });
    expect(parseFamilyVoiceMemoDataUrl("data:audio/ogg;base64,SGVsbG8=", "audio/ogg")?.extension).toBe("ogg");
    expect(parseFamilyVoiceMemoDataUrl("data:audio/mp4;base64,SGVsbG8=", "audio/mp4")?.extension).toBe("m4a");
  });

  it("rejects mismatched or malformed audio data URLs", () => {
    expect(parseFamilyVoiceMemoDataUrl("data:audio/ogg;base64,SGVsbG8=", "audio/webm")).toBeNull();
    expect(parseFamilyVoiceMemoDataUrl("data:audio/webm;base64,not valid", "audio/webm")).toBeNull();
  });

  it("keeps duration within the mobile voice memo limit", () => {
    expect(isFamilyVoiceMemoDurationValid(0)).toBe(true);
    expect(isFamilyVoiceMemoDurationValid(600)).toBe(true);
    expect(isFamilyVoiceMemoDurationValid(601)).toBe(false);
    expect(isFamilyVoiceMemoDurationValid(1.5)).toBe(false);
  });
});
