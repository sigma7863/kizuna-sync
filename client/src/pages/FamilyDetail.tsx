import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Heart, ArrowLeft, Plus, Users, MessageSquare, Camera, Music, MapPin, Smile, Sparkles, Share2, Activity, CalendarClock, Images } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { KizunaRipple } from "@/components/KizunaRipple";
import { SafetyGuardian } from "@/components/SafetyGuardian";
import { AIFeatures } from "@/components/AIFeatures";
import { FamilyStatsDashboard } from "@/components/FamilyStatsDashboard";
import { FamilyNotificationCenter } from "@/components/FamilyNotificationCenter";
import { FamilyAIAssistant } from "@/components/FamilyAIAssistant";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/contexts/I18nContext";
import { FamilyAutomationPanel } from "@/components/FamilyAutomationPanel";
import { WearableHealthSimulator } from "@/components/WearableHealthSimulator";
import { FamilyTrailHeatmap } from "@/components/FamilyTrailHeatmap";
import { FamilyCelebrationComposer } from "@/components/FamilyCelebrationComposer";
import { FamilyDigestAlbum } from "@/components/FamilyDigestAlbum";
import { FamilyCloudAlbum } from "@/components/FamilyCloudAlbum";
import { FamilyQuickWidget } from "@/components/FamilyQuickWidget";
import { FamilyCheckIn } from "@/components/FamilyCheckIn";
import { TodayKizunaHighlights } from "@/components/TodayKizunaHighlights";
import { FamilyHelpBoard } from "@/components/FamilyHelpBoard";
import { FamilyGratitudeRelay } from "@/components/FamilyGratitudeRelay";
import { FamilyWeeklyPulse } from "@/components/FamilyWeeklyPulse";
import { FamilyShoppingList } from "@/components/FamilyShoppingList";
import { FamilyTimeCapsulePanel } from "@/components/FamilyTimeCapsulePanel";
import { FamilyPollPanel } from "@/components/FamilyPollPanel";
import { FamilyEventVote } from "@/components/FamilyEventVote";
import { FamilyConditionBoard } from "@/components/FamilyConditionBoard";
import { FamilyMemoryBookmark } from "@/components/FamilyMemoryBookmark";
import { FamilySafetyChecklist } from "@/components/FamilySafetyChecklist";
import { FamilyCelebrationCalendar } from "@/components/FamilyCelebrationCalendar";
import { FamilyWordBaton } from "@/components/FamilyWordBaton";
import { FamilyContactsPanel } from "@/components/FamilyContactsPanel";
import { FamilyGentleRules } from "@/components/FamilyGentleRules";
import { FamilyWeekendPlanner } from "@/components/FamilyWeekendPlanner";
import { FamilyRoleMap } from "@/components/FamilyRoleMap";
import { FamilyBookshelf } from "@/components/FamilyBookshelf";
import { FamilyOutingPrep } from "@/components/FamilyOutingPrep";
import { FamilyMealRelay } from "@/components/FamilyMealRelay";
import { FamilyCareBoard } from "@/components/FamilyCareBoard";
import { FamilyFunLottery } from "@/components/FamilyFunLottery";
import { FamilyCareMessageBoard } from "@/components/FamilyCareMessageBoard";
import { FamilySharedShelf } from "@/components/FamilySharedShelf";
import { FamilyMonthlyChallenge } from "@/components/FamilyMonthlyChallenge";
import { FamilyMoodSign } from "@/components/FamilyMoodSign";
import { FamilyWalkRoutes } from "@/components/FamilyWalkRoutes";
import { FamilyLearningCards } from "@/components/FamilyLearningCards";
import { FamilyDailyMoment } from "@/components/FamilyDailyMoment";
import { FamilyMovementBingo } from "@/components/FamilyMovementBingo";
import { FamilyTakeHomeNotes } from "@/components/FamilyTakeHomeNotes";
import { FamilyEncouragementPost } from "@/components/FamilyEncouragementPost";
import { FamilyEnergyMeter } from "@/components/FamilyEnergyMeter";
import { FamilyWishList } from "@/components/FamilyWishList";
import { useFamilyRealtime } from "@/hooks/useFamilyRealtime";

