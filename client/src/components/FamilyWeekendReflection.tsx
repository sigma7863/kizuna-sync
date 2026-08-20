import { useState } from "react";
import { Heart, Loader2, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { getWeekKey } from "@shared/familyWeeklyCare";

export function FamilyWeekendReflection({ familyGroupId }: { familyGroupId: number }) {
  const utils = trpc.useUtils(); const weekKey = getWeekKey(); const [goodThing, setGoodThing] = useState(""); const [nextHope, setNextHope] = useState("");
  const { data: entries = [], isLoading } = trpc.weekendReflections.list.useQuery({ familyGroupId, weekKey }, { enabled: familyGroupId > 0 });
  const create = trpc.weekendReflections.create.useMutation({ onSuccess: async () => { setGoodThing(""); setNextHope(""); await utils.weekendReflections.list.invalidate({ familyGroupId, weekKey }); } });
  return <Card className="border-0 bg-gradient-to-br from-pink-50 via-white to-amber-50 shadow-md"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Heart className="h-5 w-5 fill-pink-500 text-pink-500"/>家族の週末ふりかえりカード</CardTitle><p className="text-xs text-slate-500">今週のよかったことと、来週の小さな楽しみを残そう。</p></CardHeader><CardContent className="space-y-3"><div className="grid gap-2 rounded-xl bg-white/80 p-3"><Input value={goodThing} onChange={(event) => setGoodThing(event.target.value)} placeholder="今週よかったこと" maxLength={280}/><Input value={nextHope} onChange={(event) => setNextHope(event.target.value)} placeholder="来週楽しみにしたいこと（任意）" maxLength={280}/><Button size="sm" disabled={!goodThing.trim() || create.isPending} onClick={() => create.mutate({ familyGroupId, weekKey, goodThing, nextHope })}>{create.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin"/> : <><Plus className="mr-1 h-4 w-4"/>ふりかえる</>}</Button></div>{isLoading ? <p className="py-3 text-center text-xs text-pink-700">ふりかえりを読み込み中です…</p> : <div className="grid gap-2">{entries.map((entry) => <article key={entry.id} className="rounded-xl bg-white p-3 shadow-sm"><p className="flex gap-1 text-sm font-semibold text-slate-800"><Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-pink-600"/>{entry.goodThing}</p>{entry.nextHope && <p className="mt-2 text-xs text-pink-700">来週：{entry.nextHope}</p>}</article>)}{entries.length === 0 && <p className="rounded-xl border border-dashed border-pink-200 p-3 text-center text-xs text-slate-500">今週の小さな「よかった」を一つ残してみましょう。</p>}</div>}</CardContent></Card>;
}
