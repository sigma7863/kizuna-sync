import { Contrast, Eye, Type } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/contexts/I18nContext";
import { getDisplayScalePercent, type DisplayScale } from "@shared/familyAccessibility";

type DisplayPreferences = { scale: DisplayScale; highContrast: boolean; reduceMotion: boolean };

const storageKey = "kizunasync-display-preferences";
const defaultPreferences: DisplayPreferences = { scale: "standard", highContrast: false, reduceMotion: false };
const scaleLabelKeys: Record<DisplayScale, "family.displaySizeStandard" | "family.displaySizeLarge" | "family.displaySizeXLarge"> = {
  standard: "family.displaySizeStandard",
  large: "family.displaySizeLarge",
  xlarge: "family.displaySizeXLarge",
};

export function FamilyDisplaySettings() {
  const { t } = useI18n();
  const [preferences, setPreferences] = useState<DisplayPreferences>(defaultPreferences);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) setPreferences({ ...defaultPreferences, ...JSON.parse(stored) });
    } catch { /* Keep accessible defaults. */ }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize = `${getDisplayScalePercent(preferences.scale)}%`;
    root.classList.toggle("a11y-high-contrast", preferences.highContrast);
    root.classList.toggle("a11y-reduced-motion", preferences.reduceMotion);
    try { window.localStorage.setItem(storageKey, JSON.stringify(preferences)); } catch { /* Settings remain for this visit. */ }
  }, [preferences]);

  const announce = (setting: string, value: string) => setStatusMessage(t("family.displayUpdated").replace("{setting}", setting).replace("{value}", value));
  const updateScale = (scale: DisplayScale) => {
    setPreferences((current) => ({ ...current, scale }));
    announce(t("family.displayTextSize"), t(scaleLabelKeys[scale]));
  };
  const toggleHighContrast = () => {
    const next = !preferences.highContrast;
    setPreferences((current) => ({ ...current, highContrast: next }));
    announce(t("family.displayHighContrast"), t(next ? "family.displayEnabled" : "family.displayDisabled"));
  };
  const toggleReducedMotion = () => {
    const next = !preferences.reduceMotion;
    setPreferences((current) => ({ ...current, reduceMotion: next }));
    announce(t("family.displayReducedMotion"), t(next ? "family.displayEnabled" : "family.displayDisabled"));
  };

  return (
    <Card className="border-0 bg-gradient-to-br from-slate-50 via-white to-cyan-50 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base"><Eye className="h-5 w-5 text-cyan-700" aria-hidden="true" />{t("family.displaySettingsTitle")}</CardTitle>
        <p className="text-xs text-slate-500">{t("family.displaySettingsDescription")}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-700"><Type className="h-3.5 w-3.5" aria-hidden="true" />{t("family.displayTextSize")}</p>
          <div role="radiogroup" aria-label={t("family.displayTextSize")} className="grid grid-cols-3 gap-1.5">
            {(["standard", "large", "xlarge"] as DisplayScale[]).map((scale) => (
              <button key={scale} type="button" role="radio" aria-checked={preferences.scale === scale} onClick={() => updateScale(scale)} className={`rounded-lg px-2 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 ${preferences.scale === scale ? "bg-cyan-700 text-white" : "bg-white text-slate-700 shadow-sm"}`}>{t(scaleLabelKeys[scale])}</button>
            ))}
          </div>
        </div>
        <button type="button" aria-pressed={preferences.highContrast} onClick={toggleHighContrast} className={`flex w-full items-center justify-between rounded-lg p-2.5 text-left text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 ${preferences.highContrast ? "bg-slate-900 text-white" : "bg-white text-slate-700 shadow-sm"}`}><span className="flex items-center gap-2"><Contrast className="h-4 w-4" aria-hidden="true" />{t("family.displayHighContrast")}</span><span>{t(preferences.highContrast ? "family.displayEnabled" : "family.displayDisabled")}</span></button>
        <button type="button" aria-pressed={preferences.reduceMotion} onClick={toggleReducedMotion} className={`flex w-full items-center justify-between rounded-lg p-2.5 text-left text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 ${preferences.reduceMotion ? "bg-slate-800 text-white" : "bg-white text-slate-700 shadow-sm"}`}><span>{t("family.displayReducedMotion")}</span><span>{t(preferences.reduceMotion ? "family.displayEnabled" : "family.displayDisabled")}</span></button>
        <p className="sr-only" aria-live="polite">{statusMessage}</p>
      </CardContent>
    </Card>
  );
}
