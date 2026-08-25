import { useState } from "react";
import { Activity, MapPin, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/contexts/I18nContext";
import { trpc } from "@/lib/trpc";
import { useFamilyRealtime, type RealtimeRippleUpdate } from "@/hooks/useFamilyRealtime";

type FamilyQuickWidgetProps = {
  familyGroupId: number;
  onOpenSafety: () => void;
  onOpenAssistant: () => void;
  onOpenAlbum: () => void;
};

export function FamilyQuickWidget({ familyGroupId, onOpenSafety, onOpenAssistant, onOpenAlbum }: FamilyQuickWidgetProps) {
  const { t } = useI18n();
  const [latestRipple, setLatestRipple] = useState<RealtimeRippleUpdate | null>(null);
  const { data: locations = [] } = trpc.location.latestByFamily.useQuery(
    { familyGroupId },
    { enabled: familyGroupId > 0, refetchInterval: 60_000 },
  );
  const { data: health } = trpc.health.latest.useQuery(
    { familyGroupId },
    { enabled: familyGroupId > 0, refetchInterval: 60_000 },
  );
  const { connectionState } = useFamilyRealtime(familyGroupId, undefined, undefined, setLatestRipple);

  const latestLocation = locations[0];
  const latestHealth = health ?? null;
  const locationLabel = latestLocation?.locationName || latestLocation?.userName || t("family.widgetLocationEmpty");
  const healthLabel = latestHealth ? `${latestHealth.steps?.toLocaleString?.() ?? 0}${t("family.widgetSteps")}` : t("family.widgetHealthEmpty");
  const rippleLabel = latestRipple ? t("family.widgetRippleShared").replace("{name}", latestRipple.userName) : t("family.widgetRippleEmpty");
  const realtimeLabel = connectionState === "connected" ? t("family.widgetRealtime") : connectionState === "connecting" ? t("family.widgetConnecting") : connectionState === "reconnecting" ? t("family.widgetReconnecting") : t("family.widgetOffline");
  const realtimeClassName = connectionState === "connected" ? "bg-emerald-50 text-emerald-700" : connectionState === "offline" ? "bg-slate-100 text-slate-600" : "bg-amber-50 text-amber-700";

  return (
    <section className="sticky top-2 z-10 rounded-3xl border border-white/70 bg-white/90 p-3 shadow-lg backdrop-blur md:static" aria-label={t("family.widgetTitle")}>
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <Sparkles className="h-4 w-4 text-pink-500" aria-hidden="true" />
          {t("family.widgetTitle")}
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${realtimeClassName}`} role="status" aria-live="polite">{realtimeLabel}</span>
      </div>
      <div className="grid grid-cols-3 gap-2" aria-live="polite">
        <button type="button" onClick={onOpenSafety} aria-label={t("family.widgetOpenSafety")} className="rounded-2xl bg-sky-50 p-2.5 text-left transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
          <MapPin className="mb-1 h-4 w-4 text-sky-600" aria-hidden="true" />
          <p className="line-clamp-1 text-[11px] font-semibold text-slate-700">{locationLabel}</p>
          <p className="mt-0.5 text-[10px] text-sky-600">{t("family.widgetLocation")}</p>
        </button>
        <button type="button" onClick={onOpenSafety} aria-label={t("family.widgetOpenSafety")} className="rounded-2xl bg-rose-50 p-2.5 text-left transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500">
          <Activity className="mb-1 h-4 w-4 text-rose-500" aria-hidden="true" />
          <p className="line-clamp-1 text-[11px] font-semibold text-slate-700">{healthLabel}</p>
          <p className="mt-0.5 text-[10px] text-rose-500">{t("family.widgetHealth")}</p>
        </button>
        <button type="button" onClick={onOpenAssistant} aria-label={t("family.widgetOpenAssistant")} className="rounded-2xl bg-violet-50 p-2.5 text-left transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500">
          <MessageCircle className="mb-1 h-4 w-4 text-violet-600" aria-hidden="true" />
          <p className="line-clamp-1 text-[11px] font-semibold text-slate-700">{rippleLabel}</p>
          <p className="mt-0.5 text-[10px] text-violet-600">{t("family.widgetRipple")}</p>
        </button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button size="sm" variant="outline" className="text-xs" onClick={onOpenAssistant} aria-label={t("family.widgetOpenAssistant")}><MessageCircle className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />{t("family.widgetOpenAssistant")}</Button>
        <Button size="sm" className="text-xs" onClick={onOpenAlbum} aria-label={t("family.widgetOpenAlbum")}><Sparkles className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />{t("family.widgetOpenAlbum")}</Button>
      </div>
    </section>
  );
}
