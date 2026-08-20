import { useState } from "react";
import { Heart, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

const stamps = ["💐", "🌷", "✨", "🫶"];

export function FamilyGratitudeRelay({ familyGroupId }: { familyGroupId: number }) {
  const [message, setMessage] = useState("");
  const [stamp, setStamp] = useState(stamps[0]);
  const send = trpc.gratitude.send.useMutation({ onSuccess: () => { setMessage(""); toast.success("ありがとうを届けました"); }, onError: (error) => toast.error(error.message) });
  return <Card className="border-0 bg-gradient-to-br from-rose-50 via-white to-amber-50 shadow-md"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base text-slate-800"><Heart className="h-5 w-5 fill-rose-500 text-rose-500" />ありがとうリレー</CardTitle><p className="text-xs text-slate-500">日常の小さな感謝を、家族へそっと届けよう。</p></CardHeader><CardContent className="space-y-3"><div className="flex gap-2">{stamps.map((item) => <button key={item} type="button" onClick={() => setStamp(item)} className={`rounded-xl px-3 py-2 text-lg transition-transform active:scale-95 ${stamp === item ? "bg-rose-100 ring-2 ring-rose-300" : "bg-white shadow-sm"}`}>{item}</button>)}</div><Input value={message} onChange={(event) => setMessage(event.target.value)} maxLength={140} placeholder="例：いつも送り迎えありがとう" /><Button className="w-full bg-rose-500 hover:bg-rose-600" disabled={!message.trim() || send.isPending} onClick={() => send.mutate({ familyGroupId, message, stamp })}>{send.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}感謝を送る</Button></CardContent></Card>;
}
