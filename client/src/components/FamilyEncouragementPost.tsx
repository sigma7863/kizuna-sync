import { useState } from "react";
import { Heart, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getEncouragementSummary } from "@shared/familyEncouragement";

const stamps = ["🌷", "✨", "🫶", "🌈"];

export function FamilyEncouragementPost({ familyGroupId }: { familyGroupId: number }) {
  const utils = trpc.useUtils();
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [stamp, setStamp] = useState(stamps[0]);
  const [recipientUserId, setRecipientUserId] = useState("");
  const { data: posts = [], isLoading } = trpc.encouragements.list.useQuery({ familyGroupId }, { enabled: familyGroupId > 0 });
  const { data: members = [] } = trpc.family.getMembers.useQuery({ familyGroupId }, { enabled: familyGroupId > 0 });
  const create = trpc.encouragements.create.useMutation({ onSuccess: async () => { setMessage(""); setStamp(stamps[0]); setRecipientUserId(""); await utils.encouragements.list.invalidate({ familyGroupId }); } });
  const nameMap = new Map(members.map((member) => [member.users.id, member.users.name ?? "家族"]));
  const summary = getEncouragementSummary(posts, user?.id ?? -1);

  return <Card className="border-0 bg-gradient-to-br from-pink-50 via-white to-rose-50 shadow-md"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Heart className="h-5 w-5 fill-pink-500 text-pink-500"/>家族のほめことばポスト</CardTitle><p className="text-xs text-slate-500">がんばりや思いやりを、短い言葉で届けよう。</p></CardHeader><CardContent className="space-y-3"><div className="rounded-xl bg-white/80 p-3"><div className="mb-2 flex gap-2">{stamps.map((item) => <button key={item} type="button" onClick={() => setStamp(item)} className={`rounded-xl px-3 py-1.5 text-base ${stamp === item ? "bg-pink-100 ring-2 ring-pink-300" : "bg-white shadow-sm"}`}>{item}</button>)}</div><Input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="例：今日の発表、よくがんばったね" maxLength={180}/><select value={recipientUserId} onChange={(event) => setRecipientUserId(event.target.value)} className="mt-2 h-9 w-full rounded-md border bg-white px-3 text-sm"><option value="">家族みんなへ</option>{members.filter((member) => member.users.id !== user?.id).map((member) => <option key={member.users.id} value={member.users.id}>{member.users.name ?? "家族"}へ</option>)}</select><Button size="sm" className="mt-2 w-full bg-pink-500 hover:bg-pink-600" disabled={!message.trim() || create.isPending} onClick={() => create.mutate({ familyGroupId, message, stamp, recipientUserId: recipientUserId ? Number(recipientUserId) : undefined })}>{create.isPending ? <Loader2 className="mr-1 h-4 w-4 animate-spin"/> : <><Send className="mr-1 h-4 w-4"/>ほめことばを届ける</>}</Button></div>{isLoading ? <p className="py-3 text-center text-xs text-pink-700">ほめことばを読み込み中です…</p> : <><p className="text-[11px] text-pink-700">あなた宛て {summary.addressedToMe} 件 / みんなの言葉 {summary.total} 件</p><div className="grid gap-2">{posts.slice(0, 4).map((post) => <article key={post.id} className="rounded-xl bg-white p-3 shadow-sm"><p className="text-sm text-slate-700"><span className="mr-1">{post.stamp || "✨"}</span>{post.message}</p><p className="mt-1 text-[11px] text-slate-500">{nameMap.get(post.senderUserId) ?? "家族"}から{post.recipientUserId ? ` ${nameMap.get(post.recipientUserId) ?? "家族"}へ` : " 家族みんなへ"}</p></article>)}{posts.length === 0 && <p className="rounded-xl border border-dashed border-pink-200 p-3 text-center text-xs text-slate-500">小さな「よかったね」を最初に届けてみましょう。</p>}</div></>}</CardContent></Card>;
}
