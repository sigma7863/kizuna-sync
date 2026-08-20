import { useState, useMemo, useRef, useEffect } from "react";
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

export function FamilyTrailHeatmap({ familyGroupId }: FamilyTrailHeatmapProps) {
  const { t } = useI18n();
  const [rangeDays, setRangeDays] = useState<(typeof RANGE_OPTIONS)[number]>(7);
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>();
  const [timeSlot, setTimeSlot] = useState<TimeSlot>("all");
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const heatmap = useRef<google.maps.visualization.HeatmapLayer | null>(null);

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

  useEffect(() => {
    if (!map || !window.google?.maps?.visualization) return;
    heatmap.current?.setMap(null);
    const data = filteredPoints.map((point) => ({
      location: new window.google.maps.LatLng(point.latitude, point.longitude),
      weight: point.accuracy ? Math.max(0.5, Math.min(2.5, 40 / Math.max(point.accuracy, 1))) : 1,
    }));
    heatmap.current = new window.google.maps.visualization.HeatmapLayer({
      data,
      map,
      radius: 34,
      opacity: 0.72,
      gradient: [
        "rgba(49, 46, 129, 0)",
        "rgba(79, 70, 229, 0.45)",
        "rgba(168, 85, 247, 0.62)",
        "rgba(236, 72, 153, 0.78)",
        "rgba(251, 146, 60, 0.9)",
      ],
    });
    return () => {
      heatmap.current?.setMap(null);
      heatmap.current = null;
    };
  }, [map, filteredPoints]);

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
          <label className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <select value={timeSlot} onChange={(event) => setTimeSlot(event.target.value as TimeSlot)} aria-label={t("family.trailTimeSlot")}>
              <option value="all">{t("family.timeSlotAll")}</option>
              <option value="morning">朝 (5:00-10:00)</option>
              <option value="daytime">昼 (10:00-18:00)</option>
              <option value="night">夜 (18:00-5:00)</option>
            </select>
          </label>
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
        <MapView className="h-full" initialCenter={center} initialZoom={13} onMapReady={setMap} />
        <div className="absolute bottom-4 left-4 rounded-xl bg-white/90 px-3 py-2 text-xs text-gray-700 shadow-sm backdrop-blur">
          <div className="flex items-center gap-2"><MapPinned className="h-3.5 w-3.5 text-pink-500" />{isLoading ? t("common.loading") : t("family.trailPointCount").replace("{count}", String(filteredPoints.length))}</div>
          <div className="mt-1 text-[11px] text-gray-500">{t("family.trailPrivacy")}</div>
        </div>
      </div>
    </Card>
  );
}
