import { History, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/contexts/I18nContext";
import { trpc } from "@/lib/trpc";
import type { FamilyCheckInStatus } from "@shared/familyCheckIn";
import { formatFamilyDateTime } from "@shared/familyLocale";

const statusKeys: Record<FamilyCheckInStatus, "family.checkInStatusOkay" | "family.checkInStatusRest" | "family.checkInStatusAvailable"> = {
  okay: "family.checkInStatusOkay",
  rest: "family.checkInStatusRest",
  available: "family.checkInStatusAvailable",
};

export function FamilyCheckInHistory({ familyGroupId, currentUserRole }: { familyGroupId: number; currentUserRole: "guardian" | "child" | "elderly" }) {
  const { language, t } = useI18n();
  const { data: ownHistory = [] } = trpc.checkIn.getMine.useQuery({ familyGroupId }, { enabled: familyGroupId > 0 });
  const { data: guardianSummary = [] } = trpc.checkIn.getGuardianSummary.useQuery({ familyGroupId }, { enabled: familyGroupId > 0 && currentUserRole === "guardian" });
  const formatTime = (value: Date) => formatFamilyDateTime(value, language);

  return <Card className="border-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50 shadow-md"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base text-emerald-950"><History className="h-5 w-5 text-emerald-600" aria-hidden="true" />{t("family.checkInHistoryTitle")}</CardTitle><p className="text-xs leading-relaxed text-slate-600">{t("family.checkInHistoryDescription")}</p></CardHeader><CardContent className="space-y-3"><section aria-label={t("family.checkInHistoryPersonalTitle")}><p className="mb-1.5 text-xs font-semibold text-emerald-900">{t("family.checkInHistoryPersonalTitle")}</p>{ownHistory.length === 0 ? <p className="rounded-lg bg-white/80 px-3 py-2 text-xs text-slate-500">{t("family.checkInHistoryEmpty")}</p> : <ul className="space-y-1.5">{ownHistory.map((entry) => <li key={entry.id} className="flex items-center justify-between gap-3 rounded-lg bg-white/80 px-3 py-2 text-xs text-slate-700"><span className="font-medium">{t(statusKeys[entry.status])}</span><time className="shrink-0 text-slate-500" dateTime={new Date(entry.createdAt).toISOString()}>{formatTime(entry.createdAt)}</time></li>)}</ul>}</section>{currentUserRole === "guardian" && <section className="rounded-xl border border-teal-100 bg-teal-50/70 p-3" aria-label={t("family.checkInHistoryGuardianTitle")}><p className="flex items-center gap-1.5 text-xs font-semibold text-teal-950"><ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />{t("family.checkInHistoryGuardianTitle")}</p>{guardianSummary.length === 0 ? <p className="mt-1.5 text-xs text-slate-500">{t("family.checkInHistoryGuardianEmpty")}</p> : <ul className="mt-2 space-y-1.5">{guardianSummary.map((member) => <li key={member.userId} className="flex items-center justify-between gap-2 rounded-lg bg-white px-2.5 py-2 text-xs text-slate-700"><span className="truncate font-medium">{member.name}</span>{member.latest ? <span className="shrink-0 text-teal-800">{t(statusKeys[member.latest.status])} · {formatTime(member.latest.createdAt)}</span> : <span className="shrink-0 text-slate-400">{t("family.checkInHistoryNoSharedStatus")}</span>}</li>)}</ul>}</section>}<p className="rounded-lg bg-emerald-100/60 px-3 py-2 text-xs leading-relaxed text-emerald-900" role="note">{t("family.checkInHistoryPrivacy")}</p></CardContent></Card>;
}
