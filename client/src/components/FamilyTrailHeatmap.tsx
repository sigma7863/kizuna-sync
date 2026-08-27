import { Component, type ReactNode, useState, useMemo, useRef, useEffect } from "react";
import { CalendarDays, Clock, Flame, MapPinned, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MapView } from "@/components/Map";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/contexts/I18nContext";

interface FamilyTrailHeatmapProps {
  familyGroupId: number;
}

const RANGE_OPTIONS = [7, 14, 30] as const;
type TimeSlot = "all" | "morning" | "daytime" | "night";
const MAX_TRAIL_CIRCLES = 600;

class TrailMapBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-indigo-50 via-white to-pink-50 px-6 text-center">
          <MapPinned className="h-8 w-8 text-indigo-500" aria-hidden="true" />
          <p className="font-medium text-slate-800">移動履歴の地図を表示できませんでした</p>
          <p className="text-sm text-slate-500">履歴データは安全に保存されています。時間をおいて再度お試しください。</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export function FamilyTrailHeatmap({ familyGroupId }: FamilyTrailHeatmapProps) {
  const { t } = useI18n();
  const [rangeDays, setRangeDays] = useState<(typeof RANGE_OPTIONS)[number]>(7);
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>();
  const [timeSlot, setTimeSlot] = useState<TimeSlot>("all");
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const trailCircles = useRef<google.maps.Circle[]>([]);

  const { from, to } = useMemo(() => {
    const to = new Date();
    const from = new Date(to.getTime() - rangeDays * 24 * 60 * 60 * 1000);
    return { from, to };
  }, [rangeDays]);

  const queryInput = useMemo(
    () => ({ familyGroupId, from, to, userId: selectedUserId, limit: 5000 }),
    [familyGroupId, from, to, selectedUserId],
  );
  const { data: points = [], isLoading } = trpc.location.history.useQuery(queryInput, {
    enabled: familyGroupId > 0,
    staleTime: 30_000,
  });

  const filteredPoints = useMemo(() => {
    if (timeSlot === "all") return points;
    return points.filter((point) => {
      const hour = new Date(point.timestamp).getHours();
      if (timeSlot === "morning") return hour >= 5 && hour < 10;
      if (timeSlot === "daytime") return hour >= 10 && hour < 18;
      return hour < 5 || hour >= 18;
    });
  }, [points, timeSlot]);

  const members = useMemo(() => {
    const byUser = new Map<number, string>();
    points.forEach((point) => byUser.set(point.userId, point.userName));
    return Array.from(byUser.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [points]);

  const center = useMemo<google.maps.LatLngLiteral>(() => {
    if (filteredPoints.length === 0) return { lat: 35.681236, lng: 139.767125 };
    const totals = filteredPoints.reduce(
      (acc, point) => ({ lat: acc.lat + point.latitude, lng: acc.lng + point.longitude }),
      { lat: 0, lng: 0 },
    );
    return { lat: totals.lat / filteredPoints.length, lng: totals.lng / filteredPoints.length };
  }, [filteredPoints]);

  const visiblePoints = useMemo(() => {
    if (filteredPoints.length <= MAX_TRAIL_CIRCLES) return filteredPoints;
    const step = Math.ceil(filteredPoints.length / MAX_TRAIL_CIRCLES);
    return filteredPoints.filter((_, index) => index % step === 0);
  }, [filteredPoints]);

  useEffect(() => {
    if (!map) return;
    trailCircles.current.forEach((circle) => circle.setMap(null));
    map.panTo(center);
    trailCircles.current = visiblePoints.map((point, index) => {
      const progress = visiblePoints.length > 1 ? index / (visiblePoints.length - 1) : 1;
      const color = progress > 0.72 ? "#f97316" : progress > 0.4 ? "#ec4899" : "#6366f1";
      const radius = Math.max(18, Math.min(100, (point.accuracy ?? 35) * 1.4));
      return new window.google.maps.Circle({
        center: { lat: point.latitude, lng: point.longitude },
        radius,
        map,
        clickable: false,
        fillColor: color,
        fillOpacity: 0.22,
        strokeColor: color,
        strokeOpacity: 0.36,
        strokeWeight: 1,
        zIndex: 1,
      });
    });
    return () => {
      trailCircles.current.forEach((circle) => circle.setMap(null));
      trailCircles.current = [];
    };
  }, [center, map, visiblePoints]);

  return (
    <Card className="overflow-hidden border-0 bg-white shadow-md">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-indigo-600">
            <Flame className="h-5 w-5" />
            <h2 className="text-lg font-semibold text-gray-900">{t("family.trailHeatmap")}</h2>
          </div>
          <p className="mt-1 text-sm text-gray-500">{t("family.trailHeatmapHint")}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <label className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2">
            <CalendarDays className="h-4 w-4 text-gray-500" />
            <select value={rangeDays} onChange={(event) => setRangeDays(Number(event.target.value) as (typeof RANGE_OPTIONS)[number])} aria-label={t("family.trailRange")}>
              {RANGE_OPTIONS.map((days) => <option key={days} value={days}>{t("family.trailDays").replace("{days}", String(days))}</option>)}
            </select>
          </label>
          <div className="flex items-center gap-1 rounded-xl border bg-gray-50 p-1">
            <Clock className="ml-2 h-4 w-4 text-gray-400" />
            {(["all", "morning", "daytime", "night"] as TimeSlot[]).map((slot) => {
              const labelMap: Record<TimeSlot, string> = {
                all: t("family.timeSlotAll"),
                morning: "朝 5-10時",
                daytime: "昼 10-18時",
                night: "夜 18-5時",
              };
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setTimeSlot(slot)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                    timeSlot === slot
                      ? "bg-white text-pink-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {labelMap[slot]}
                </button>
              );
            })}
          </div>
          <label className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2">
            <Users className="h-4 w-4 text-gray-500" />
            <select value={selectedUserId ?? "all"} onChange={(event) => setSelectedUserId(event.target.value === "all" ? undefined : Number(event.target.value))} aria-label={t("family.trailMember")}>
              <option value="all">{t("family.allMembers")}</option>
              {members.map(([userId, name]) => <option key={userId} value={userId}>{name}</option>)}
            </select>
          </label>
        </div>
      </div>
      <div className="relative h-[420px]">
        <TrailMapBoundary>
          <MapView className="h-full" initialCenter={center} initialZoom={13} onMapReady={setMap} />
        </TrailMapBoundary>
        <div className="absolute bottom-4 left-4 rounded-xl bg-white/90 px-3 py-2 text-xs text-gray-700 shadow-sm backdrop-blur">
          <div className="flex items-center gap-2"><MapPinned className="h-3.5 w-3.5 text-pink-500" />{isLoading ? t("common.loading") : t("family.trailPointCount").replace("{count}", String(filteredPoints.length))}</div>
          <div className="mt-1 text-[11px] text-gray-500">{t("family.trailPrivacy")}</div>
        </div>
      </div>
    </Card>
  );
}
