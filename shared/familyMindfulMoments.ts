export type QuietState = "focus" | "rest" | "sleeping";

export function getMonthKey(date = new Date()): string { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`; }
export function getQuietStateLabel(state: QuietState): string { return ({ focus: "集中中", rest: "休憩中", sleeping: "おやすみ中" })[state]; }
export function getGoalCompletionRate(goals: Array<{ isCompleted: boolean }>): number { return goals.length === 0 ? 0 : Math.round((goals.filter((goal) => goal.isCompleted).length / goals.length) * 100); }
