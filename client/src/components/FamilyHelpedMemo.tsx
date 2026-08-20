import { useState } from "react";
import { HandHeart, Loader2, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { countHelpedMemos } from "@shared/familyEveningRhythm";

export function FamilyHelpedMemo({ familyGroupId }: { familyGroupId: number }) {
  const utils = trpc.useUtils(); const [helperNote, setHelperNote] = useState(""); const [reaction, setReaction] = useState("ありがとう");
  const { data: memos = [], isLoading } = trpc.helpedMemos.list.useQuery({ familyGroupId }, { enabled: familyGroupId > 0 });
  const create = trpc.helpedMemos.create.useMutation({ onSuccess: async () => { setHelperNote(""); await utils.helpedMemos.list.invalidate({ familyGroupId }); } });
  return <Card className="border-0 bg-gradient-to-br from-amber-50 via-white to-orange-50 shadow-md"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><HandHeart className="h-5 w-5 text-orange-600"/>家族の助かったメモ</CardTitle><p className="text-xs text-slate-500">日常の「助かった」を言葉にして、感謝の会話を育てよう。</p></CardHeader><CardContent className="space-y-3"><p className="text-xs font-medium text-orange-700"><Sparkles className="mr-1 inline h-4 w-4"/>この家族の「助かった」：{countHelpedMemos(memos)}件</p><div className="grid gap-2 rounded-xl bg-white/80 p-3"><Input value={helperNote} onChange={(event) => setHelperNote(event.target.value)} placeholder="例：洗濯物を取り込んでくれて助かった" maxLength={280}/><div className="flex gap-2"><Input value={reaction} onChange={(event) => setReaction(event.target.value)} placeholder="ありがとう" maxLength={80}/><Button size="sm" disabled={!helperNote.trim() || create.isPending} onClick={() => create.mutate({ familyGroupId, helperNote, reaction })}>{create.isPending ? <Loader2 className="h-4 w-4 animate-spin"/> : <><Plus className="mr-1 h-4 w-4"/>残す</>}</Button></div></div>{isLoading ? <p className="py-3 text-center text-xs text-orange-700">助かったメモを読み込み中です…</p> : <div className="grid gap-2">{memos.slice(0, 4).map((memo) => <article key={memo.id} className="rounded-xl bg-white p-3 shadow-sm"><p className="text-sm font-semibold text-slate-800">{memo.helperNote}</p>{memo.reaction && <p className="mt-1 text-xs text-orange-700">{memo.reaction}</p>}</article>)}{memos.length === 0 && <p className="rounded-xl border border-dashed border-orange-200 p-3 text-center text-xs text-slate-500">当たり前に見える助けにも、一言のありがとうを残してみましょう。</p>}</div>}</CardContent></Card>;
}
