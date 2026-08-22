import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, MapPinned, Phone, ShieldCheck, Trash2, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/contexts/I18nContext";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { trpc } from "@/lib/trpc";
import { getEmergencyAccessCacheKey, getEmergencyAccessContacts, getSafePhoneHref, type EmergencyAccessContact } from "@shared/familyEmergencyAccess";
import type { FamilyContactRole } from "@shared/familyContacts";

interface FamilyEmergencyAssistProps {
  familyGroupId: number;
  currentUserRole: FamilyContactRole;
}

function readSavedContacts(cacheKey: string): EmergencyAccessContact[] {
  try {
    const stored = window.localStorage.getItem(cacheKey);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is EmergencyAccessContact => (
      typeof item === "object" && item !== null &&
      typeof (item as EmergencyAccessContact).id === "number" &&
      typeof (item as EmergencyAccessContact).label === "string" &&
      typeof (item as EmergencyAccessContact).phone === "string" &&
      typeof (item as EmergencyAccessContact).category === "string"
    ));
  } catch {
    return [];
  }
}

export function FamilyEmergencyAssist({ familyGroupId, currentUserRole }: FamilyEmergencyAssistProps) {
  const { t } = useI18n();
  const { isOnline } = useOfflineSync();
  const cacheKey = getEmergencyAccessCacheKey(familyGroupId, currentUserRole);
  const { data: contacts = [] } = trpc.familyContacts.list.useQuery({ familyGroupId });
  const [savedContacts, setSavedContacts] = useState<EmergencyAccessContact[]>(() => readSavedContacts(cacheKey));
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [contactToCall, setContactToCall] = useState<EmergencyAccessContact | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const isElderlyMode = currentUserRole === "elderly";

  const visibleContacts = useMemo(
    () => getEmergencyAccessContacts(contacts, currentUserRole),
    [contacts, currentUserRole],
  );
  const displayedContacts = isOnline || visibleContacts.length ? visibleContacts : savedContacts;
  const hasOfflineCopy = savedContacts.length > 0;

  useEffect(() => {
    setSavedContacts(readSavedContacts(cacheKey));
  }, [cacheKey]);

  const saveForOffline = () => {
    window.localStorage.setItem(cacheKey, JSON.stringify(visibleContacts));
    setSavedContacts(visibleContacts);
    setSaveDialogOpen(false);
    setAnnouncement(t("family.emergencySaved"));
  };

  const removeOfflineCopy = () => {
    window.localStorage.removeItem(cacheKey);
    setSavedContacts([]);
    setAnnouncement(t("family.emergencyRemoved"));
  };

  return (
    <Card className="border-2 border-rose-300 bg-rose-50 shadow-md" aria-labelledby="family-emergency-assist-title">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-rose-700 p-2 text-white" aria-hidden="true"><AlertTriangle className="h-6 w-6" /></div>
          <div className="min-w-0">
            <CardTitle id="family-emergency-assist-title" className={isElderlyMode ? "text-xl font-bold text-slate-950" : "text-lg font-bold text-slate-950"}>{t("family.emergencyTitle")}</CardTitle>
            <CardDescription className={isElderlyMode ? "mt-1 text-base leading-relaxed text-slate-800" : "mt-1 text-sm leading-relaxed text-slate-700"}>{t("family.emergencyDescription")}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {!isOnline && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-400 bg-amber-100 p-3 text-sm font-medium text-amber-950" role="status" aria-live="polite">
            <WifiOff className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <span>{hasOfflineCopy ? t("family.emergencyOfflineReady") : t("family.emergencyOfflineMissing")}</span>
          </div>
        )}
        <div className="flex items-center justify-between gap-2">
          <p className={isElderlyMode ? "text-base font-bold text-slate-900" : "text-sm font-semibold text-slate-900"}>{t("family.emergencyContacts")}</p>
          {hasOfflineCopy ? <ShieldCheck className="h-5 w-5 text-emerald-700" aria-label={t("family.emergencySavedBadge")} /> : null}
        </div>
        {displayedContacts.length ? (
          <div className="space-y-2">
            {displayedContacts.map((contact) => {
              const evacuation = contact.category === "避難場所";
              return (
                <Button
                  key={contact.id}
                  type="button"
                  variant="outline"
                  onClick={() => evacuation ? setAnnouncement(`${contact.label} ${t("family.emergencyEvacuationSelected")}`) : setContactToCall(contact)}
                  className={`h-auto w-full justify-between border-2 border-slate-700 bg-white px-4 py-3 text-left text-slate-950 hover:bg-rose-100 focus-visible:ring-4 focus-visible:ring-rose-700 ${isElderlyMode ? "min-h-20 text-lg" : "min-h-16 text-base"}`}
                >
                  <span className="flex min-w-0 items-center gap-3"><span className="rounded-full bg-slate-900 p-2 text-white" aria-hidden="true">{evacuation ? <MapPinned className="h-5 w-5" /> : <Phone className="h-5 w-5" />}</span><span className="min-w-0"><span className="block font-bold">{contact.label}</span><span className="block text-sm font-medium text-slate-700">{contact.category}</span></span></span>
                  <span className="shrink-0 text-sm font-bold text-rose-800">{evacuation ? t("family.emergencyView") : t("family.emergencyCall")}</span>
                </Button>
              );
            })}
          </div>
        ) : <p className="rounded-xl bg-white p-4 text-sm text-slate-800">{t("family.emergencyNoContacts")}</p>}
        <div className="rounded-xl border border-slate-300 bg-white p-3">
          <p className="text-sm font-semibold text-slate-900">{t("family.emergencyOfflineTitle")}</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-700">{t("family.emergencyOfflineDescription")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => setSaveDialogOpen(true)} disabled={!visibleContacts.length} className="min-h-11 border border-slate-400 bg-white text-slate-950 hover:bg-slate-100">{t("family.emergencySave")}</Button>
            {hasOfflineCopy && <Button type="button" variant="outline" onClick={removeOfflineCopy} className="min-h-11 border-slate-500 text-slate-950 hover:bg-slate-100"><Trash2 className="mr-1.5 h-4 w-4" />{t("family.emergencyRemove")}</Button>}
          </div>
        </div>
        <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
      </CardContent>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent aria-describedby="family-emergency-save-description">
          <DialogHeader><DialogTitle>{t("family.emergencySaveConfirmTitle")}</DialogTitle><DialogDescription id="family-emergency-save-description">{t("family.emergencySaveConfirmDescription")}</DialogDescription></DialogHeader>
          <DialogFooter><Button type="button" variant="outline" onClick={() => setSaveDialogOpen(false)}>{t("common.cancel")}</Button><Button type="button" onClick={saveForOffline} className="bg-rose-700 text-white hover:bg-rose-800">{t("family.emergencySaveConfirm")}</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={contactToCall !== null} onOpenChange={(open) => !open && setContactToCall(null)}>
        <DialogContent aria-describedby="family-emergency-call-description">
          <DialogHeader><DialogTitle>{t("family.emergencyCallConfirmTitle")}</DialogTitle><DialogDescription id="family-emergency-call-description">{t("family.emergencyCallConfirmDescription").replace("{name}", contactToCall?.label ?? "")}</DialogDescription></DialogHeader>
          <DialogFooter><Button type="button" variant="outline" onClick={() => setContactToCall(null)}>{t("common.cancel")}</Button>{contactToCall && <Button asChild className="bg-rose-700 text-white hover:bg-rose-800"><a href={getSafePhoneHref(contactToCall.phone)} onClick={() => setContactToCall(null)}><Phone className="mr-1.5 h-4 w-4" />{t("family.emergencyCallConfirm")}</a></Button>}</DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
