import { useEffect, useState } from "react";
import { Eye, HeartPulse, Loader2, MapPin, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useI18n } from "@/contexts/I18nContext";
import { trpc } from "@/lib/trpc";
import { defaultFamilySharingPreferences, getActiveFamilySharingCount, type FamilySharingPreferences } from "@shared/familySharing";

type SharingField = keyof FamilySharingPreferences;

const sharingItems: Array<{ key: SharingField; icon: typeof MapPin; labelKey: "family.sharingLocation" | "family.sharingHealth" | "family.sharingCheckIn"; detailKey: "family.sharingLocationDetail" | "family.sharingHealthDetail" | "family.sharingCheckInDetail" }> = [
  { key: "shareLocation", icon: MapPin, labelKey: "family.sharingLocation", detailKey: "family.sharingLocationDetail" },
  { key: "shareHealth", icon: HeartPulse, labelKey: "family.sharingHealth", detailKey: "family.sharingHealthDetail" },
  { key: "shareCheckIn", icon: Eye, labelKey: "family.sharingCheckIn", detailKey: "family.sharingCheckInDetail" },
];

export function FamilySharingControls({ familyGroupId, currentUserRole }: { familyGroupId: number; currentUserRole: "guardian" | "child" | "elderly" }) {
  const { t } = useI18n();
  const utils = trpc.useUtils();
  const { data } = trpc.sharingPreferences.getMine.useQuery({ familyGroupId }, { enabled: familyGroupId > 0 });
  const { data: summary = [] } = trpc.sharingPreferences.getGuardianSummary.useQuery({ familyGroupId }, { enabled: familyGroupId > 0 && currentUserRole === "guardian" });
  const [preferences, setPreferences] = useState<FamilySharingPreferences>(defaultFamilySharingPreferences);
  const [status, setStatus] = useState("");
  useEffect(() => { if (data) setPreferences({ shareLocation: data.shareLocation, shareHealth: data.shareHealth, shareCheckIn: data.shareCheckIn }); }, [data]);
  const update = trpc.sharingPreferences.updateMine.useMutation({
    onSuccess: async () => { setStatus(t("family.sharingSaved")); await Promise.all([utils.sharingPreferences.getMine.invalidate({ familyGroupId }), utils.sharingPreferences.getGuardianSummary.invalidate({ familyGroupId })]); },
    onError: () => { setStatus(t("family.sharingFailed")); },
  });
  const updatePreference = (key: SharingField, checked: boolean) => {
    const next = { ...preferences, [key]: checked };
    setPreferences(next);
    setStatus(t("family.sharingSaving"));
    update.mutate({ familyGroupId, ...next });
  };

  return <Card className="border-0 bg-gradient-to-br from-indigo-50 via-white to-sky-50 shadow-md"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-base text-indigo-950"><ShieldCheck className="h-5 w-5 text-indigo-600" aria-hidden="true" />{t("family.sharingTitle")}</CardTitle><p className="text-xs leading-relaxed text-slate-600">{t("family.sharingDescription")}</p></CardHeader><CardContent className="space-y-3">{sharingItems.map(({ key, icon: Icon, labelKey, detailKey }) => <div key={key} className="flex items-center justify-between gap-3 rounded-xl border border-indigo-100 bg-white/80 p-3"><div className="flex min-w-0 items-start gap-3"><Icon className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" aria-hidden="true" /><div><p className="text-sm font-semibold text-slate-800">{t(labelKey)}</p><p className="mt-0.5 text-xs leading-relaxed text-slate-500">{t(detailKey)}</p></div></div><Switch checked={preferences[key]} disabled={update.isPending} onCheckedChange={(checked) => updatePreference(key, checked)} aria-label={`${t(labelKey)}: ${preferences[key] ? t("family.sharingActive") : t("family.sharingPaused")}`} /> </div>)}<p className="min-h-5 text-center text-xs font-medium text-indigo-700" role="status" aria-live="polite">{update.isPending && <Loader2 className="mr-1 inline h-3.5 w-3.5 animate-spin" aria-hidden="true" />}{status}</p>{currentUserRole === "guardian" && <section className="rounded-xl border border-sky-100 bg-sky-50/70 p-3" aria-label={t("family.sharingGuardianSummary")}><p className="text-sm font-semibold text-sky-950">{t("family.sharingGuardianSummary")}</p><p className="mt-0.5 text-xs leading-relaxed text-slate-600">{t("family.sharingGuardianDescription")}</p><ul className="mt-2 grid gap-1.5">{summary.map((member) => <li key={member.userId} className="flex items-center justify-between gap-2 rounded-lg bg-white px-2.5 py-2 text-xs text-slate-700"><span className="truncate font-medium">{member.name}</span><span className="shrink-0 text-sky-700">{t("family.sharingSignalCount").replace("{count}", String(getActiveFamilySharingCount(member.preferences ?? defaultFamilySharingPreferences)))}</span></li>)}</ul></section>}</CardContent></Card>;
}
