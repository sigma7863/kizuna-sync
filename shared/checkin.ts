export function buildCheckInContent(note?: string) {
  return note?.trim() || "大丈夫です。安心してね。";
}

export function buildCheckInMetadata() {
  return { isCheckIn: true, status: "okay" as const };
}
