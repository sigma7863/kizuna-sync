export function getChallengeProgress(progressCount: number, targetCount: number) {
  const safeTarget = Math.max(1, targetCount);
  const safeProgress = Math.max(0, progressCount);
  return { progress: Math.min(safeProgress, safeTarget), target: safeTarget, isCompleted: safeProgress >= safeTarget };
}
