export function formatGratitudeContent(message: string, stamp?: string) {
  return `${stamp || "💐"} ありがとう：${message.trim()}`;
}