export default function FamilyDetail() {
  const params = useParams<{ id: string }>();
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { t } = useI18n();
  const familyGroupId = parseInt(params?.id || "0");

  const [moodText, setMoodText] = useState("");
  const [rippleNotifications, setRippleNotifications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"timeline" | "safety" | "trail" | "ai" | "assistant" | "celebration" | "digest" | "album" | "stats" | "automation" | "health">("timeline");

  useEffect(() => {
    const requestedTab = new URLSearchParams(window.location.search).get("tab");
    const allowedTabs = ["timeline", "safety", "trail", "ai", "assistant", "celebration", "digest", "album", "stats", "automation", "health"] as const;
    if (requestedTab && (allowedTabs as readonly string[]).includes(requestedTab)) {
      setActiveTab(requestedTab as typeof activeTab);
    }
  }, [location]);

  useFamilyRealtime(familyGroupId, undefined, undefined, (update) => {
    setRippleNotifications((previous) => [
      ...previous.slice(-4),
      {
        id: `ripple-${update.userId}-${update.timestamp}`,
        type: update.activityType,
        userName: update.userName,
        timestamp: new Date(update.timestamp),
        stamp: typeof update.metadata?.stamp === "string" ? update.metadata.stamp : undefined,
        occasion: typeof update.metadata?.occasion === "string" ? update.metadata.occasion : undefined,
      },
    ]);
  });

  // Queries
  const { data: familyGroup } = trpc.family.getById.useQuery(
    { id: familyGroupId },
    { enabled: !!familyGroupId }
  );

  const { data: members } = trpc.family.getMembers.useQuery(
    { familyGroupId },
    { enabled: !!familyGroupId }
  );

  const { data: timeline, isLoading: timelineLoading } = trpc.timeline.getFamilyTimeline.useQuery(
    { familyGroupId, limit: 50 },
    { enabled: !!familyGroupId, refetchInterval: 5000 }
  );

  // Mutations
  const createTimelineEntryMutation = trpc.timeline.createEntry.useMutation({
    onSuccess: () => {
      setMoodText("");
      trpc.useUtils().timeline.getFamilyTimeline.invalidate({ familyGroupId });
    },
  });

  const logActivityMutation = trpc.activity.logActivity.useMutation({
    onSuccess: () => {
      trpc.useUtils().timeline.getFamilyTimeline.invalidate({ familyGroupId });
    },
  });

  const handlePostMood = async () => {
    if (moodText.trim()) {
      await createTimelineEntryMutation.mutateAsync({
        familyGroupId,
        entryType: "mood",
        content: moodText,
      });
    }
  };

  const handleLogActivity = async (activityType: string) => {
    await logActivityMutation.mutateAsync({
      familyGroupId,
      activityType: activityType as any,
    });

    // 波紋通知を追加
    setRippleNotifications((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        type: activityType,
        userName: user?.name || t("family.unknownUser"),
        timestamp: new Date(),
      },
    ]);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "mood":
        return <Smile className="w-5 h-5" />;
      case "photo":
        return <Camera className="w-5 h-5" />;
      case "music":
        return <Music className="w-5 h-5" />;
      case "message":
        return <MessageSquare className="w-5 h-5" />;
      case "location":
        return <MapPin className="w-5 h-5" />;
      default:
        return <Heart className="w-5 h-5" />;
    }
  };

  const getActivityLabel = (type: string) => {
    const labels: Record<string, string> = {
      mood: t("family.mood"),
      photo: t("family.photo"),
      music: t("family.music"),
      message: t("family.message"),
      location: t("family.location"),
      activity: t("family.activity"),
    };
    return labels[type] || type;
  };

  if (!familyGroupId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">{t("family.groupNotFound")}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("common.back")}
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{familyGroup?.name}</h1>
                <p className="text-sm text-gray-500">
                  {members?.length || 0}{t("family.members")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <Button
              onClick={() => setLocation(`/family/${familyGroupId}/invite`)}
              className="bg-pink-500 hover:bg-pink-600 text-white flex items-center gap-2"
            >
                <Plus className="w-4 h-4" />
                {t("family.invite")}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <FamilyNotificationCenter familyGroupId={familyGroupId} />
        </div>
        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4 border-2 border-pink-200 hover:bg-pink-50"
            onClick={() => handleLogActivity("mood")}
          >
            <Smile className="w-6 h-6 text-pink-500" />
            <span className="text-xs text-center">{t("family.mood")}</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4 border-2 border-blue-200 hover:bg-blue-50"
            onClick={() => handleLogActivity("photo")}
          >
            <Camera className="w-6 h-6 text-blue-500" />
            <span className="text-xs text-center">{t("family.photo")}</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4 border-2 border-purple-200 hover:bg-purple-50"
            onClick={() => handleLogActivity("music")}
          >
            <Music className="w-6 h-6 text-purple-500" />
            <span className="text-xs text-center">{t("family.music")}</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4 border-2 border-green-200 hover:bg-green-50"
            onClick={() => handleLogActivity("location")}
          >
            <MapPin className="w-6 h-6 text-green-500" />
            <span className="text-xs text-center">{t("family.location")}</span>
          </Button>
        </div>

        {/* Post Section */}
        <Card className="p-6 mb-8 bg-white border-0 shadow-md">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">{t("family.shareFeeling")}</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="mood">{t("family.moodSituation")}</Label>
              <Textarea
                id="mood"
                placeholder={t("family.moodPlaceholder")}
                value={moodText}
                onChange={(e) => setMoodText(e.target.value)}
                className="mt-2 resize-none"
                rows={3}
              />
            </div>
            <Button
              onClick={handlePostMood}
              disabled={!moodText.trim() || createTimelineEntryMutation.isPending}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white"
            >
              {createTimelineEntryMutation.isPending ? t("family.posting") : t("family.post")}
            </Button>
          </div>
        </Card>

        {/* Members Section */}
        {members && members.length > 0 && (
          <Card className="p-6 mb-8 bg-white border-0 shadow-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              {t("family.membersTitle")}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {members.map((member) => (
                <div key={member.family_members.id} className="text-center p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">
                    {member.users.name?.charAt(0) || "?"}
                  </div>
                  <p className="font-semibold text-gray-800 text-sm">{member.users.name}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {member.family_members.memberRole === "guardian" && t("family.roleGuardian")}
                    {member.family_members.memberRole === "child" && t("family.roleChild")}
                    {member.family_members.memberRole === "elderly" && t("family.roleElderly")}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="mb-6">
          <FamilyQuickWidget
            familyGroupId={familyGroupId}
            onOpenSafety={() => setActiveTab("safety")}
            onOpenAssistant={() => setActiveTab("assistant")}
            onOpenAlbum={() => setActiveTab("album")}
          />
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <FamilyCheckIn familyGroupId={familyGroupId} />
          <TodayKizunaHighlights familyGroupId={familyGroupId} />
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <FamilyHelpBoard familyGroupId={familyGroupId} />
          <FamilyGratitudeRelay familyGroupId={familyGroupId} />
          <FamilyWeeklyPulse familyGroupId={familyGroupId} />
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <FamilyShoppingList familyGroupId={familyGroupId} />
          <FamilyTimeCapsulePanel familyGroupId={familyGroupId} />
          <FamilyPollPanel familyGroupId={familyGroupId} />
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <FamilyEventVote familyGroupId={familyGroupId} />
          <FamilyConditionBoard familyGroupId={familyGroupId} />
          <FamilyMemoryBookmark familyGroupId={familyGroupId} />
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <FamilySafetyChecklist familyGroupId={familyGroupId} />
          <FamilyCelebrationCalendar familyGroupId={familyGroupId} />
          <FamilyWordBaton familyGroupId={familyGroupId} />
        </div>
        <div className="mb-6 grid gap-4 md:grid-cols-3"><FamilyContactsPanel familyGroupId={familyGroupId} userRole={members?.find((member) => member.users.id === user?.id)?.family_members.memberRole ?? "guardian"}/><FamilyGentleRules familyGroupId={familyGroupId}/><FamilyWeekendPlanner familyGroupId={familyGroupId}/></div>
        <div className="mb-6 grid gap-4 md:grid-cols-3"><FamilyRoleMap familyGroupId={familyGroupId}/><FamilyBookshelf familyGroupId={familyGroupId}/><FamilyOutingPrep familyGroupId={familyGroupId}/></div>
        <div className="mb-6 grid gap-4 md:grid-cols-3"><FamilyMealRelay familyGroupId={familyGroupId}/><FamilyCareBoard familyGroupId={familyGroupId}/><FamilyFunLottery familyGroupId={familyGroupId}/></div>
        <div className="mb-6 grid gap-4 md:grid-cols-3"><FamilyCareMessageBoard familyGroupId={familyGroupId} currentUserId={user?.id}/></div>
        <div className="mb-6 grid gap-4 md:grid-cols-3"><FamilySharedShelf familyGroupId={familyGroupId}/></div>
        <div className="mb-6 grid gap-4 md:grid-cols-3"><FamilyMonthlyChallenge familyGroupId={familyGroupId}/></div>
        <div className="mb-6 grid gap-4 md:grid-cols-3"><FamilyMoodSign familyGroupId={familyGroupId}/></div>
        <div className="mb-6 grid gap-4 md:grid-cols-3"><FamilyWalkRoutes familyGroupId={familyGroupId}/></div>
        <div className="mb-6 grid gap-4 md:grid-cols-3"><FamilyLearningCards familyGroupId={familyGroupId}/></div>
        <div className="mb-6 grid gap-4 md:grid-cols-3"><FamilyDailyMoment familyGroupId={familyGroupId}/><FamilyMovementBingo familyGroupId={familyGroupId}/><FamilyTakeHomeNotes familyGroupId={familyGroupId}/></div>
        <div className="mb-6 grid gap-4 md:grid-cols-3"><FamilyEncouragementPost familyGroupId={familyGroupId}/><FamilyEnergyMeter familyGroupId={familyGroupId}/><FamilyWishList familyGroupId={familyGroupId}/></div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab("timeline")}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "timeline"
                ? "border-pink-500 text-pink-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            <Heart className="w-4 h-4 inline mr-2" />
            {t("family.timeline")}
          </button>
          <button
            onClick={() => setActiveTab("safety")}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "safety"
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            <MapPin className="w-4 h-4 inline mr-2" />
            {t("family.safety")}
          </button>
          <button
            onClick={() => setActiveTab("trail")}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "trail"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            <MapPin className="w-4 h-4 inline mr-2" />
            {t("family.trailHeatmap")}
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "ai"
                ? "border-yellow-500 text-yellow-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            {t("family.aiProposal")}
          </button>
          <button
            onClick={() => setActiveTab("assistant")}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "assistant"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            {t("family.assistant")}
          </button>
          <button
            onClick={() => setActiveTab("celebration")}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "celebration"
                ? "border-pink-500 text-pink-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            {t("family.celebration")}
          </button>
          <button
            onClick={() => setActiveTab("digest")}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "digest"
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            <Sparkles className="w-4 h-4 inline mr-2" />
            {t("family.digestAlbum")}
          </button>
          <button
            onClick={() => setActiveTab("album")}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "album"
                ? "border-sky-500 text-sky-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            <Images className="w-4 h-4 inline mr-2" />
            家族アルバム
          </button>
          <button
            onClick={() => setActiveTab("automation")}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "automation"
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            <CalendarClock className="w-4 h-4 inline mr-2" />
            週次AI
          </button>
          <button
            onClick={() => setActiveTab("health")}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "health"
                ? "border-rose-500 text-rose-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            <Activity className="w-4 h-4 inline mr-2" />
            ヘルス体験
          </button>
          <button
            onClick={() => setActiveTab("stats")}
            className={`px-4 py-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "stats"
                ? "border-purple-500 text-purple-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            <Share2 className="w-4 h-4 inline mr-2" />
            {t("family.stats")}
          </button>
        </div>

        {/* Timeline Section */}
        {activeTab === "timeline" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              {t("family.timelineTitle")}
            </h2>

            {timelineLoading ? (
              <Card className="p-8 text-center bg-white border-0 shadow-md">
                <p className="text-gray-600">{t("family.loadingTimeline")}</p>
              </Card>
            ) : timeline && timeline.length > 0 ? (
              timeline.map((entry) => (
                <Card key={entry.id} className="p-6 bg-white border-0 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white flex-shrink-0">
                      {getActivityIcon(entry.entryType)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-800">
                          {getActivityLabel(entry.entryType)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(entry.createdAt).toLocaleTimeString('ja-JP', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      {entry.content && (
                        <p className="text-gray-700 text-sm leading-relaxed">{entry.content}</p>
                      )}
                      {entry.imageUrl && (
                        <img
                          src={entry.imageUrl}
                          alt={t("family.timelineAlt")}
                          className="mt-3 rounded-lg max-w-xs max-h-48 object-cover"
                        />
                      )}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-8 text-center bg-white border-0 shadow-md">
                <Heart className="w-12 h-12 text-pink-200 mx-auto mb-4" />
                <p className="text-gray-600">
                  {t("family.noTimeline")}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {t("family.noTimelineHint")}
                </p>
              </Card>
            )}
          </div>
        )}

        {/* Safety Guardian Section */}
        {activeTab === "safety" && (
          <SafetyGuardian
            familyGroupId={familyGroupId}
            memberLocations={[]}
          />
        )}

        {/* Family Trail Heatmap Section */}
        {activeTab === "trail" && <FamilyTrailHeatmap familyGroupId={familyGroupId} />}

        {/* AI Features Section */}
        {activeTab === "ai" && (
          <AIFeatures
            familyGroupId={familyGroupId}
            familyMembers={members?.map((m) => ({
              id: m.users.id,
              name: m.users.name || "Unknown",
            })) || []}
          />
        )}

        {/* Family AI Assistant Section */}
        {activeTab === "assistant" && <FamilyAIAssistant familyGroupId={familyGroupId} />}
        {/* Celebration Composer Section */}
        {activeTab === "celebration" && <FamilyCelebrationComposer familyGroupId={familyGroupId} />}

        {/* Digest Album Section */}
        {activeTab === "digest" && <FamilyDigestAlbum familyGroupId={familyGroupId} />}

        {/* Family Cloud Album Section */}
        {activeTab === "album" && <FamilyCloudAlbum familyGroupId={familyGroupId} />}

        {/* Weekly AI Journal Section */}
        {activeTab === "automation" && <FamilyAutomationPanel familyGroupId={familyGroupId} />}

        {/* Wearable Health Simulation Section */}
        {activeTab === "health" && <WearableHealthSimulator familyGroupId={familyGroupId} />}

        {/* Statistics Dashboard Section */}
        {activeTab === "stats" && (
          <FamilyStatsDashboard familyGroupId={familyGroupId} />
        )}
      </main>

      {/* 絆の波紋通知 */}
      <KizunaRipple
        notifications={rippleNotifications}
        onNotificationDismiss={(id) => {
          setRippleNotifications((prev) => prev.filter((n) => n.id !== id));
        }}
      />
    </div>
  );
}
