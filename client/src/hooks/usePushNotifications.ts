import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  // Push subscription will be handled via Service Worker
  // const subscribeMutation = trpc.notifications.subscribeToPush.useMutation();

  useEffect(() => {
    // Check if Push Notifications are supported
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);

    if (supported) {
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
      setIsSubscribed(!!sub);
    } catch (error) {
      console.error('[Push Notifications] Error checking subscription:', error);
    }
  };

  const subscribe = async () => {
    try {
      await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      const registration = await navigator.serviceWorker.ready;

      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        throw new Error('Missing VITE_VAPID_PUBLIC_KEY');
      }

      const urlBase64ToUint8Array = (base64String: string) => {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const raw = atob(base64);
        return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
      };

      // Subscribe to push notifications
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
      // Send subscription to server (would be implemented with tRPC)
      // await subscribeMutation.mutateAsync({
      //   subscription: sub.toJSON() as any,
      // });

      setSubscription(sub);
      setIsSubscribed(true);
    } catch (error) {
      console.error('[Push Notifications] Error subscribing:', error);
      throw error;
    }
  };

  const unsubscribe = async () => {
    try {
      if (subscription) {
        await subscription.unsubscribe();
        setSubscription(null);
        setIsSubscribed(false);
      }
    } catch (error) {
      console.error('[Push Notifications] Error unsubscribing:', error);
      throw error;
    }
  };

  return {
    isSupported,
    isSubscribed,
    subscription,
    subscribe,
    unsubscribe,
    isLoading: false,
  };
}
