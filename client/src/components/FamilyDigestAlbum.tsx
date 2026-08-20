import { useState, useMemo } from "react";
import { Calendar, Gift, Heart, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useI18n } from "@/contexts/I18nContext";

export function FamilyDigestAlbum({ familyGroupId }: { familyGroupId: number }) {
  const { t } = useI18n();
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const { data: timeline = [] } = trpc.timeline.getFamilyTimeline.useQuery(
    { familyGroupId, limit: 150 },
    { enabled: familyGroupId > 0 }
  );

  const { data: digestItems = [], isLoading } = trpc.timeline.getDigestAlbum.useQuery(
    { familyGroupId, yearMonth: selectedMonth },
    { enabled: familyGroupId > 0 }
  );

  const months = useMemo(() => {
    const set = new Set<string>();
    timeline.forEach((entry) => {
      const metadata = entry.metadata as any;
      if (metadata?.isCelebration === true || metadata?.occasion !== undefined) {
        const date = new Date(entry.createdAt);
        set.add(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
      }
    });
    const arr = Array.from(set).sort().reverse();
    if (arr.length === 0) {
      const now = new Date();
      arr.push(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
    }
    return arr;
  }, [timeline]);

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-amber-50 via-white to-pink-50 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base text-gray-800">
          <Gift className="h-5 w-5 text-amber-500" />
          {t("family.digestAlbum")}
          <Badge variant="secondary" className="ml-auto">{t("family.digestBadge")}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span>{t("family.selectMonth")}</span>
          </div>
          <select
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
            className="rounded-lg border bg-white px-3 py-1.5 text-sm font-medium shadow-sm"
          >
            {months.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {isLoading ? (
          <p className="py-8 text-center text-sm text-gray-500">{t("common.loading")}</p>
        ) : digestItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-amber-200 bg-white/60 p-8 text-center text-sm text-gray-500">
            <Heart className="mx-auto mb-2 h-8 w-8 text-amber-300" />
            {t("family.digestEmpty")}
          </div>
        ) : (
          <div className="space-y-3">
            {digestItems.map((item: any) => {
              const metadata = item.metadata as any;
              const stamp = metadata?.stamp ?? "🎉";
              const occasion = metadata?.occasion ?? "general";
              return (
                <div key={item.id} className="flex items-start gap-3 rounded-2xl border border-pink-100 bg-white/90 p-4 shadow-sm">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-pink-50 text-2xl shadow-inner">
                    {stamp}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-700">{item.userName}</span>
                      <span className="text-[11px] text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="mt-1 text-sm text-gray-800">{item.content}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline" className="border-pink-200 text-[10px] text-pink-600">
                        {occasion}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
