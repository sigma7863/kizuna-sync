export type QuizAnswer = "a" | "b" | "c";

export function getCountdownText(eventAt: Date, now = new Date()): string {
  const eventDay = Date.UTC(eventAt.getUTCFullYear(), eventAt.getUTCMonth(), eventAt.getUTCDate());
  const currentDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const days = Math.round((eventDay - currentDay) / 86_400_000);
  if (days < 0) return "開催済み";
  if (days === 0) return "今日";
  return `あと${days}日`;
}
export function isQuizAnswerCorrect(selected: QuizAnswer, correct: QuizAnswer): boolean { return selected === correct; }
export function getQuizAnswerLabel(answer: QuizAnswer): string { return answer.toUpperCase(); }
