import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Bell, BellOff } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { toast } from 'sonner';

export function PushNotificationSettings() {
  const { isSupported, isSubscribed, subscribe, unsubscribe, isLoading } = usePushNotifications();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubscribe = async () => {
    try {
      await subscribe();
      toast.success('プッシュ通知を有効にしました');
    } catch (error) {
      toast.error('プッシュ通知の有効化に失敗しました');
      console.error(error);
    }
  };

  const handleUnsubscribe = async () => {
    try {
      await unsubscribe();
      toast.success('プッシュ通知を無効にしました');
    } catch (error) {
      toast.error('プッシュ通知の無効化に失敗しました');
      console.error(error);
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Card className="p-4 bg-white border-0 shadow-md">
      <div
        className="flex items-center justify-between cursor-pointer"
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <div className="flex items-center gap-3">
          {isSubscribed ? (
            <Bell className="w-5 h-5 text-pink-500" />
          ) : (
            <BellOff className="w-5 h-5 text-gray-400" />
          )}
          <div>
            <h3 className="font-semibold text-gray-800">プッシュ通知</h3>
            <p className="text-xs text-gray-600">
              {isSubscribed ? '有効' : '無効'}
            </p>
          </div>
        </div>
        <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-600">
            家族からのアクティビティ通知をリアルタイムで受け取ります
          </p>
          <Button
            onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
            disabled={isLoading}
            className={`w-full ${
              isSubscribed
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-pink-500 hover:bg-pink-600'
            } text-white`}
          >
            {isLoading
              ? '処理中...'
              : isSubscribed
                ? 'プッシュ通知を無効にする'
                : 'プッシュ通知を有効にする'}
          </Button>
        </div>
      )}
    </Card>
  );
}
