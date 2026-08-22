import { visibleFamilyContacts, type FamilyContactCategory, type FamilyContactRole } from "./familyContacts";

export interface EmergencyAccessContact {
  id: number;
  label: string;
  phone: string;
  category: FamilyContactCategory;
}

const CATEGORY_PRIORITY: Record<string, number> = {
  緊急: 0,
  避難場所: 1,
  かかりつけ先: 2,
};

/**
 * 緊急時に表示してよい連絡先だけを役割別に絞り込み、行動の優先順へ並べる。
 * 子どもには現在地や医療情報を含むカードを表示せず、緊急連絡先だけに限定する。
 */
export function getEmergencyAccessContacts(
  contacts: EmergencyAccessContact[],
  role: FamilyContactRole,
): EmergencyAccessContact[] {
  return [...visibleFamilyContacts(contacts, role)].sort((left, right) => {
    const priorityDifference = (CATEGORY_PRIORITY[left.category] ?? 3) - (CATEGORY_PRIORITY[right.category] ?? 3);
    return priorityDifference || left.label.localeCompare(right.label, "ja");
  });
}

export function getEmergencyAccessCacheKey(familyGroupId: number, role: FamilyContactRole) {
  return `kizuna-sync-emergency-access:${familyGroupId}:${role}`;
}

export function getSafePhoneHref(phone: string) {
  return `tel:${phone.replace(/[^+\d]/g, "")}`;
}
