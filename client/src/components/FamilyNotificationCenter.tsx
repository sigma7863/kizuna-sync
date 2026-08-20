import { Bell, Check, CheckCheck, CalendarDays, Trophy, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/contexts/I18nContext";
import { useFamilyRealtime, type RealtimeNotification } from "@/hooks/useFamilyRealtime";

function iconForType(type: string) {
  if (type === "calendar_event") return <CalendarDays className="h-4 w-4 text-blue-500" />;
  if (type === "achievement" || type === "reward") return <Trophy className="h-4 w-4 text-amber-500" />;
  if (type === "safety") return <ShieldCheck className="h-4 w-4 text-emerald-500" />;
  return <Sparkles className="h-4 w-4 text-pink-500" />;
}

function playQuietChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = 660;
    gain.gain.setValueAtTime(0.035, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.16);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.16);
  } catch {
    // Browsers may block audio until a user gesture; visual/vibration feedback remains available.
  }
}

export function FamilyNotificationCenter({ familyGroupId }: { familyGroupId: number }) {
  const { t } = useI18n();
  const utils = trpc.useUtils();
  const { data: notifications = [] } = trpc.notifications.list.useQuery(
    { familyGroupId, limit: 30 },
    { enabled: !!familyGroupId, refetchInterval: 15_000 }
  );
  const { data: unreadCount = 0 } = trpc.notifications.unreadCount.useQuery(
    { familyGroupId },
    { enabled: !!familyGroupId, refetchInterval: 15_000 }
  );
  const { data: settings } = trpc.notifications.settings.useQuery(
    { familyGroupId },
    { enabled: !!familyGroupId }
  );
  const markReadMutation = trpc.notifications.markRead.useMutation({
    onSuccess: () => {
      void utils.notifications.list.invalidate({ familyGroupId });
      void utils.notifications.unreadCount.invalidate({ familyGroupId });
    },
  });
  const markAllReadMutation = trpc.notifications.markAllRead.useMutation({
    onSuccess: () => {
      void utils.notifications.list.invalidate({ familyGroupId });
      void utils.notifications.unreadCount.invalidate({ familyGroupId });
    },
  });
  const updateSettingsMutation = trpc.notifications.updateSettings.useMutation({
    onSuccess: () => void utils.notifications.settings.invalidate({ familyGroupId }),
  });

  useFamilyRealtime(familyGroupId, (_notification: RealtimeNotification) => {
    if (settings?.vibrationEnabled && typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate?.(settings.quietMode ? 18 : [18, 40, 18]);
    }
    if (settings?.soundEnabled && !settings.quietMode) playQuietChime();
    void utils.notifications.list.invalidate({ familyGroupId });
    void utils.notifications.unreadCount.invalidate({ familyGroupId });
  });

  const role = settings?.memberRole ?? "guardian";
  const roleLabel = role === "child"
    ? t("family.roleChild")
    : role === "elderly"
      ? t("family.roleElderly")
      : t("family.roleGuardian");
  const roleHint = role === "child"
    ? t("family.childNotificationHint")
    : role === "elderly"
      ? t("family.elderlyNotificationHint")
      : t("family.guardianNotificationHint");

  const updateSetting = (key: "vibrationEnabled" | "soundEnabled" | "bannerEnabled" | "quietMode", value: boolean) => {
    updateSettingsMutation.mutate({
      familyGroupId,
      vibrationEnabled: settings?.vibrationEnabled ?? true,
      soundEnabled: settings?.soundEnabled ?? false,
      bannerEnabled: settings?.bannerEnabled ?? true,
      quietMode: settings?.quietMode ?? true,
      [key]: value,
    });
  };

  return (
    <Card className="border-0 bg-white/90 shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-gray-800">
          <Bell className="h-5 w-5 text-pink-500" />
          {t("family.notifications")}
          {unreadCount > 0 && <Badge className="rounded-full bg-pink-500">{unreadCount}</Badge>}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => markAllReadMutation.mutate({ familyGroupId })}
          disabled={unreadCount === 0 || markAllReadMutation.isPending}
          className="gap-1 text-xs"
        >
          <CheckCheck className="h-4 w-4" />
          {t("family.markAllRead")}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-xl border border-pink-100 bg-pink-50/50 p-3 text-xs text-gray-700">
          <p className="font-semibold text-pink-900">{t("family.notificationSettings")} · {roleLabel}</p>
          <p className="mb-2 text-[11px] text-pink-700">{roleHint}</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {([
            ["vibrationEnabled", t("family.vibration")],
            ["soundEnabled", t("family.sound")],
            ["bannerEnabled", t("family.banner")],
            ["quietMode", t("family.quietMode")],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex items-center justify-between gap-2">
              <span>{label}</span>
              <Switch
                checked={role === "child" && key === "soundEnabled" ? false : settings?.[key] ?? (key !== "soundEnabled" ? true : false)}
                onCheckedChange={(value) => updateSetting(key, value)}
                disabled={(role === "child" && key === "soundEnabled") || (role === "elderly" && key === "quietMode")}
                aria-label={label}
              />
            </label>
          ))}
          </div>
        </div>
        {settings?.bannerEnabled === false ? (
          <div className="rounded-xl border border-dashed border-pink-100 px-4 py-8 text-center text-sm text-gray-500">
            {t("family.bannerDisabled")}
          </div>
        ) : notifications.length === 0 ? (
          <div className="rounded-xl border border-dashed border-pink-100 px-4 py-8 text-center text-sm text-gray-500">
            {t("family.noNotifications")}
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => !notification.readAt && markReadMutation.mutate({ notificationId: notification.id })}
                className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
                  notification.readAt ? "border-gray-100 bg-gray-50/70" : "border-pink-100 bg-pink-50/60"
                }`}
              >
                <span className="mt-0.5 rounded-full bg-white p-2 shadow-sm">{iconForType(notification.type)}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-gray-800">{notification.title}</span>
                    {!notification.readAt && <span className="h-2 w-2 rounded-full bg-pink-500" aria-label={t("family.unread")} />}
                  </span>
                  <span className="mt-1 block text-sm text-gray-600">{notification.message}</span>
                  <span className="mt-1 block text-xs text-gray-400">
                    {new Date(notification.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </span>
                {notification.readAt && <Check className="mt-1 h-4 w-4 text-emerald-500" />}
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
