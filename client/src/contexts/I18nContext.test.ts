import { describe, expect, it } from "vitest";
import { messages, supportedLanguages } from "./I18nContext";

describe("KizunaSync localization", () => {
  it("supports Japanese, English, Simplified Chinese, and Korean", () => {
    expect(supportedLanguages).toEqual(["ja", "en", "zh", "ko"]);
  });

  it("contains the core assistant and notification labels in every language", () => {
    for (const language of supportedLanguages) {
      expect(messages[language]["family.assistant"]).toBeTruthy();
      expect(messages[language]["family.notifications"]).toBeTruthy();
      expect(messages[language]["common.language"]).toBeTruthy();
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
    }
  });
});
