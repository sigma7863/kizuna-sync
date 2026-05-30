import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

/**
 * オフライン状態インジケーター
 * ネットワーク状態を表示し、同期状況を通知
 */
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);
      // 3秒後に非表示
      const timer = setTimeout(() => setShowIndicator(false), 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!showIndicator) return null;

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 max-w-sm mx-auto rounded-lg shadow-lg p-4 flex items-center gap-3 transition-all duration-300 ${
        isOnline
          ? "bg-green-50 border border-green-200"
          : "bg-red-50 border border-red-200"
      }`}
    >
      {isOnline ? (
        <>
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-900">接続しました</p>
            <p className="text-xs text-green-700">データを同期中...</p>
          </div>
        </>
      ) : (
        <>
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 animate-pulse" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900">オフライン中</p>
            <p className="text-xs text-red-700">接続を確認してください</p>
          </div>
        </>
      )}
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
