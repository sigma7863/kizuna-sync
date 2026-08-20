import { useState } from "react";
import { HeartHandshake, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { getCareReplyCount } from "@shared/familySupportCircle";

const reactions = ["🫶", "ありがとう", "安心した", "助かった"];

export function FamilyCareReplies({ familyGroupId }: { familyGroupId: number }) {
  const utils = trpc.useUtils(); const [reaction, setReaction] = useState(reactions[0]); const [message, setMessage] = useState("");
  const { data: replies = [], isLoading } = trpc.careReplies.list.useQuery({ familyGroupId }, { enabled: familyGroupId > 0 });
  const create = trpc.careReplies.create.useMutation({ onSuccess: async () => { setReaction(reactions[0]); setMessage(""); await utils.careReplies.list.invalidate({ familyGroupId }); } });
  return <Card className="border-0 bg-gradient-to-br from-pink-50 via-white to-orange-50 shadow-md"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><HeartHandshake className="h-5 w-5 text-pink-600"/>家族の見守りありがとう返信</CardTitle><p className="text-xs text-slate-500">安全チェックや気遣いに、短い反応で安心を返そう。</p></CardHeader><CardContent className="space-y-3"><div className="rounded-xl bg-white/80 p-3"><div className="flex flex-wrap gap-1.5">{reactions.map((item) => <button key={item} type="button" onClick={() => setReaction(item)} className={`rounded-full px-2.5 py-1 text-xs ${reaction === item ? "bg-pink-100 text-pink-800 ring-2 ring-pink-300" : "bg-white text-slate-600 shadow-sm"}`}>{item}</button>)}</div><Input className="mt-2" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="ひとこと（任意）" maxLength={180}/><Button size="sm" className="mt-2 w-full bg-pink-500 hover:bg-pink-600" disabled={create.isPending} onClick={() => create.mutate({ familyGroupId, reaction, message })}>{create.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin"/> : <><Send className="mr-1 h-4 w-4"/>安心を返す</>}</Button></div>{isLoading ? <p className="py-3 text-center text-xs text-pink-700">返信を読み込み中です…</p> : <><p className="text-[11px] text-pink-700">これまでの安心返信：{getCareReplyCount(replies)}件</p><div className="grid gap-2">{replies.slice(0, 5).map((reply) => <article key={reply.id} className="rounded-xl bg-white p-3 shadow-sm"><p className="text-sm font-semibold text-pink-800">{reply.reaction}</p>{reply.message && <p className="mt-1 text-xs text-slate-600">{reply.message}</p>}<p className="mt-1 text-[11px] text-slate-400">{new Date(reply.createdAt).toLocaleString()}</p></article>)}{replies.length === 0 && <p className="rounded-xl border border-dashed border-pink-200 p-3 text-center text-xs text-slate-500">気遣ってもらったことへ、小さな安心を返してみましょう。</p>}</div></>}</CardContent></Card>;
}
