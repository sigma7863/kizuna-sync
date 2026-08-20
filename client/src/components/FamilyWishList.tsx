import { useState } from "react";
import { Check, Loader2, MapPinned, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { getWishCategoryLabel, type WishCategory } from "@shared/familyEncouragement";

const statusLabel = { wish: "いつか", candidate: "週末候補", done: "かなった" } as const;

export function FamilyWishList({ familyGroupId }: { familyGroupId: number }) {
  const utils = trpc.useUtils();
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState<WishCategory>("activity");
  const { data: items = [], isLoading } = trpc.wishList.list.useQuery({ familyGroupId }, { enabled: familyGroupId > 0 });
  const create = trpc.wishList.create.useMutation({ onSuccess: async () => { setTitle(""); setNote(""); setCategory("activity"); await utils.wishList.list.invalidate({ familyGroupId }); } });
  const updateStatus = trpc.wishList.updateStatus.useMutation({ onSuccess: () => utils.wishList.list.invalidate({ familyGroupId }) });

  return <Card className="border-0 bg-gradient-to-br from-teal-50 via-white to-cyan-50 shadow-md"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><MapPinned className="h-5 w-5 text-teal-600"/>家族のやってみたいリスト</CardTitle><p className="text-xs text-slate-500">行きたい場所や挑戦を貯めて、次のおでかけ候補に。</p></CardHeader><CardContent className="space-y-3"><div className="grid gap-2 rounded-xl bg-white/80 p-3"><div className="grid grid-cols-[minmax(0,1fr)_7rem] gap-2"><Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="やってみたいこと" maxLength={160}/><select value={category} onChange={(event) => setCategory(event.target.value as WishCategory)} className="h-9 rounded-md border bg-white px-2 text-sm"><option value="place">場所</option><option value="activity">やること</option><option value="challenge">挑戦</option><option value="other">ほか</option></select></div><Input value={note} onChange={(event) => setNote(event.target.value)} placeholder="ひとこと（任意）" maxLength={240}/><Button size="sm" disabled={!title.trim() || create.isPending} onClick={() => create.mutate({ familyGroupId, title, note, category })}>{create.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin"/> : <><Plus className="mr-1 h-4 w-4"/>リストに追加</>}</Button></div>{isLoading ? <p className="py-3 text-center text-xs text-teal-700">リストを読み込み中です…</p> : <div className="grid gap-2">{items.map((item) => <article key={item.id} className="rounded-xl bg-white p-3 shadow-sm"><div className="flex items-start justify-between gap-2"><div><p className="text-sm font-semibold text-slate-800">{item.title}</p><p className="mt-0.5 text-[11px] text-teal-700">{getWishCategoryLabel(item.category)} · {statusLabel[item.status]}</p>{item.note && <p className="mt-1 text-xs text-slate-600">{item.note}</p>}</div><div className="flex flex-col gap-1">{item.status === "wish" && <Button size="sm" variant="outline" disabled={updateStatus.isPending} onClick={() => updateStatus.mutate({ familyGroupId, itemId: item.id, status: "candidate" })}><Sparkles className="mr-1 h-3.5 w-3.5"/>候補</Button>}{item.status !== "done" && <Button size="sm" variant="outline" disabled={updateStatus.isPending} onClick={() => updateStatus.mutate({ familyGroupId, itemId: item.id, status: "done" })}><Check className="mr-1 h-3.5 w-3.5"/>かなった</Button>}</div></div></article>)}{items.length === 0 && <p className="rounded-xl border border-dashed border-teal-200 p-3 text-center text-xs text-slate-500">いつかやってみたいことを、まず一つ書いてみましょう。</p>}</div>}</CardContent></Card>;
}
