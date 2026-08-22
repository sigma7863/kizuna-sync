export type OfflineRecoveryState = "offline" | "conflict" | "syncing" | "pending" | "synced";

export function getOfflineRecoveryState({
  isOnline,
  isSyncing,
  pendingCount,
  conflictCount = 0,
}: {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  conflictCount?: number;
}): OfflineRecoveryState {
  if (!isOnline) return "offline";
  if (conflictCount > 0) return "conflict";
  if (isSyncing) return "syncing";
  if (pendingCount > 0) return "pending";
  return "synced";
}

export function shouldShowOfflineRecovery({
  state,
  recentlyReconnected,
}: {
  state: OfflineRecoveryState;
  recentlyReconnected: boolean;
}) {
  return state !== "synced" || recentlyReconnected;
}
