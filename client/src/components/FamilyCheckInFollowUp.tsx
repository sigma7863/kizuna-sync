import { HeartHandshake, Loader2, Send, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/contexts/I18nContext";
import { trpc } from "@/lib/trpc";
import { getCheckInFollowUpMessageKey, getLatestCheckInFollowUp } from "@shared/familyCheckInFollowUp";
import type { FamilyMemberRole } from "@shared/familyAccessibility";
import type { FamilyCheckInStatus } from "@shared/familyCheckIn";

const statusLabelKeys: Record<Exclude<FamilyCheckInStatus, "okay">, "family.checkInStatusRest" | "family.checkInStatusAvailable"> = {
  rest: "family.checkInStatusRest",
  available: "family.checkInStatusAvailable",
};

export function FamilyCheckInFollowUp({ familyGroupId, currentUserId, currentUserRole }: { familyGroupId: number; currentUserId?: number; currentUserRole: FamilyMemberRole }) {
  const { t } = useI18n();
  const utils = trpc.useUtils();
  const [statusMessage, setStatusMessage] = useState("");
  const { data: timeline = [], isLoading } = trpc.timeline.getFamilyTimeline.useQuery({ familyGroupId, limit: 20 }, { enabled: familyGroupId > 0 });
  const { data: members = [] } = trpc.family.getMembers.useQuery({ familyGroupId }, { enabled: familyGroupId > 0 });
  const candidate = useMemo(() => getLatestCheckInFollowUp(timeline, currentUserId), [timeline, currentUserId]);
  const recipient = members.find((member) => member.users.id === candidate?.userId);
  const recipientName = recipient?.users.name ?? t("family.checkInFollowUpFamily");
  const followUpMessage = candidate ? t(getCheckInFollowUpMessageKey(candidate.status, currentUserRole)) : "";
  const create = trpc.careMessages.create.useMutation({
    onSuccess: async () => {
      setStatusMessage(t("family.checkInFollowUpSent"));
      await utils.careMessages.list.invalidate({ familyGroupId });
    },
    onError: () => setStatusMessage(t("family.checkInFollowUpFailed")),
  });
  const send = () => {
    if (!candidate) return;
    create.mutate({ familyGroupId, recipientUserId: candidate.userId, message: followUpMessage });
  };

  return (
    <Card className="border-0 bg-gradient-to-br from-rose-50 via-white to-amber-50 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base text-slate-800"><HeartHandshake className="h-5 w-5 text-rose-500" aria-hidden="true" />{t("family.checkInFollowUpTitle")}</CardTitle>
        <p className="text-xs text-slate-500">{t("family.checkInFollowUpDescription")}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? <p className="py-3 text-center text-xs text-rose-700">{t("family.checkInFollowUpLoading")}</p> : candidate ? <>
          <section className="rounded-xl border border-rose-100 bg-white/85 p-3" aria-labelledby="family-checkin-followup-target">
            <p id="family-checkin-followup-target" className="text-sm font-semibold text-rose-800">{t("family.checkInFollowUpTarget").replace("{name}", recipientName)}</p>
            <p className="mt-1 text-xs text-slate-600">{t(statusLabelKeys[candidate.status])}</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">{followUpMessage}</p>
          </section>
          <p className="flex items-start gap-1.5 text-xs leading-relaxed text-slate-500"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-600" aria-hidden="true" />{t("family.checkInFollowUpPrivacy")}</p>
          <Button className="w-full bg-rose-500 hover:bg-rose-600 focus-visible:ring-2 focus-visible:ring-rose-600" disabled={create.isPending || !currentUserId} aria-describedby="family-checkin-followup-target family-checkin-followup-status" onClick={send}>
            {create.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="mr-2 h-4 w-4" aria-hidden="true" />}
            {create.isPending ? t("family.checkInFollowUpSending") : t("family.checkInFollowUpSend")}
          </Button>
        </> : <p className="rounded-xl border border-dashed border-rose-200 bg-white/70 p-3 text-center text-xs leading-relaxed text-slate-500">{t("family.checkInFollowUpNone")}</p>}
        <p id="family-checkin-followup-status" className="min-h-5 text-center text-xs font-medium text-rose-700" role="status" aria-live="polite">{statusMessage}</p>
      </CardContent>
    </Card>
  );
}
