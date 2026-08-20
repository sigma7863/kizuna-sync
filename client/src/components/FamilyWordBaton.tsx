import { useState } from "react";
import { Loader2, MessageCircleHeart, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

export function FamilyWordBaton({ familyGroupId }: { familyGroupId: number }) {
  const [content, setContent] = useState(""); const utils = trpc.useUtils();
  const { data: entries = [] } = trpc.wordBaton.list.useQuery({ familyGroupId }, { enabled: familyGroupId > 0, refetchInterval: 30_000 });
  const add = trpc.wordBaton.add.useMutation({ onSuccess: () => { setContent(""); return utils.wordBaton.list.invalidate({ familyGroupId }); } });
  return <Card className="border-0 bg-gradient-to-br from-yellow-50 via-white to-orange-50 shadow-md"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><MessageCircleHeart className="h-5 w-5 text-orange-500" />ことばのバトン</CardTitle><p className="text-xs text-slate-500">今日よかったことを一言ずつ、家族へつなごう。</p></CardHeader><CardContent className="space-y-3"><div className="flex gap-2"><Input value={content} onChange={(event) => setContent(event.target.value)} placeholder="今日うれしかったこと" maxLength={180} /><Button size="icon" disabled={!content.trim() || add.isPending} onClick={() => add.mutate({ familyGroupId, content })}>{add.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}</Button></div><div className="space-y-2">{entries.slice(0, 4).map((entry) => <p key={entry.id} className="rounded-xl bg-white/85 p-3 text-xs text-slate-700">{entry.content}</p>)}{entries.length === 0 && <p className="rounded-xl border border-dashed border-orange-200 p-3 text-center text-xs text-slate-500">最初の一言をつないでみましょう。</p>}</div></CardContent></Card>;
}
