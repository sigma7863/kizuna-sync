import { Bookmark, Heart, Image, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { selectMemoryBookmark } from "@shared/familyMemories";

export function FamilyMemoryBookmark({ familyGroupId }: { familyGroupId: number }) {
  const { data: highlights, isLoading: highlightsLoading } = trpc.highlights.today.useQuery({ familyGroupId }, { enabled: familyGroupId > 0 });
  const { data: photos = [], isLoading: photosLoading } = trpc.album.list.useQuery({ familyGroupId }, { enabled: familyGroupId > 0 });
  const gratitude = selectMemoryBookmark(highlights?.entries ?? []);
  const latestPhoto = photos[0];
  return <Card className="border-0 bg-gradient-to-br from-pink-50 via-white to-violet-50 shadow-md"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base text-slate-800"><Bookmark className="h-5 w-5 text-pink-500" />今日の思い出のしおり</CardTitle><p className="text-xs text-slate-500">一日のやさしい出来事を、あとから開ける小さなしおりに。</p></CardHeader><CardContent>{highlightsLoading || photosLoading ? <div className="flex min-h-28 items-center justify-center text-xs text-slate-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" />まとめ中…</div> : <div className="space-y-2"><div className="rounded-xl bg-white/85 p-3 text-xs text-slate-700"><span className="mb-1 flex items-center gap-1 font-semibold text-pink-700"><Heart className="h-3.5 w-3.5 fill-pink-500" />今日のことば</span>{gratitude?.content || "家族の小さな出来事を共有すると、ここに残ります。"}</div>{latestPhoto && <div className="flex items-center gap-3 rounded-xl bg-white/85 p-3"><img src={latestPhoto.imageUrl} alt={latestPhoto.description || latestPhoto.fileName} className="h-12 w-12 rounded-lg object-cover" /><div className="min-w-0"><span className="flex items-center gap-1 text-xs font-semibold text-violet-700"><Image className="h-3.5 w-3.5" />最新の写真</span><p className="line-clamp-2 text-xs text-slate-600">{latestPhoto.description || latestPhoto.fileName}</p></div></div>}<p className="flex items-center gap-1 text-[10px] text-slate-500"><Sparkles className="h-3 w-3 text-violet-400" />気持ち・写真・ことばを家族の思い出として振り返れます。</p></div>}</CardContent></Card>;
}
