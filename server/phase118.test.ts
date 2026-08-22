import { describe, expect, it } from "vitest";
import { getVoiceInputErrorKind, normalizeSpeechRate } from "../client/src/lib/voiceConversation";

describe("phase 118 voice safety contracts", () => {
  it("uses a predictable, accessible speech-rate option", () => {
    expect(normalizeSpeechRate(0.72)).toBe(0.8);
    expect(normalizeSpeechRate(1.08)).toBe(1);
    expect(normalizeSpeechRate(1.26)).toBe(1.2);
  });

  it("distinguishes microphone permission and missing-device recovery paths", () => {
    expect(getVoiceInputErrorKind(new DOMException("denied", "NotAllowedError"))).toBe("permission");
    expect(getVoiceInputErrorKind(new DOMException("missing", "NotFoundError"))).toBe("missingDevice");
  });
});
