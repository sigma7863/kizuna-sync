import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useI18n } from "@/contexts/I18nContext";
import { MAIN_CONTENT_ID, shouldAnnounceRouteChange } from "@shared/a11yNavigation";

export function AccessibilityNavigation() {
  const { t } = useI18n();
  const [location] = useLocation();
  const announcementRef = useRef<HTMLParagraphElement>(null);
  const previousLocationRef = useRef<string | null>(null);

  useEffect(() => {
    if (announcementRef.current && shouldAnnounceRouteChange(previousLocationRef.current, location)) {
      announcementRef.current.textContent = t("a11y.routeChanged");
    }
    previousLocationRef.current = location;
  }, [location, t]);

  const focusMainContent = () => {
    window.requestAnimationFrame(() => {
      const main = document.getElementById(MAIN_CONTENT_ID) ?? document.querySelector<HTMLElement>("main");
      if (!main) return;
      if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
      main.focus({ preventScroll: true });
    });
  };

  return <>
    <a className="skip-link" href={`#${MAIN_CONTENT_ID}`} onClick={focusMainContent}>{t("a11y.skipMain")}</a>
    <p ref={announcementRef} className="sr-only" aria-live="polite" aria-atomic="true" />
  </>;
}
