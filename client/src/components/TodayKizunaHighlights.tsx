import { Activity, Footprints, Heart, Loader2, MapPin, Sparkles, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

export function TodayKizunaHighlights({ familyGroupId }: { familyGroupId: number }) {
  const { data, isLoading } = trpc.highlights.today.useQuery({ familyGroupId }, { enabled: familyGroupId > 0, refetchInterval: 60_000 });

  return (
    <Card className="border-0 bg-gradient-to-br from-amber-50 via-white to-pink-50 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base text-slate-800"><Sparkles className="h-5 w-5 text-amber-500" />今日の絆ハイライト</CardTitle>
        <p className="text-xs text-slate-500">家族の小さな活動を、今日のひとコマとして振り返ります。</p>
      </CardHeader>
      <CardContent>
        {isLoading ? <div className="flex min-h-28 items-center justify-center text-sm text-slate-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" />集計中…</div> : (
          <>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-amber-50 p-3 text-center"><Users className="mx-auto h-4 w-4 text-amber-600" /><p className="mt-1 text-sm font-bold text-slate-800">{data?.activeMemberCount ?? 0}</p><p className="text-[10px] text-slate-500">活動メンバー</p></div>
              <div className="rounded-2xl bg-sky-50 p-3 text-center"><MapPin className="mx-auto h-4 w-4 text-sky-600" /><p className="mt-1 text-sm font-bold text-slate-800">{data?.locationCount ?? 0}</p><p className="text-[10px] text-slate-500">見守り地点</p></div>
              <div className="rounded-2xl bg-rose-50 p-3 text-center"><Footprints className="mx-auto h-4 w-4 text-rose-500" /><p className="mt-1 text-sm font-bold text-slate-800">{(data?.totalSteps ?? 0).toLocaleString()}</p><p className="text-[10px] text-slate-500">合計歩数</p></div>
            </div>
            <div className="mt-3 space-y-2">
              {data?.entries.length ? data.entries.map((entry) => <div key={entry.id} className="flex items-start gap-2 rounded-xl bg-white/80 p-2.5 text-xs text-slate-700"><Heart className="mt-0.5 h-3.5 w-3.5 shrink-0 text-pink-500" /><span className="line-clamp-2">{entry.content || "家族の新しいアクティビティ"}</span></div>) : <div className="rounded-xl border border-dashed border-amber-200 p-4 text-center text-xs text-slate-500"><Activity className="mx-auto mb-1 h-4 w-4 text-amber-400" />今日の思い出を最初に共有しましょう。</div>}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
