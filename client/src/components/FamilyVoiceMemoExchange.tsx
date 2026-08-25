import { useState } from "react";
import { Headphones, Loader2, Mic, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { VoiceMessageRecorder } from "@/components/VoiceMessageRecorder";
import { formatVoiceDuration } from "@shared/familyMorningRhythm";

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onerror = () => reject(new Error("音声を読み込めませんでした")); reader.onload = () => resolve(String(reader.result)); reader.readAsDataURL(blob); });
}

export function FamilyVoiceMemoExchange({ familyGroupId }: { familyGroupId: number }) {
  const utils = trpc.useUtils();
  const [note, setNote] = useState("");
  const [failedVoiceMemo, setFailedVoiceMemo] = useState<{ audioBlob: Blob; durationSeconds: number; errorMessage: string } | null>(null);
  const { data: memos = [], isLoading } = trpc.voiceMemos.list.useQuery({ familyGroupId }, { enabled: familyGroupId > 0 });
  const upload = trpc.voiceMemos.upload.useMutation({ onSuccess: async () => { setNote(""); setFailedVoiceMemo(null); await utils.voiceMemos.list.invalidate({ familyGroupId }); } });
  const handleSend = async (audioBlob: Blob, durationSeconds: number) => {
    try {
      const dataUrl = await blobToDataUrl(audioBlob);
      await upload.mutateAsync({ familyGroupId, dataUrl, mimeType: "audio/webm", durationSeconds, note });
    } catch (error) {
      setFailedVoiceMemo({ audioBlob, durationSeconds, errorMessage: error instanceof Error ? error.message : "ネットワークを確認して、もう一度送信してください。" });
      throw error;
    }
  };

  return <Card className="border-0 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 shadow-md"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base"><Mic className="h-5 w-5 text-violet-600"/>家族の音メモ交換</CardTitle><p className="text-xs text-slate-500">言葉にしにくい気持ちや伝言を、短い声で届けよう。</p></CardHeader><CardContent className="space-y-3"><div className="rounded-xl bg-white/80 p-3"><Input value={note} onChange={(event) => setNote(event.target.value)} placeholder="音メモのひとこと（任意）" maxLength={180}/><div className="mt-2"><VoiceMessageRecorder familyGroupId={familyGroupId} onSend={handleSend}/></div>{upload.isPending && <p className="mt-2 flex items-center text-xs text-violet-700"><Loader2 className="mr-1 h-3.5 w-3.5 animate-spin"/>音メモを保存中です…</p>}{failedVoiceMemo && <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3" role="alert"><p className="text-xs font-semibold text-amber-900">音メモを保存できませんでした</p><p className="mt-1 text-xs leading-relaxed text-amber-800">{failedVoiceMemo.errorMessage}</p><Button type="button" size="sm" variant="outline" className="mt-2 border-amber-300 bg-white text-amber-900" onClick={() => void handleSend(failedVoiceMemo.audioBlob, failedVoiceMemo.durationSeconds)} disabled={upload.isPending}><RotateCcw className="mr-1.5 h-3.5 w-3.5" aria-hidden="true"/>同じ録音を再送</Button></div>}</div>{isLoading ? <p className="py-3 text-center text-xs text-violet-700">音メモを読み込み中です…</p> : <div className="grid gap-2">{memos.map((memo) => <article key={memo.id} className="rounded-xl bg-white p-3 shadow-sm"><div className="flex items-center justify-between gap-2"><p className="flex items-center gap-1 text-xs font-semibold text-violet-700"><Headphones className="h-4 w-4"/>音メモ · {formatVoiceDuration(memo.durationSeconds)}</p><span className="text-[11px] text-slate-400">{new Date(memo.createdAt).toLocaleDateString()}</span></div>{memo.note && <p className="mt-1 text-xs text-slate-600">{memo.note}</p>}<audio controls preload="metadata" className="mt-2 h-8 w-full"><source src={memo.audioUrl} type={memo.mimeType}/></audio></article>)}{memos.length === 0 && <p className="rounded-xl border border-dashed border-violet-200 p-3 text-center text-xs text-slate-500">最初の短い音メモを家族に届けてみましょう。</p>}</div>}</CardContent></Card>;
}
