import { CheckCircle2, Eye, HeartHandshake, Loader2, Send, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/contexts/I18nContext";
import { trpc } from "@/lib/trpc";
import { composeFamilyCheckInNote, familyCheckInStatuses, type FamilyCheckInStatus } from "@shared/familyCheckIn";

const checkInStatusLabelKeys: Record<FamilyCheckInStatus, "family.checkInStatusOkay" | "family.checkInStatusRest" | "family.checkInStatusAvailable"> = {
  okay: "family.checkInStatusOkay",
  rest: "family.checkInStatusRest",
  available: "family.checkInStatusAvailable",
};

export function FamilyCheckIn({ familyGroupId }: { familyGroupId: number }) {
  const { t, language } = useI18n();
  const [note, setNote] = useState("");
  const [checkInStatus, setCheckInStatus] = useState<FamilyCheckInStatus>("okay");
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
  const checkInStatusLabel = t(checkInStatusLabelKeys[checkInStatus]);
  const preview = composeFamilyCheckInNote(checkInStatus, checkInStatusLabel, note) ?? t("family.checkInStatusOkay");
  const sendCheckIn = () => checkIn.mutate({
    familyGroupId,
    status: checkInStatus,
    note: composeFamilyCheckInNote(checkInStatus, checkInStatusLabel, note),
  });

  return (
    <Card id="family-check-in" className="border-0 bg-gradient-to-br from-emerald-50 via-white to-sky-50 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base text-slate-800"><HeartHandshake className="h-5 w-5 text-emerald-500" aria-hidden="true" />{t("family.checkInTitle")}</CardTitle>
        <p className="text-xs text-slate-500">{t("family.checkInDescription")}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div role="radiogroup" aria-label={t("family.checkInStatusHelp")} className="grid grid-cols-3 gap-1.5">
          {familyCheckInStatuses.map((option) => (
            <button key={option} type="button" role="radio" aria-checked={checkInStatus === option} onClick={() => setCheckInStatus(option)} className={`rounded-lg px-2 py-2 text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${checkInStatus === option ? "bg-emerald-100 text-emerald-900 ring-1 ring-emerald-400" : "bg-white text-slate-700 shadow-sm"}`}>{t(checkInStatusLabelKeys[option])}</button>
          ))}
        </div>
        <Input value={note} maxLength={120} onChange={(event) => setNote(event.target.value)} placeholder={t("family.checkInNote")} aria-label={t("family.checkInNote")} aria-describedby="family-checkin-selected family-checkin-preview family-checkin-status" className="bg-white" />
        <p id="family-checkin-selected" className="text-xs text-emerald-800" aria-live="polite">{checkInStatusLabel}</p>
        <section id="family-checkin-preview" aria-live="polite" aria-atomic="true" className="rounded-xl border border-emerald-100 bg-white/85 px-3 py-2.5 text-sm text-slate-700 shadow-sm">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800"><Eye className="h-3.5 w-3.5" aria-hidden="true" />{t("family.checkInPreviewTitle")}</p>
          <p className="mt-1 break-words font-medium">{preview}</p>
          <p className="mt-1.5 flex items-start gap-1.5 text-xs leading-relaxed text-slate-500"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />{t("family.checkInPrivacy")}</p>
        </section>
        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-600" disabled={checkIn.isPending || familyGroupId <= 0} aria-describedby="family-checkin-selected family-checkin-preview family-checkin-status" onClick={sendCheckIn}>
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
