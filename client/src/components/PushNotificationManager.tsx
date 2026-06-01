import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

/**
 * プッシュ通知マネージャー
 * Web Push APIの登録と管理
 */
export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // ブラウザがプッシュ通知をサポートしているか確認
    const supported =
      "serviceWorker" in navigator && "PushManager" in window;
    setIsSupported(supported);

    if (supported) {
      checkSubscriptionStatus();
    }
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error("Failed to check subscription status:", error);
    }
  };

  const handleToggleNotifications = async () => {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;

      if (isSubscribed) {
        // 購読を解除
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          setIsSubscribed(false);
          toast.success("プッシュ通知を無効にしました");
        }
      } else {
        // 購読を開始
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.VITE_VAPID_PUBLIC_KEY,
        });

        // サーバーに購読情報を送信
        await fetch("/api/trpc/notifications.subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            subscription: subscription.toJSON(),
          }),
        });

        setIsSubscribed(true);
        toast.success("プッシュ通知を有効にしました");
      }
    } catch (error) {
      console.error("Failed to toggle notifications:", error);
      toast.error("通知の設定に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggleNotifications}
      disabled={isLoading}
      title={isSubscribed ? "通知を無効にする" : "通知を有効にする"}
    >
      {isSubscribed ? (
        <Bell className="w-5 h-5 text-blue-600" />
      ) : (
        <BellOff className="w-5 h-5 text-gray-400" />
      )}
    </Button>
  );
}
