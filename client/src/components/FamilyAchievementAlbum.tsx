import { useState } from "react";
import { Award, Loader2, Plus, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { getAchievementCategoryLabel, type AchievementCategory } from "@shared/familyMorningRhythm";

export function FamilyAchievementAlbum({ familyGroupId }: { familyGroupId: number }) {
  const utils = trpc.useUtils();
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState<AchievementCategory>("help");
  const { data: entries = [], isLoading } = trpc.achievements.list.useQuery({ familyGroupId }, { enabled: familyGroupId > 0 });
  const create = trpc.achievements.create.useMutation({ onSuccess: async () => { setTitle(""); setNote(""); setCategory("help"); await utils.achievements.list.invalidate({ familyGroupId }); } });
  const thisMonth = new Date().getMonth();
  const thisMonthCount = entries.filter((entry) => new Date(entry.createdAt).getMonth() === thisMonth).length;

  return <Card className="border-0 bg-gradient-to-br from-yellow-50 via-white to-amber-50 shadow-md"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Trophy className="h-5 w-5 text-amber-600"/>家族の小さな達成アルバム</CardTitle><p className="text-xs text-slate-500">できたことを月ごとに振り返り、次の一歩の励みに。</p></CardHeader><CardContent className="space-y-3"><div className="grid gap-2 rounded-xl bg-white/80 p-3"><div className="grid grid-cols-[minmax(0,1fr)_6rem] gap-2"><Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="できたこと" maxLength={160}/><select value={category} onChange={(event) => setCategory(event.target.value as AchievementCategory)} className="h-9 rounded-md border bg-white px-2 text-sm"><option value="help">お手伝い</option><option value="movement">からだ</option><option value="challenge">挑戦</option><option value="other">ほか</option></select></div><Input value={note} onChange={(event) => setNote(event.target.value)} placeholder="ひとこと（任意）" maxLength={240}/><Button size="sm" disabled={!title.trim() || create.isPending} onClick={() => create.mutate({ familyGroupId, title, category, note })}>{create.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin"/> : <><Plus className="mr-1 h-4 w-4"/>達成を残す</>}</Button></div>{isLoading ? <p className="py-3 text-center text-xs text-amber-700">達成を読み込み中です…</p> : <><p className="flex items-center gap-1 text-xs font-medium text-amber-700"><Award className="h-4 w-4"/>今月の小さな達成：{thisMonthCount}件</p><div className="grid gap-2">{entries.slice(0, 6).map((entry) => <article key={entry.id} className="rounded-xl bg-white p-3 shadow-sm"><p className="text-sm font-semibold text-slate-800">{entry.title}</p><p className="mt-0.5 text-[11px] text-amber-700">{getAchievementCategoryLabel(entry.category)} · {new Date(entry.createdAt).toLocaleDateString()}</p>{entry.note && <p className="mt-1 text-xs text-slate-600">{entry.note}</p>}</article>)}{entries.length === 0 && <p className="rounded-xl border border-dashed border-amber-200 p-3 text-center text-xs text-slate-500">今日できた小さなことを、最初の一枚に残してみましょう。</p>}</div></>}</CardContent></Card>;
}
