import { useState } from "react";
import { Activity, MapPin, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useFamilyRealtime, type RealtimeRippleUpdate } from "@/hooks/useFamilyRealtime";

type FamilyQuickWidgetProps = {
  familyGroupId: number;
  onOpenSafety: () => void;
  onOpenAssistant: () => void;
  onOpenAlbum: () => void;
};

export function FamilyQuickWidget({ familyGroupId, onOpenSafety, onOpenAssistant, onOpenAlbum }: FamilyQuickWidgetProps) {
  const [latestRipple, setLatestRipple] = useState<RealtimeRippleUpdate | null>(null);
  const { data: locations = [] } = trpc.location.latestByFamily.useQuery(
    { familyGroupId },
    { enabled: familyGroupId > 0, refetchInterval: 60_000 },
  );
  const { data: health } = trpc.health.latest.useQuery(
    { familyGroupId },
    { enabled: familyGroupId > 0, refetchInterval: 60_000 },
  );
  useFamilyRealtime(familyGroupId, undefined, undefined, setLatestRipple);

  const latestLocation = locations[0];
  const latestHealth = health ?? null;
  const locationLabel = latestLocation?.locationName || latestLocation?.userName || "位置情報を共有するとここに表示されます";
  const healthLabel = latestHealth ? `${latestHealth.steps?.toLocaleString?.() ?? 0}歩` : "ヘルス記録なし";
  const rippleLabel = latestRipple ? `${latestRipple.userName}さんが${latestRipple.activityType}を共有` : "新しい波紋を待っています";

  return (
    <section className="sticky top-2 z-10 rounded-3xl border border-white/70 bg-white/90 p-3 shadow-lg backdrop-blur md:static">
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <Sparkles className="h-4 w-4 text-pink-500" />
          いまの家族
        </div>
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">リアルタイム</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <button type="button" onClick={onOpenSafety} className="rounded-2xl bg-sky-50 p-2.5 text-left transition-transform active:scale-95">
          <MapPin className="mb-1 h-4 w-4 text-sky-600" />
          <p className="line-clamp-1 text-[11px] font-semibold text-slate-700">{locationLabel}</p>
          <p className="mt-0.5 text-[10px] text-sky-600">見守り</p>
        </button>
        <button type="button" onClick={onOpenSafety} className="rounded-2xl bg-rose-50 p-2.5 text-left transition-transform active:scale-95">
          <Activity className="mb-1 h-4 w-4 text-rose-500" />
          <p className="line-clamp-1 text-[11px] font-semibold text-slate-700">{healthLabel}</p>
          <p className="mt-0.5 text-[10px] text-rose-500">ヘルス</p>
        </button>
        <button type="button" onClick={onOpenAssistant} className="rounded-2xl bg-violet-50 p-2.5 text-left transition-transform active:scale-95">
          <MessageCircle className="mb-1 h-4 w-4 text-violet-600" />
          <p className="line-clamp-1 text-[11px] font-semibold text-slate-700">{rippleLabel}</p>
          <p className="mt-0.5 text-[10px] text-violet-600">波紋・会話</p>
        </button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button size="sm" variant="outline" className="text-xs" onClick={onOpenAssistant}><MessageCircle className="mr-1.5 h-3.5 w-3.5" />AIに話す</Button>
        <Button size="sm" className="text-xs" onClick={onOpenAlbum}><Sparkles className="mr-1.5 h-3.5 w-3.5" />思い出を見る</Button>
      </div>
    </section>
  );
}
