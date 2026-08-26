import { describe, expect, it } from "vitest";
import { messages, supportedLanguages } from "./I18nContext";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const contextSource = readFileSync(resolve(process.cwd(), "client/src/contexts/I18nContext.tsx"), "utf8");

describe("KizunaSync localization", () => {
  it("supports Japanese, English, Simplified Chinese, and Korean", () => {
    expect(supportedLanguages).toEqual(["ja", "en", "zh", "ko"]);
  });

  it("uses a safe Japanese fallback when a transient provider boundary is unavailable", () => {
    expect(contextSource).toContain("const fallbackI18nContext");
    expect(contextSource).toContain("return value ?? fallbackI18nContext");
  });

  it("keeps the same translation keys in every supported language", () => {
    const japaneseKeys = Object.keys(messages.ja).sort();
    for (const language of supportedLanguages) {
      expect(Object.keys(messages[language]).sort()).toEqual(japaneseKeys);
    }
  });

  it("contains the core assistant and notification labels in every language", () => {
    for (const language of supportedLanguages) {
      expect(messages[language]["family.assistant"]).toBeTruthy();
      expect(messages[language]["family.notifications"]).toBeTruthy();
      expect(messages[language]["common.language"]).toBeTruthy();
    }
  });

  it("contains home loading and family-presence guidance in every language", () => {
    for (const language of supportedLanguages) {
      expect(messages[language]["home.loading"]).toBeTruthy();
      expect(messages[language]["home.featureRipple"]).toBeTruthy();
    }
  });

  it("contains family tab sharing and status guidance in every language", () => {
    for (const language of supportedLanguages) {
      expect(messages[language]["family.album"]).toBeTruthy();
      expect(messages[language]["family.shareFeature"]).toBeTruthy();
      expect(messages[language]["family.preparingFeature"]).toContain("{tab}");
      expect(messages[language]["family.shareText"]).toContain("{tab}");
      expect(messages[language]["family.tabKeyboardHelp"]).toBeTruthy();
      expect(messages[language]["family.sharedCardOpened"]).toBeTruthy();
      expect(messages[language]["family.motionReducedNavigation"]).toBeTruthy();
      expect(messages[language]["family.showingNow"]).toBeTruthy();
      expect(messages[language]["family.openFeature"]).toBeTruthy();
      expect(messages[language]["family.focusCurrentFeature"]).toBeTruthy();
      expect(messages[language]["family.tabHelpText"]).toBeTruthy();
      expect(messages[language]["family.jumpFirstFeature"]).toBeTruthy();
      expect(messages[language]["family.jumpLastFeature"]).toBeTruthy();
      expect(messages[language]["family.centerCurrentFeature"]).toBeTruthy();
      expect(messages[language]["family.currentFeatureCentered"]).toBeTruthy();
      expect(messages[language]["family.currentFeaturePosition"]).toContain("{current}");
      expect(messages[language]["family.skipToCurrentContent"]).toBeTruthy();
      expect(messages[language]["family.chooseFeature"]).toBeTruthy();
      expect(messages[language]["family.recentFeatures"]).toBeTruthy();
      expect(messages[language]["family.pinnedFeatures"]).toBeTruthy();
      expect(messages[language]["family.pinFeature"]).toBeTruthy();
      expect(messages[language]["family.unpinFeature"]).toBeTruthy();
      expect(messages[language]["family.searchFeatures"]).toBeTruthy();
      expect(messages[language]["family.searchFeaturesPlaceholder"]).toBeTruthy();
      expect(messages[language]["family.noMatchingFeatures"]).toBeTruthy();
      expect(messages[language]["family.searchResultsCount"]).toContain("{count}");
      expect(messages[language]["family.clearSearch"]).toBeTruthy();
      expect(messages[language]["family.recommendedFeatures"]).toBeTruthy();
      expect(messages[language]["family.addRecommendation"]).toBeTruthy();
      expect(messages[language]["family.removeRecommendation"]).toBeTruthy();
      expect(messages[language]["family.resetRecommendations"]).toBeTruthy();
      expect(messages[language]["family.shareRecommendations"]).toBeTruthy();
      expect(messages[language]["family.safetyLauncher"]).toBeTruthy();
      expect(messages[language]["family.safetyLauncherDescription"]).toBeTruthy();
      expect(messages[language]["family.dailyRhythm"]).toBeTruthy();
      expect(messages[language]["family.dailyRhythmMorning"]).toBeTruthy();
      expect(messages[language]["family.dailyRhythmDaytime"]).toBeTruthy();
      expect(messages[language]["family.dailyRhythmEvening"]).toBeTruthy();
      expect(messages[language]["family.energyMeter"]).toBeTruthy();
      expect(messages[language]["family.energyMeterDescription"]).toBeTruthy();
      expect(messages[language]["family.energyLevel1"]).toBeTruthy();
      expect(messages[language]["family.energyLevel5"]).toBeTruthy();
      expect(messages[language]["family.shareEnergy"]).toBeTruthy();
      expect(messages[language]["family.energyPrivacy"]).toBeTruthy();
      expect(messages[language]["family.widgetTitle"]).toBeTruthy();
      expect(messages[language]["family.widgetRealtime"]).toBeTruthy();
      expect(messages[language]["family.widgetLocationEmpty"]).toBeTruthy();
      expect(messages[language]["family.widgetRippleShared"]).toContain("{name}");
      expect(messages[language]["family.widgetOpenSafety"]).toBeTruthy();
      expect(messages[language]["family.widgetOpenAssistant"]).toBeTruthy();
      expect(messages[language]["family.widgetOpenAlbum"]).toBeTruthy();
      expect(messages[language]["family.displaySettingsTitle"]).toBeTruthy();
      expect(messages[language]["family.displayTextSize"]).toBeTruthy();
      expect(messages[language]["family.displaySizeXLarge"]).toBeTruthy();
      expect(messages[language]["family.displayUpdated"]).toContain("{setting}");
      expect(messages[language]["family.checkInTitle"]).toBeTruthy();
      expect(messages[language]["family.checkInSubmit"]).toBeTruthy();
      expect(messages[language]["family.checkInSubmitting"]).toBeTruthy();
      expect(messages[language]["family.checkInSharedAt"]).toContain("{time}");
      expect(messages[language]["family.checkInFailed"]).toBeTruthy();
      expect(messages[language]["family.checkInStatusHelp"]).toBeTruthy();
      expect(messages[language]["family.checkInStatusOkay"]).toBeTruthy();
      expect(messages[language]["family.checkInStatusRest"]).toBeTruthy();
      expect(messages[language]["family.checkInStatusAvailable"]).toBeTruthy();
      expect(messages[language]["family.checkInPreviewTitle"]).toBeTruthy();
      expect(messages[language]["family.checkInPrivacy"]).toBeTruthy();
      expect(messages[language]["family.checkInFollowUpTitle"]).toBeTruthy();
      expect(messages[language]["family.checkInFollowUpTarget"]).toContain("{name}");
      expect(messages[language]["family.checkInFollowUpFamily"]).toBeTruthy();
      expect(messages[language]["family.checkInFollowUpPrivacy"]).toBeTruthy();
      expect(messages[language]["family.checkInFollowUpRestGuardian"]).toBeTruthy();
      expect(messages[language]["family.checkInFollowUpAvailableElderly"]).toBeTruthy();
      expect(messages[language]["family.careMessageTitle"]).toBeTruthy();
      expect(messages[language]["family.careMessageAllHelp"]).toBeTruthy();
      expect(messages[language]["family.careMessagePrivateHelp"]).toBeTruthy();
      expect(messages[language]["family.careMessageFromTo"]).toContain("{sender}");
      expect(messages[language]["family.careMessageFromTo"]).toContain("{recipient}");
      expect(messages[language]["family.additionalDailyToolsTitle"]).toBeTruthy();
      expect(messages[language]["family.additionalDailyToolsOpen"]).toBeTruthy();
      expect(messages[language]["family.additionalDailyToolsClose"]).toBeTruthy();
      expect(messages[language]["family.additionalDailyToolsLoading"]).toBeTruthy();
      expect(messages[language]["family.sharingTitle"]).toBeTruthy();
      expect(messages[language]["family.sharingLocation"]).toBeTruthy();
      expect(messages[language]["family.sharingGuardianSummary"]).toBeTruthy();
      expect(messages[language]["family.sharingSignalCount"]).toContain("{count}");
      expect(messages[language]["family.checkInHistoryTitle"]).toBeTruthy();
      expect(messages[language]["family.checkInHistoryPrivacy"]).toBeTruthy();
      expect(messages[language]["family.careMessageLater"]).toBeTruthy();
      expect(messages[language]["family.careMessageDeferHelp"]).toBeTruthy();
      expect(messages[language]["family.dailySupportTitle"]).toBeTruthy();
      expect(messages[language]["family.dailySupportCheckInHelp"]).toBeTruthy();
      expect(messages[language]["family.albumTitle"]).toBeTruthy();
      expect(messages[language]["family.albumDownloadStarted"]).toContain("{count}");
      expect(messages[language]["family.albumReactionMessage"]).toBeTruthy();
    }
  });
});
