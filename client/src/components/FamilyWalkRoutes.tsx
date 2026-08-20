import { useState } from "react";
import { Loader2, MapPinned, Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { formatWalkRouteEstimate, normalizeRouteHighlights } from "@shared/familyWellness";

export function FamilyWalkRoutes({ familyGroupId }: { familyGroupId: number }) {
  const utils = trpc.useUtils();
  const [title, setTitle] = useState("");
  const [startPoint, setStartPoint] = useState("");
  const [description, setDescription] = useState("");
  const [highlights, setHighlights] = useState("");
  const [distanceKm, setDistanceKm] = useState("1.0");
  const [durationMin, setDurationMin] = useState("20");
  const [safetyNote, setSafetyNote] = useState("");
  const { data: routes = [], isLoading } = trpc.walkRoutes.list.useQuery({ familyGroupId }, { enabled: familyGroupId > 0 });
  const create = trpc.walkRoutes.create.useMutation({
    onSuccess: async () => {
      setTitle(""); setStartPoint(""); setDescription(""); setHighlights(""); setDistanceKm("1.0"); setDurationMin("20"); setSafetyNote("");
      await utils.walkRoutes.list.invalidate({ familyGroupId });
    },
  });
  const canSubmit = title.trim() && startPoint.trim() && Number(distanceKm) > 0 && Number(durationMin) > 0;

  return <Card className="border-0 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 shadow-md"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><MapPinned className="h-5 w-5 text-emerald-600"/>おすすめ散歩コース</CardTitle><p className="text-xs text-slate-500">歩いてよかった道と、安心できる寄り道を家族へ。</p></CardHeader><CardContent className="space-y-3"><div className="grid gap-2 rounded-xl bg-white/80 p-3"><Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="コース名（例：川沿いの夕方さんぽ）" maxLength={160}/><Input value={startPoint} onChange={(event) => setStartPoint(event.target.value)} placeholder="スタート地点" maxLength={180}/><Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="おすすめの理由（任意）" maxLength={500} className="min-h-16"/><Input value={highlights} onChange={(event) => setHighlights(event.target.value)} placeholder="見どころ（例：ベンチ、図書館、花壇）" maxLength={500}/><div className="grid grid-cols-2 gap-2"><Input type="number" min="0.1" max="99.99" step="0.1" value={distanceKm} onChange={(event) => setDistanceKm(event.target.value)} aria-label="距離（km）"/><Input type="number" min="1" max="1440" value={durationMin} onChange={(event) => setDurationMin(event.target.value)} aria-label="所要時間（分）"/></div><Input value={safetyNote} onChange={(event) => setSafetyNote(event.target.value)} placeholder="安心メモ（例：横断歩道はここを使う）" maxLength={280}/><Button size="sm" disabled={!canSubmit || create.isPending} onClick={() => create.mutate({ familyGroupId, title, startPoint, description, highlights, distanceKm: Number(distanceKm), durationMin: Number(durationMin), safetyNote })}>{create.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin"/> : <><Plus className="mr-1 h-4 w-4"/>コースを共有</>}</Button></div>{isLoading ? <p className="py-3 text-center text-xs text-emerald-700">散歩コースを読み込み中です…</p> : <div className="grid gap-2">{routes.map((route) => <article key={route.id} className="rounded-xl bg-white p-3 shadow-sm"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-slate-800">{route.title}</p><p className="mt-0.5 text-xs text-emerald-700">{route.startPoint} · {formatWalkRouteEstimate(route.distanceKm, route.durationMin)}</p></div><MapPinned className="h-4 w-4 shrink-0 text-emerald-500"/></div>{route.description && <p className="mt-2 text-xs text-slate-600">{route.description}</p>}{normalizeRouteHighlights(route.highlights ?? "").length > 0 && <div className="mt-2 flex flex-wrap gap-1">{normalizeRouteHighlights(route.highlights ?? "").map((highlight) => <span key={highlight} className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">{highlight}</span>)}</div>}{route.safetyNote && <p className="mt-2 flex gap-1 text-[11px] text-slate-600"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-600"/>{route.safetyNote}</p>}</article>)}{routes.length === 0 && <p className="rounded-xl border border-dashed border-emerald-200 p-3 text-center text-xs text-slate-500">お気に入りの散歩道を最初に共有してみましょう。</p>}</div>}</CardContent></Card>;
}
