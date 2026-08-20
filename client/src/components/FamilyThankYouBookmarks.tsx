import { useMemo, useState } from "react";
import { BookHeart, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { groupThanksByDay } from "@shared/familyDailyCare";

export function FamilyThankYouBookmarks({ familyGroupId }: { familyGroupId: number }) {
  const utils = trpc.useUtils(); const [message, setMessage] = useState("");
  const { data: bookmarks = [], isLoading } = trpc.thankYouBookmarks.list.useQuery({ familyGroupId }, { enabled: familyGroupId > 0 });
  const create = trpc.thankYouBookmarks.create.useMutation({ onSuccess: async () => { setMessage(""); await utils.thankYouBookmarks.list.invalidate({ familyGroupId }); } });
  const countsByDay = useMemo(() => groupThanksByDay(bookmarks), [bookmarks]);
  return <Card className="border-0 bg-gradient-to-br from-pink-50 via-white to-amber-50 shadow-md"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><BookHeart className="h-5 w-5 text-pink-600"/>家族の今日のありがとう栞</CardTitle><p className="text-xs text-slate-500">今日の感謝を日付ごとに束ね、あとから読み返そう。</p></CardHeader><CardContent className="space-y-3"><div className="rounded-xl bg-white/80 p-3"><Input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="例：話を聞いてくれてありがとう" maxLength={240}/><Button size="sm" className="mt-2 w-full bg-pink-500 hover:bg-pink-600" disabled={!message.trim() || create.isPending} onClick={() => create.mutate({ familyGroupId, message })}>{create.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin"/> : <><Plus className="mr-1 h-4 w-4"/>ありがとうを栞にする</>}</Button></div>{isLoading ? <p className="py-3 text-center text-xs text-pink-700">ありがとう栞を読み込み中です…</p> : <><p className="text-[11px] text-pink-700">記録した日：{Object.keys(countsByDay).length}日</p><div className="grid gap-2">{bookmarks.slice(0, 6).map((bookmark) => <article key={bookmark.id} className="rounded-xl bg-white p-3 shadow-sm"><p className="text-xs text-slate-700">{bookmark.message}</p><p className="mt-1 text-[11px] text-pink-700">{new Date(bookmark.createdAt).toLocaleDateString()} · この日 {countsByDay[new Date(bookmark.createdAt).toISOString().slice(0, 10)]}件</p></article>)}{bookmarks.length === 0 && <p className="rounded-xl border border-dashed border-pink-200 p-3 text-center text-xs text-slate-500">最初の「ありがとう」を、今日の栞に残してみましょう。</p>}</div></>}</CardContent></Card>;
}
