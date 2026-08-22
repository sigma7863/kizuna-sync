import { CheckCircle2, HeartHandshake, Loader2, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/contexts/I18nContext";
import { trpc } from "@/lib/trpc";

export function FamilyCheckIn({ familyGroupId }: { familyGroupId: number }) {
  const { t, language } = useI18n();
  const [note, setNote] = useState("");
  const [completedAt, setCompletedAt] = useState<Date | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const checkIn = trpc.checkIn.send.useMutation({
    onSuccess: () => {
      setNote("");
      setCompletedAt(new Date());
      setStatusMessage(t("family.checkInShared"));
      toast.success(t("family.checkInShared"));
    },
    onError: () => {
      const message = t("family.checkInFailed");
      setStatusMessage(message);
      toast.error(message);
    },
  });
  const status = checkIn.isPending ? t("family.checkInSubmitting") : statusMessage;

  return (
    <Card className="border-0 bg-gradient-to-br from-emerald-50 via-white to-sky-50 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base text-slate-800"><HeartHandshake className="h-5 w-5 text-emerald-500" aria-hidden="true" />{t("family.checkInTitle")}</CardTitle>
        <p className="text-xs text-slate-500">{t("family.checkInDescription")}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input value={note} maxLength={120} onChange={(event) => setNote(event.target.value)} placeholder={t("family.checkInNote")} aria-label={t("family.checkInNote")} className="bg-white" />
        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600" disabled={checkIn.isPending || familyGroupId <= 0} aria-describedby="family-checkin-status" onClick={() => checkIn.mutate({ familyGroupId, note: note || undefined })}>
          {checkIn.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="mr-2 h-4 w-4" aria-hidden="true" />}
          {checkIn.isPending ? t("family.checkInSubmitting") : t("family.checkInSubmit")}
        </Button>
        <p id="family-checkin-status" className="min-h-5 text-center text-xs font-medium text-emerald-700" role="status" aria-live="polite">
          {status}{completedAt && !checkIn.isPending ? ` ${t("family.checkInSharedAt").replace("{time}", completedAt.toLocaleTimeString(language, { hour: "2-digit", minute: "2-digit" }))}` : ""}
        </p>
        {completedAt && <p className="flex items-center justify-center gap-1 text-xs font-medium text-emerald-700"><CheckCircle2 className="h-4 w-4" aria-hidden="true" />{t("family.checkInSharedAt").replace("{time}", completedAt.toLocaleTimeString(language, { hour: "2-digit", minute: "2-digit" }))}</p>}
      </CardContent>
    </Card>
  );
}
