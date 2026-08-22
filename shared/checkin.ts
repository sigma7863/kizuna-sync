import type { FamilyCheckInStatus } from "./familyCheckIn";

export function buildCheckInContent(note?: string) {
  return note?.trim() || "大丈夫です。安心してね。";
}

export function buildCheckInMetadata(status: FamilyCheckInStatus = "okay") {
  return { isCheckIn: true, status };
}
