import { useState } from "react";
import { FamilySharingControls } from "@/components/FamilySharingControls";

interface PrivacySettingsProps {
  familyGroupId: number;
  currentUserRole?: "guardian" | "child" | "elderly";
}

/**
 * プライバシー設定コンポーネント
 * ユーザーが位置情報・アクティビティの共有設定をコントロール
 */
export function PrivacySettings({ familyGroupId, currentUserRole = "guardian" }: PrivacySettingsProps) {
  return <FamilySharingControls familyGroupId={familyGroupId} currentUserRole={currentUserRole} />;
}

export default PrivacySettings;
