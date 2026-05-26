import { useEffect, useState } from "react";
import { Heart, Camera, Music, MapPin, Smile, MessageSquare } from "lucide-react";

interface RippleNotification {
  id: string;
  type: "mood" | "photo" | "music" | "location" | "message" | "activity";
  userName: string;
  timestamp: Date;
}

interface KizunaRippleProps {
  notifications: RippleNotification[];
  onNotificationDismiss?: (id: string) => void;
}

/**
 * 絆の波紋コンポーネント
 * 家族メンバーのアクティビティをリアルタイムで非言語で通知する
 * 波紋アニメーションで視覚的に表現
 */
export function KizunaRipple({ notifications, onNotificationDismiss }: KizunaRippleProps) {
  const [displayedNotifications, setDisplayedNotifications] = useState<RippleNotification[]>([]);

  useEffect(() => {
    setDisplayedNotifications(notifications.slice(-5)); // 最新5件まで表示
  }, [notifications]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "mood":
        return <Smile className="w-6 h-6" />;
      case "photo":
        return <Camera className="w-6 h-6" />;
      case "music":
        return <Music className="w-6 h-6" />;
      case "location":
        return <MapPin className="w-6 h-6" />;
      case "message":
        return <MessageSquare className="w-6 h-6" />;
      default:
        return <Heart className="w-6 h-6" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "mood":
        return "from-pink-400 to-pink-600";
      case "photo":
        return "from-blue-400 to-blue-600";
      case "music":
        return "from-purple-400 to-purple-600";
      case "location":
        return "from-green-400 to-green-600";
      case "message":
        return "from-orange-400 to-orange-600";
      default:
        return "from-pink-400 to-purple-600";
    }
  };

  return (
    <div className="fixed bottom-4 right-4 space-y-3 z-40 pointer-events-none">
      {displayedNotifications.map((notification, index) => (
        <div
          key={notification.id}
          className="pointer-events-auto animate-in fade-in slide-in-from-right-4 duration-300"
          style={{
            animation: `slideInRight 0.3s ease-out ${index * 0.1}s both`,
          }}
        >
          <style>{`
            @keyframes slideInRight {
              from {
                opacity: 0;
                transform: translateX(100%);
              }
              to {
                opacity: 1;
                transform: translateX(0);
              }
            }
            
            @keyframes ripple {
              0% {
                box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.7);
              }
              70% {
                box-shadow: 0 0 0 20px rgba(236, 72, 153, 0);
              }
              100% {
                box-shadow: 0 0 0 0 rgba(236, 72, 153, 0);
              }
            }
            
            .ripple-animation {
              animation: ripple 1.2s infinite;
            }
          `}</style>

          <div className="relative">
            {/* 波紋背景 */}
            <div className="absolute inset-0 rounded-full ripple-animation" />

            {/* 通知カード */}
            <div
              className={`relative bg-gradient-to-br ${getActivityColor(
                notification.type
              )} rounded-full w-16 h-16 flex items-center justify-center text-white shadow-lg cursor-pointer hover:shadow-xl transition-shadow`}
              onClick={() => {
                if (onNotificationDismiss) {
                  onNotificationDismiss(notification.id);
                }
              }}
              title={`${notification.userName}が${notification.type}をシェア`}
            >
              {getActivityIcon(notification.type)}
            </div>

            {/* ユーザー名ラベル */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs text-gray-700 font-medium bg-white px-2 py-1 rounded-full shadow-md">
              {notification.userName}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default KizunaRipple;
