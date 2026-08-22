import { Battery, BatteryLow, BatteryMedium, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/contexts/I18nContext";
import { trpc } from "@/lib/trpc";
import { getLatestEnergyStatuses, type EnergyLevel } from "@shared/familyEncouragement";

const levels: EnergyLevel[] = [1, 2, 3, 4, 5];

const energyLabelKeys: Record<EnergyLevel, "family.energyLevel1" | "family.energyLevel2" | "family.energyLevel3" | "family.energyLevel4" | "family.energyLevel5"> = {
  1: "family.energyLevel1",
  2: "family.energyLevel2",
  3: "family.energyLevel3",
  4: "family.energyLevel4",
  5: "family.energyLevel5",
};

function BatteryIcon({ level }: { level: number }) {
  if (level <= 2) return <BatteryLow className="h-3.5 w-3.5" aria-hidden="true" />;
  if (level === 3) return <BatteryMedium className="h-3.5 w-3.5" aria-hidden="true" />;
  return <Battery className="h-3.5 w-3.5" aria-hidden="true" />;
}

export function FamilyEnergyMeter({ familyGroupId }: { familyGroupId: number }) {
  const { t, language } = useI18n();
  const utils = trpc.useUtils();
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>(3);
  const [note, setNote] = useState("");
  const { data: statuses = [], isLoading } = trpc.energyStatuses.list.useQuery({ familyGroupId }, { enabled: familyGroupId > 0 });
  const { data: members = [] } = trpc.family.getMembers.useQuery({ familyGroupId }, { enabled: familyGroupId > 0 });
  const share = trpc.energyStatuses.share.useMutation({
    onSuccess: async () => {
      setNote("");
      await utils.energyStatuses.list.invalidate({ familyGroupId });
    },
  });
  const latestByUser = useMemo(() => getLatestEnergyStatuses(statuses), [statuses]);
  const activeEnergyLabel = t(energyLabelKeys[energyLevel]);
  const dateFormatter = useMemo(() => new Intl.DateTimeFormat(language, { hour: "numeric", minute: "2-digit" }), [language]);

  return (
    <Card className="border-0 bg-gradient-to-br from-indigo-50 via-white to-sky-50 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base"><Battery className="h-5 w-5 text-indigo-600" aria-hidden="true" />{t("family.energyMeter")}</CardTitle>
        <p className="text-xs text-slate-500">{t("family.energyMeterDescription")}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-xl bg-white/80 p-3">
          <div role="radiogroup" aria-label={t("family.energyMeter")} className="flex justify-between gap-1">
            {levels.map((level) => {
              const isSelected = energyLevel === level;
              return (
                <button
                  key={level}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  aria-label={t(energyLabelKeys[level])}
                  onClick={() => setEnergyLevel(level)}
                  className={`flex-1 rounded-xl px-1 py-2 text-center text-[11px] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${isSelected ? "bg-indigo-100 text-indigo-800 ring-2 ring-indigo-300" : "bg-white text-slate-500 shadow-sm"}`}
                >
                  <span className="block text-base" aria-hidden="true">{"🔋".repeat(level)}</span>
                  {t(energyLabelKeys[level])}
                </button>
              );
            })}
          </div>
          <p id="family-energy-selection" className="mt-2 text-xs text-indigo-700" aria-live="polite">{activeEnergyLabel}</p>
          <Input className="mt-2" value={note} onChange={(event) => setNote(event.target.value)} placeholder={t("family.energyNote")} aria-label={t("family.energyNote")} maxLength={160} />
          <Button size="sm" className="mt-2 w-full" disabled={share.isPending || familyGroupId <= 0} aria-describedby="family-energy-selection" onClick={() => share.mutate({ familyGroupId, energyLevel, note })}>
            {share.isPending ? <><Loader2 className="mr-1 h-4 w-4 animate-spin" aria-hidden="true" />{t("common.loading")}</> : <><Battery className="mr-1 h-4 w-4" aria-hidden="true" />{t("family.shareEnergy")}</>}
          </Button>
        </div>
        {isLoading ? <p className="py-3 text-center text-xs text-indigo-700" aria-live="polite">{t("family.energyLoading")}</p> : (
          <div className="grid grid-cols-2 gap-2" aria-label={t("family.energyMeter")}>
            {members.map((member) => {
              const status = latestByUser.get(member.users.id);
              const level = status?.energyLevel as EnergyLevel | undefined;
              return (
                <div key={member.users.id} className="rounded-xl bg-white p-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-700" aria-hidden="true">{(member.users.name ?? "?").charAt(0)}</span>
                    <p className="text-xs font-semibold text-slate-700">{member.users.name ?? t("family.unknownUser")}</p>
                  </div>
                  <p className="mt-2 flex items-center gap-1 text-[11px] text-indigo-700">{level ? <><BatteryIcon level={level} />{t(energyLabelKeys[level])}</> : t("family.energyNotShared")}</p>
                  {status?.note && <p className="mt-1 line-clamp-2 text-[11px] text-slate-500">{status.note}</p>}
                  {status?.createdAt && <time className="mt-1 block text-[10px] text-slate-400" dateTime={new Date(status.createdAt).toISOString()}>{dateFormatter.format(new Date(status.createdAt))}</time>}
                </div>
              );
            })}
          </div>
        )}
        <p className="text-[10px] leading-relaxed text-slate-400">{t("family.energyPrivacy")}</p>
      </CardContent>
    </Card>
  );
}
