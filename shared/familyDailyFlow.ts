export type EncouragementStamp = "sun" | "heart" | "clap" | "rainbow";

export function getDayKey(date = new Date()): string { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
export function getEncouragementStampLabel(stamp: EncouragementStamp): string { return ({ sun: "おひさま", heart: "ハート", clap: "ぱちぱち", rainbow: "にじ" })[stamp]; }
export function countQuestionAnswers(answers: Array<{ questionId: number }>, questionId: number): number { return answers.filter((answer) => answer.questionId === questionId).length; }
