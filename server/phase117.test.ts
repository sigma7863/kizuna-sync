import { describe, expect, it } from "vitest";
import { getEmergencyAccessCacheKey, getEmergencyAccessContacts, getSafePhoneHref } from "../shared/familyEmergencyAccess";

describe("phase 117 emergency access contracts", () => {
  const contacts = [
    { id: 1, label: "あんしん病院", phone: "03-1234-5678", category: "かかりつけ先" },
    { id: 2, label: "家族の緊急連絡", phone: "+81 (90) 1234-5678", category: "緊急" },
    { id: 3, label: "地域避難所", phone: "03 1111 2222", category: "避難場所" },
  ];

  it("keeps children on least-disclosure emergency contacts and orders urgent actions first", () => {
    expect(getEmergencyAccessContacts(contacts, "child")).toEqual([contacts[1]]);
    expect(getEmergencyAccessContacts(contacts, "elderly").map((contact) => contact.id)).toEqual([2, 3, 1]);
  });

  it("scopes offline copies by family and role and normalizes telephone URIs", () => {
    expect(getEmergencyAccessCacheKey(42, "elderly")).toBe("kizuna-sync-emergency-access:42:elderly");
    expect(getSafePhoneHref("+81 (90) 1234-5678")).toBe("tel:+819012345678");
  });
});
