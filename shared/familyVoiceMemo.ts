export const familyVoiceMimeTypes = ["audio/webm", "audio/ogg", "audio/mp4"] as const;
export type FamilyVoiceMimeType = (typeof familyVoiceMimeTypes)[number];

export function parseFamilyVoiceMemoDataUrl(dataUrl: string, mimeType: FamilyVoiceMimeType) {
  const match = dataUrl.match(/^data:(audio\/(?:webm|ogg|mp4));base64,([A-Za-z0-9+/=]+)$/);
  if (!match || match[1] !== mimeType) return null;
  return { base64: match[2], extension: mimeType === "audio/ogg" ? "ogg" : mimeType === "audio/mp4" ? "m4a" : "webm" };
}

export function isFamilyVoiceMemoDurationValid(durationSeconds: number) {
  return Number.isInteger(durationSeconds) && durationSeconds >= 0 && durationSeconds <= 600;
}
