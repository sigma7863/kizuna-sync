export type ConsultationKind = "listen" | "advice" | "help";
export type SeasonKind = "spring" | "summer" | "autumn" | "winter" | "anytime";

export function getConsultationKindLabel(kind: ConsultationKind): string { return ({ listen: "聞いてほしい", advice: "相談したい", help: "手伝ってほしい" })[kind]; }
export function getSeasonLabel(season: SeasonKind): string { return ({ spring: "春", summer: "夏", autumn: "秋", winter: "冬", anytime: "いつでも" })[season]; }
export function getCareReplyCount(replies: Array<{ reaction: string }>): number { return replies.length; }
