import { FamilyCareReplies } from "@/components/FamilyCareReplies";
import { FamilyConsultationCard } from "@/components/FamilyConsultationCard";
import { FamilyDailyQuestion } from "@/components/FamilyDailyQuestion";
import { FamilyEncouragementStamps } from "@/components/FamilyEncouragementStamps";
import { FamilyHomePreparation } from "@/components/FamilyHomePreparation";
import { FamilyMonthlyGoals } from "@/components/FamilyMonthlyGoals";
import { FamilyPhotoCaption } from "@/components/FamilyPhotoCaption";
import { FamilyQuietTimeSignal } from "@/components/FamilyQuietTimeSignal";
import { FamilySeasonalIdeas } from "@/components/FamilySeasonalIdeas";

export function FamilyAdditionalDailyTools({ familyGroupId }: { familyGroupId: number }) {
  return <>
    <div className="mb-6 grid gap-4 md:grid-cols-3"><FamilyMonthlyGoals familyGroupId={familyGroupId}/><FamilyPhotoCaption familyGroupId={familyGroupId}/><FamilyQuietTimeSignal familyGroupId={familyGroupId}/></div>
    <div className="mb-6 grid gap-4 md:grid-cols-3"><FamilyConsultationCard familyGroupId={familyGroupId}/><FamilySeasonalIdeas familyGroupId={familyGroupId}/><FamilyCareReplies familyGroupId={familyGroupId}/></div>
    <div className="mb-6 grid gap-4 md:grid-cols-3"><FamilyDailyQuestion familyGroupId={familyGroupId}/><FamilyHomePreparation familyGroupId={familyGroupId}/><FamilyEncouragementStamps familyGroupId={familyGroupId}/></div>
  </>;
}
