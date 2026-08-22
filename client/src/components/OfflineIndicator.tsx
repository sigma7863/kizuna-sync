import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/contexts/I18nContext";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { getOfflineRecoveryState, shouldShowOfflineRecovery } from "@shared/offlineRecovery";

/**
 * オフライン状態インジケーター
 * ネットワーク状態を表示し、同期状況を通知
 */
export function OfflineIndicator() {
  const { t } = useI18n();
  const { isOnline, pendingActivities, isSyncing, triggerSync, conflictActivityIds } = useOfflineSync();
  const [recentlyReconnected, setRecentlyReconnected] = useState(false);
  const wasOnline = useRef(isOnline);
  const state = getOfflineRecoveryState({ isOnline, isSyncing, pendingCount: pendingActivities.length, conflictCount: conflictActivityIds.length });
  const visible = shouldShowOfflineRecovery({ state, recentlyReconnected });

  useEffect(() => {
    if (!wasOnline.current && isOnline) {
      setRecentlyReconnected(true);
      const timer = window.setTimeout(() => setRecentlyReconnected(false), 5_000);
      wasOnline.current = isOnline;
      return () => window.clearTimeout(timer);
    }
    wasOnline.current = isOnline;
  }, [isOnline]);

  if (!visible) return null;

  const appearance = {
    offline: "border-rose-300 bg-rose-50 text-rose-950",
    conflict: "border-orange-300 bg-orange-50 text-orange-950",
    syncing: "border-sky-300 bg-sky-50 text-sky-950",
    pending: "border-amber-300 bg-amber-50 text-amber-950",
    synced: "border-emerald-300 bg-emerald-50 text-emerald-950",
  }[state];
  const title = {
    offline: t("family.offlineRecoveryOfflineTitle"),
    conflict: t("family.offlineRecoveryConflictTitle"),
    syncing: t("family.offlineRecoverySyncingTitle"),
    pending: t("family.offlineRecoveryPendingTitle"),
    synced: t("family.offlineRecoveryRestoredTitle"),
  }[state];
  const description = state === "offline"
    ? t("family.offlineRecoveryOfflineDescription")
    : state === "conflict"
      ? t("family.offlineRecoveryConflictDescription").replace("{count}", String(conflictActivityIds.length))
    : state === "syncing"
      ? t("family.offlineRecoverySyncingDescription")
      : state === "pending"
        ? t("family.offlineRecoveryPendingDescription").replace("{count}", String(pendingActivities.length))
        : t("family.offlineRecoveryRestoredDescription");

  return (
    <div role="status" aria-live="polite" className={`fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-2xl border-2 p-4 shadow-lg ${appearance}`}>
      <div className="flex items-start gap-3">
        {state === "offline" ? <WifiOff className="mt-0.5 h-6 w-6 shrink-0" aria-hidden="true" /> : state === "syncing" ? <Loader2 className="mt-0.5 h-6 w-6 shrink-0 animate-spin" aria-hidden="true" /> : state === "pending" || state === "conflict" ? <AlertCircle className="mt-0.5 h-6 w-6 shrink-0" aria-hidden="true" /> : <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0" aria-hidden="true" />}
        <div className="min-w-0 flex-1"><p className="text-base font-bold">{title}</p><p className="mt-1 text-sm leading-relaxed">{description}</p>{state === "offline" && <p className="mt-2 text-xs leading-relaxed">{t("family.offlineRecoverySafetyHint")}</p>}</div>
      </div>
      {state === "pending" && <Button type="button" variant="outline" onClick={() => void triggerSync()} disabled={isSyncing} className="mt-3 min-h-11 w-full border-current bg-white/80 text-current hover:bg-white"><RefreshCw className="mr-1.5 h-4 w-4" />{t("family.offlineRecoveryRetry")}</Button>}
      {state === "conflict" && <Button type="button" variant="outline" onClick={() => window.location.reload()} className="mt-3 min-h-11 w-full border-current bg-white/80 text-current hover:bg-white"><RefreshCw className="mr-1.5 h-4 w-4" />{t("family.offlineRecoveryConflictReview")}</Button>}
    </div>
  );
}

/**
 * 同期ステータスインジケーター
 * ペンディング中のアクティビティを表示
 */
interface SyncStatusProps {
  isSyncing: boolean;
  pendingCount: number;
}

export function SyncStatus({ isSyncing, pendingCount }: SyncStatusProps) {
  if (!isSyncing && pendingCount === 0) return null;

  return (
    <div className="fixed top-4 right-4 bg-white rounded-lg shadow-lg p-3 flex items-center gap-2 border border-gray-200">
      {isSyncing ? (
        <>
          <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
          <span className="text-sm text-gray-700">同期中...</span>
        </>
      ) : pendingCount > 0 ? (
        <>
          <AlertCircle className="w-4 h-4 text-yellow-600" />
          <span className="text-sm text-gray-700">
            {pendingCount}件のアクティビティが待機中
          </span>
        </>
      ) : null}
    </div>
  );
}
