import { useState } from "react";
import { CheckCircle2, HeartHandshake, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";

export function FamilyCheckIn({ familyGroupId }: { familyGroupId: number }) {
  const [note, setNote] = useState("");
  const [completedAt, setCompletedAt] = useState<Date | null>(null);
  const checkIn = trpc.checkIn.send.useMutation({
    onSuccess: () => {
      setNote("");
      setCompletedAt(new Date());
      toast.success("家族へ「大丈夫」を届けました");
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <Card className="border-0 bg-gradient-to-br from-emerald-50 via-white to-sky-50 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base text-slate-800"><HeartHandshake className="h-5 w-5 text-emerald-500" />安心チェックイン</CardTitle>
        <p className="text-xs text-slate-500">ひとタップで「大丈夫」を共有し、保護者へ静かな通知を届けます。</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input value={note} maxLength={120} onChange={(event) => setNote(event.target.value)} placeholder="ひとこと添える（任意）" className="bg-white" />
        <Button className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={checkIn.isPending} onClick={() => checkIn.mutate({ familyGroupId, note: note || undefined })}>
          {checkIn.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          大丈夫を家族に知らせる
        </Button>
        {completedAt && <p className="flex items-center justify-center gap-1 text-xs font-medium text-emerald-700"><CheckCircle2 className="h-4 w-4" />{completedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}に共有済み</p>}
      </CardContent>
    </Card>
  );
}
