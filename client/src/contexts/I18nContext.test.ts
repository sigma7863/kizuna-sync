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
    }
  });
});
