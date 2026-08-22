import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Heart, ArrowLeft, Plus, Users, MessageSquare, Camera, Music, MapPin, Smile, Sparkles, Share2, Activity, CalendarClock, Images, Star } from "lucide-react";
import { lazy, Suspense, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { KizunaRipple } from "@/components/KizunaRipple";
import { SafetyGuardian } from "@/components/SafetyGuardian";
import { FamilyNotificationCenter } from "@/components/FamilyNotificationCenter";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useI18n } from "@/contexts/I18nContext";
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
import { FamilyMorningBoard } from "@/components/FamilyMorningBoard";
import { FamilyVoiceMemoExchange } from "@/components/FamilyVoiceMemoExchange";
import { FamilyAchievementAlbum } from "@/components/FamilyAchievementAlbum";
import { FamilyHomecomingNote } from "@/components/FamilyHomecomingNote";
import { FamilyReadingRelay } from "@/components/FamilyReadingRelay";
import { FamilyWeatherMemo } from "@/components/FamilyWeatherMemo";
import { FamilyPlaylist } from "@/components/FamilyPlaylist";
import { FamilyForgottenItemRescue } from "@/components/FamilyForgottenItemRescue";
import { FamilyThankYouBookmarks } from "@/components/FamilyThankYouBookmarks";
import { FamilyMealRequest } from "@/components/FamilyMealRequest";
import { FamilyFunCountdown } from "@/components/FamilyFunCountdown";
import { FamilyMemoryQuiz } from "@/components/FamilyMemoryQuiz";
import { FamilyRoleQuickHub } from "@/components/FamilyRoleQuickHub";
import { FamilyDisplaySettings } from "@/components/FamilyDisplaySettings";
import { FamilyImportantShortcuts } from "@/components/FamilyImportantShortcuts";
import { FamilyMonthlyGoals } from "@/components/FamilyMonthlyGoals";
import { FamilyPhotoCaption } from "@/components/FamilyPhotoCaption";
import { FamilyQuietTimeSignal } from "@/components/FamilyQuietTimeSignal";
import { FamilyConsultationCard } from "@/components/FamilyConsultationCard";
import { FamilySeasonalIdeas } from "@/components/FamilySeasonalIdeas";
import { FamilyCareReplies } from "@/components/FamilyCareReplies";
import { FamilyDailyQuestion } from "@/components/FamilyDailyQuestion";
import { FamilyHomePreparation } from "@/components/FamilyHomePreparation";
import { FamilyEncouragementStamps } from "@/components/FamilyEncouragementStamps";
import { FamilyWeekendReflection } from "@/components/FamilyWeekendReflection";
import { FamilySupportMap } from "@/components/FamilySupportMap";
import { FamilyGentleReminders } from "@/components/FamilyGentleReminders";
import { FamilyEveningNote } from "@/components/FamilyEveningNote";
import { FamilyWalkLog } from "@/components/FamilyWalkLog";
import { FamilyHelpedMemo } from "@/components/FamilyHelpedMemo";
import { FamilyTomorrowMemo } from "@/components/FamilyTomorrowMemo";
import { FamilySeasonalPhotoPrompt } from "@/components/FamilySeasonalPhotoPrompt";
import { FamilyHelpGuide } from "@/components/FamilyHelpGuide";
import { FamilyWeeklyPromise } from "@/components/FamilyWeeklyPromise";
import { FamilyTalkTiming } from "@/components/FamilyTalkTiming";
import { FamilyMemoryBookmarkExchange } from "@/components/FamilyMemoryBookmarkExchange";
import { FamilyQuestionBox } from "@/components/FamilyQuestionBox";
import { FamilyMorningEncouragement } from "@/components/FamilyMorningEncouragement";
import { FamilyWeekendHomecomingPlan } from "@/components/FamilyWeekendHomecomingPlan";
import { FamilyTogetherInvitation } from "@/components/FamilyTogetherInvitation";
import { FamilyComfortMeter } from "@/components/FamilyComfortMeter";
import { FamilyRainyDayIdeas } from "@/components/FamilyRainyDayIdeas";
import { FamilyDailyJoy } from "@/components/FamilyDailyJoy";
import { FamilyLaterListenMemo } from "@/components/FamilyLaterListenMemo";
import { FamilyTableTopic } from "@/components/FamilyTableTopic";
import { FamilyMeetingMarker } from "@/components/FamilyMeetingMarker";
import { FamilyMoodResetIdeas } from "@/components/FamilyMoodResetIdeas";
import { FamilyThanksRelay } from "@/components/FamilyThanksRelay";
import { FamilyOutingCharmMemo } from "@/components/FamilyOutingCharmMemo";
import { FamilyWeeklyCheerTheme } from "@/components/FamilyWeeklyCheerTheme";
import { FamilyTinyAchievementBadge } from "@/components/FamilyTinyAchievementBadge";
import { FamilyBedtimePreparationMemo } from "@/components/FamilyBedtimePreparationMemo";
import { FamilyWellbeingNote } from "@/components/FamilyWellbeingNote";
import { FamilyMonthlyJoyBox } from "@/components/FamilyMonthlyJoyBox";
import { FamilyGoodFindMemo } from "@/components/FamilyGoodFindMemo";
import { FamilyWeekStartDeclaration } from "@/components/FamilyWeekStartDeclaration";
import { FamilyCalmMoment } from "@/components/FamilyCalmMoment";
import { FamilyTomorrowPreparationRelay } from "@/components/FamilyTomorrowPreparationRelay";
import { FamilyHelpingHand } from "@/components/FamilyHelpingHand";
import { FamilyDiscoveryShare } from "@/components/FamilyDiscoveryShare";
import { FamilyWeekendCalmPlan } from "@/components/FamilyWeekendCalmPlan";
import { FamilyWeeklyCareTheme } from "@/components/FamilyWeeklyCareTheme";
import { FamilyTriedMemo } from "@/components/FamilyTriedMemo";
import { FamilyHomecomingBreather } from "@/components/FamilyHomecomingBreather";
import { FamilyJournalRelay } from "@/components/FamilyJournalRelay";
import { FamilyConversationTopic } from "@/components/FamilyConversationTopic";
import { FamilyAppreciationCard } from "@/components/FamilyAppreciationCard";
import { FamilyRoleBaton } from "@/components/FamilyRoleBaton";
import { FamilyPlaceCard } from "@/components/FamilyPlaceCard";
import { FamilyNoticeBoard } from "@/components/FamilyNoticeBoard";
import { FamilyPriorityMemo } from "@/components/FamilyPriorityMemo";
import { FamilyPlanCheckin } from "@/components/FamilyPlanCheckin";
import { FamilyNextStepCard } from "@/components/FamilyNextStepCard";
import { FamilyHouseholdTip } from "@/components/FamilyHouseholdTip";
import { FamilyPackingCheck } from "@/components/FamilyPackingCheck";
import { FamilyTogetherPick } from "@/components/FamilyTogetherPick";
import { FamilyCardNavigator } from "@/components/FamilyCardNavigator";
import { useFamilyRealtime } from "@/hooks/useFamilyRealtime";
import type { FamilyMemberRole, QuickHubAction } from "@shared/familyAccessibility";
import { createFamilyDetailRecommendationSharePath, createFamilyDetailTabPath, filterFamilyDetailTabs, getFamilyDetailDailyRhythmTabs, getFamilyDetailDayPeriod, getFamilyDetailRecommendationStorageKey, getFamilyDetailSafetyTabs, getFamilyDetailTabPinsStorageKey, getFamilyDetailTabPosition, getFamilyDetailTabRecentsStorageKey, getFamilyDetailTabStorageKey, getFamilyNavigationScrollBehavior, getInitialFamilyDetailTab, getMovedFamilyDetailTab, getRecommendedFamilyDetailTabs, normalizeFamilyDetailTab, normalizePinnedFamilyDetailTabs, normalizeRecentFamilyDetailTabs, normalizeRecommendedFamilyDetailTabs, recordRecentFamilyDetailTab, togglePinnedFamilyDetailTab, toggleRecommendedFamilyDetailTab, type FamilyDetailDayPeriod, type FamilyDetailTab } from "@shared/familyDetailTabs";
import { normalizeFamilyCardAnchor } from "@shared/familyCardDiscovery";

const AIFeatures = lazy(() => import("@/components/AIFeatures").then((module) => ({ default: module.AIFeatures })));
const FamilyStatsDashboard = lazy(() => import("@/components/FamilyStatsDashboard").then((module) => ({ default: module.FamilyStatsDashboard })));
const FamilyAIAssistant = lazy(() => import("@/components/FamilyAIAssistant").then((module) => ({ default: module.FamilyAIAssistant })));
const FamilyAutomationPanel = lazy(() => import("@/components/FamilyAutomationPanel").then((module) => ({ default: module.FamilyAutomationPanel })));
const WearableHealthSimulator = lazy(() => import("@/components/WearableHealthSimulator").then((module) => ({ default: module.WearableHealthSimulator })));
const FamilyTrailHeatmap = lazy(() => import("@/components/FamilyTrailHeatmap").then((module) => ({ default: module.FamilyTrailHeatmap })));
const FamilyCelebrationComposer = lazy(() => import("@/components/FamilyCelebrationComposer").then((module) => ({ default: module.FamilyCelebrationComposer })));
const FamilyDigestAlbum = lazy(() => import("@/components/FamilyDigestAlbum").then((module) => ({ default: module.FamilyDigestAlbum })));
const FamilyCloudAlbum = lazy(() => import("@/components/FamilyCloudAlbum").then((module) => ({ default: module.FamilyCloudAlbum })));

export default function FamilyDetail() {
  const params = useParams<{ id: string }>();
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const { t, language } = useI18n();
  const familyGroupId = parseInt(params?.id || "0");

  const [moodText, setMoodText] = useState("");
  const [rippleNotifications, setRippleNotifications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<FamilyDetailTab>("timeline");
  const [tabShareStatus, setTabShareStatus] = useState<"idle" | "shared" | "copied" | "unavailable">("idle");
  const [sharedCardOpened, setSharedCardOpened] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [showTabHelp, setShowTabHelp] = useState(() => window.localStorage.getItem("kizuna-sync-show-family-tab-help") === "true");
  const [currentTabCentered, setCurrentTabCentered] = useState(false);
  const [recentTabs, setRecentTabs] = useState<FamilyDetailTab[]>([]);
  const [pinnedTabs, setPinnedTabs] = useState<FamilyDetailTab[]>([]);
  const [tabSearchQuery, setTabSearchQuery] = useState("");
  const [customRecommendedTabs, setCustomRecommendedTabs] = useState<FamilyDetailTab[] | null>(null);
  const featureSearchInputRef = useRef<HTMLInputElement>(null);
  const lastOpenedTabStorageKey = getFamilyDetailTabStorageKey(familyGroupId);
  const recentTabsStorageKey = getFamilyDetailTabRecentsStorageKey(familyGroupId);
  const pinnedTabsStorageKey = getFamilyDetailTabPinsStorageKey(familyGroupId);

  useEffect(() => {
    const requestedTab = new URLSearchParams(window.location.search).get("tab");
    const lastOpenedTab = window.localStorage.getItem(lastOpenedTabStorageKey);
    const nextTab = getInitialFamilyDetailTab(requestedTab, lastOpenedTab);
    setActiveTab(nextTab);
    window.localStorage.setItem(lastOpenedTabStorageKey, nextTab);
  }, [lastOpenedTabStorageKey, location]);

  useEffect(() => {
    try {
      setRecentTabs(normalizeRecentFamilyDetailTabs(JSON.parse(window.localStorage.getItem(recentTabsStorageKey) ?? "[]")));
    } catch {
      setRecentTabs([]);
    }
  }, [recentTabsStorageKey]);

  useEffect(() => {
    try {
      setPinnedTabs(normalizePinnedFamilyDetailTabs(JSON.parse(window.localStorage.getItem(pinnedTabsStorageKey) ?? "[]")));
    } catch {
      setPinnedTabs([]);
    }
  }, [pinnedTabsStorageKey]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

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

  const currentMemberRole: FamilyMemberRole = members?.find((member) => member.users.id === user?.id)?.family_members.memberRole ?? "guardian";
  const recommendationStorageKey = getFamilyDetailRecommendationStorageKey(familyGroupId, currentMemberRole);
  useEffect(() => {
    const serializedRecommendations = window.localStorage.getItem(recommendationStorageKey);
    if (!serializedRecommendations) {
      setCustomRecommendedTabs(null);
      return;
    }
    try {
      setCustomRecommendedTabs(normalizeRecommendedFamilyDetailTabs(JSON.parse(serializedRecommendations)));
    } catch {
      setCustomRecommendedTabs(null);
    }
  }, [recommendationStorageKey]);
  const getScrollBehavior = () => getFamilyNavigationScrollBehavior(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const scrollToElement = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: getScrollBehavior(), block: "start" });
  const focusCurrentFamilyTab = () => document.querySelector<HTMLButtonElement>(`[data-family-tab="${activeTab}"]`)?.focus({ preventScroll: true });
  const focusCurrentFamilyContent = () => document.getElementById("family-current-feature")?.focus({ preventScroll: true });
  const focusFamilyFeatureSearch = () => featureSearchInputRef.current?.focus({ preventScroll: true });
  const focusFamilySafetyLauncher = () => document.getElementById("family-safety-launcher")?.focus({ preventScroll: true });
  const centerCurrentFamilyTab = () => {
    document.querySelector<HTMLButtonElement>(`[data-family-tab="${activeTab}"]`)?.scrollIntoView({ behavior: getScrollBehavior(), block: "nearest", inline: "center" });
    setCurrentTabCentered(true);
  };
  const toggleTabHelp = () => setShowTabHelp((previous) => {
    const next = !previous;
    window.localStorage.setItem("kizuna-sync-show-family-tab-help", String(next));
    return next;
  });
  useEffect(() => {
    const handleShortcut = (event: globalThis.KeyboardEvent) => {
      if (event.altKey && event.key.toLowerCase() === "t") {
        event.preventDefault();
        focusCurrentFamilyTab();
      }
      if (event.altKey && event.key.toLowerCase() === "m") {
        event.preventDefault();
        focusCurrentFamilyContent();
      }
      if (event.altKey && event.key.toLowerCase() === "f") {
        event.preventDefault();
        focusFamilyFeatureSearch();
      }
      if (event.altKey && event.key.toLowerCase() === "s") {
        event.preventDefault();
        focusFamilySafetyLauncher();
      }
      if (event.key === "Escape" && (event.target as HTMLElement).dataset.familyTab) {
        event.preventDefault();
        document.getElementById("family-current-feature")?.focus({ preventScroll: true });
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [activeTab]);
  useEffect(() => {
    document.querySelector<HTMLButtonElement>(`[data-family-tab="${activeTab}"]`)?.scrollIntoView({ behavior: getScrollBehavior(), block: "nearest", inline: "center" });
  }, [activeTab, reducedMotion]);
  useEffect(() => {
    const recoverSharedCard = () => {
      const cardId = normalizeFamilyCardAnchor(window.location.hash);
      if (!cardId) return;

      window.requestAnimationFrame(() => {
        const card = document.getElementById(cardId);
        if (!card) return;
        card.scrollIntoView({ behavior: getScrollBehavior(), block: "center" });
        card.focus({ preventScroll: true });
        setSharedCardOpened(true);
      });
    };

    recoverSharedCard();
    window.addEventListener("hashchange", recoverSharedCard);
    return () => window.removeEventListener("hashchange", recoverSharedCard);
  }, [location]);
  const changeActiveTab = (tab: FamilyDetailTab) => {
    setActiveTab(tab);
    setTabShareStatus("idle");
    setCurrentTabCentered(false);
    window.localStorage.setItem(lastOpenedTabStorageKey, tab);
    setRecentTabs((previous) => {
      const next = recordRecentFamilyDetailTab(previous, tab);
      window.localStorage.setItem(recentTabsStorageKey, JSON.stringify(next));
      return next;
    });
    setLocation(createFamilyDetailTabPath(familyGroupId, tab));
  };
  const toggleActiveTabPin = () => setPinnedTabs((previous) => {
    const next = togglePinnedFamilyDetailTab(previous, activeTab);
    window.localStorage.setItem(pinnedTabsStorageKey, JSON.stringify(next));
    return next;
  });
  const toggleActiveRecommendation = () => setCustomRecommendedTabs((previous) => {
    const next = toggleRecommendedFamilyDetailTab(previous ?? getRecommendedFamilyDetailTabs(currentMemberRole), activeTab);
    window.localStorage.setItem(recommendationStorageKey, JSON.stringify(next));
    return next;
  });
  const resetRecommendations = () => {
    window.localStorage.removeItem(recommendationStorageKey);
    setCustomRecommendedTabs(null);
  };
  const handleFamilyTabKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const sourceTab = normalizeFamilyDetailTab((event.target as HTMLElement).dataset.familyTab);
    const moveByKey: Record<string, "next" | "previous" | "first" | "last"> = {
      ArrowRight: "next",
      ArrowLeft: "previous",
      Home: "first",
      End: "last",
    };
    const move = moveByKey[event.key];
    if (!sourceTab || !move) return;

    event.preventDefault();
    const nextTab = getMovedFamilyDetailTab(sourceTab, move);
    changeActiveTab(nextTab);
    requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(`[data-family-tab="${nextTab}"]`)?.focus());
  };
  const handleQuickHubAction = (action: QuickHubAction) => {
    if (action === "safety") changeActiveTab("safety");
    if (action === "assistant") changeActiveTab("assistant");
    if (action === "album") changeActiveTab("album");
    if (action === "stats") changeActiveTab("stats");
    if (action === "shareMood") scrollToElement("share-feeling");
  };

  const activeTabLabel: Record<FamilyDetailTab, string> = {
    timeline: t("family.timeline"),
    safety: t("family.safety"),
    trail: t("family.trailHeatmap"),
    ai: t("family.aiProposal"),
    assistant: t("family.assistant"),
    celebration: t("family.celebration"),
    digest: t("family.digestAlbum"),
    album: t("family.album"),
    automation: t("family.weeklyAi"),
    health: t("family.healthExperience"),
    stats: t("family.stats"),
  };
  const activeTabPosition = getFamilyDetailTabPosition(activeTab);
  const matchingTabs = filterFamilyDetailTabs(tabSearchQuery, activeTabLabel);
  const recommendedTabs = customRecommendedTabs ?? getRecommendedFamilyDetailTabs(currentMemberRole);
  const safetyTabs = getFamilyDetailSafetyTabs();
  const dayPeriod = getFamilyDetailDayPeriod(new Date().getHours());
  const dailyRhythmTabs = getFamilyDetailDailyRhythmTabs(dayPeriod);
  const dailyRhythmDescriptionKey: Record<FamilyDetailDayPeriod, "family.dailyRhythmMorning" | "family.dailyRhythmDaytime" | "family.dailyRhythmEvening"> = {
    morning: "family.dailyRhythmMorning",
    daytime: "family.dailyRhythmDaytime",
    evening: "family.dailyRhythmEvening",
  };

  const shareFamilyTab = async (tab: FamilyDetailTab, path: string, text: string) => {
    const url = new URL(path, window.location.origin).toString();
    const title = `${familyGroup?.name ?? "家族"}｜${activeTabLabel[tab]}`;

    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        setTabShareStatus("shared");
        return;
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setTabShareStatus("copied");
        return;
      }

      setTabShareStatus("unavailable");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setTabShareStatus("unavailable");
    }
  };
  const handleShareActiveTab = () => shareFamilyTab(activeTab, createFamilyDetailTabPath(familyGroupId, activeTab), t("family.shareText").replace("{tab}", activeTabLabel[activeTab]));
  const handleShareRecommendations = () => {
    const firstRecommendation = recommendedTabs[0] ?? "timeline";
    return shareFamilyTab(firstRecommendation, createFamilyDetailRecommendationSharePath(familyGroupId, recommendedTabs), t("family.shareRecommendations"));
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
        <Card id="share-feeling" className="p-6 mb-8 bg-white border-0 shadow-md">
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
            onOpenSafety={() => changeActiveTab("safety")}
            onOpenAssistant={() => changeActiveTab("assistant")}
            onOpenAlbum={() => changeActiveTab("album")}
          />
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <FamilyRoleQuickHub role={currentMemberRole} onAction={handleQuickHubAction}/>
          <FamilyDisplaySettings />
          <FamilyImportantShortcuts onSafety={() => changeActiveTab("safety")} onMood={() => scrollToElement("share-feeling")} onDaily={() => scrollToElement("family-daily-cards")}/>
        </div>
        <FamilyCardNavigator onOpen={scrollToElement} role={currentMemberRole}/>

        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <FamilyCheckIn familyGroupId={familyGroupId} />
          <TodayKizunaHighlights familyGroupId={familyGroupId} />
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
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
        <div id="family-daily-cards" className="mb-6 grid gap-4 md:grid-cols-3"><FamilyDailyMoment familyGroupId={familyGroupId}/><FamilyMovementBingo familyGroupId={familyGroupId}/><FamilyTakeHomeNotes familyGroupId={familyGroupId}/></div>
        <div className="mb-6 grid gap-4 md:grid-cols-3"><FamilyEncouragementPost familyGroupId={familyGroupId}/><FamilyEnergyMeter familyGroupId={familyGroupId}/><FamilyWishList familyGroupId={familyGroupId}/></div>
        <div className="mb-6 grid gap-4 md:grid-cols-3"><FamilyMorningBoard familyGroupId={familyGroupId}/><FamilyVoiceMemoExchange familyGroupId={familyGroupId}/><FamilyAchievementAlbum familyGroupId={familyGroupId}/></div>
        <div className="mb-6 grid gap-4 md:grid-cols-3"><FamilyReadingRelay familyGroupId={familyGroupId}/><FamilyWeatherMemo familyGroupId={familyGroupId}/></div>
        <div className="mb-6 grid gap-4 md:grid-cols-3"><FamilyPlaylist familyGroupId={familyGroupId}/><FamilyForgottenItemRescue familyGroupId={familyGroupId}/><FamilyThankYouBookmarks familyGroupId={familyGroupId}/></div>
        <div className="mb-6 grid gap-4 md:grid-cols-3"><FamilyMealRequest familyGroupId={familyGroupId}/><FamilyFunCountdown familyGroupId={familyGroupId}/><FamilyMemoryQuiz familyGroupId={familyGroupId}/></div>
        <div className="mb-6 grid gap-4 md:grid-cols-3"><FamilyMonthlyGoals familyGroupId={familyGroupId}/><FamilyPhotoCaption familyGroupId={familyGroupId}/><FamilyQuietTimeSignal familyGroupId={familyGroupId}/></div>
        <div className="mb-6 grid gap-4 md:grid-cols-3"><FamilyConsultationCard familyGroupId={familyGroupId}/><FamilySeasonalIdeas familyGroupId={familyGroupId}/><FamilyCareReplies familyGroupId={familyGroupId}/></div>
        <div className="mb-6 grid gap-4 md:grid-cols-3"><FamilyDailyQuestion familyGroupId={familyGroupId}/><FamilyHomePreparation familyGroupId={familyGroupId}/><FamilyEncouragementStamps familyGroupId={familyGroupId}/></div>
        <div className="mb-6 grid gap-4 md:grid-cols-3"><FamilyWeekendReflection familyGroupId={familyGroupId}/><FamilySupportMap familyGroupId={familyGroupId}/><FamilyGentleReminders familyGroupId={familyGroupId}/></div>
        <div className="mb-6 grid gap-4 md:grid-cols-3"><FamilyEveningNote familyGroupId={familyGroupId}/><FamilyWalkLog familyGroupId={familyGroupId}/><FamilyHelpedMemo familyGroupId={familyGroupId}/></div>
        <div className="mb-6 grid gap-4 md:grid-cols-3"><FamilyTomorrowMemo familyGroupId={familyGroupId}/><FamilySeasonalPhotoPrompt familyGroupId={familyGroupId}/><FamilyHelpGuide familyGroupId={familyGroupId}/></div>
        <div className="mb-6 grid gap-4 md:grid-cols-3"><FamilyWeeklyPromise familyGroupId={familyGroupId}/><FamilyTalkTiming familyGroupId={familyGroupId}/><FamilyMemoryBookmarkExchange familyGroupId={familyGroupId}/></div>
        <div className="mb-6 grid gap-4 md:grid-cols-3"><FamilyQuestionBox familyGroupId={familyGroupId}/><FamilyMorningEncouragement familyGroupId={familyGroupId}/><FamilyWeekendHomecomingPlan familyGroupId={familyGroupId}/></div>
        <div className="mb-6 grid gap-4 md:grid-cols-3"><FamilyTogetherInvitation familyGroupId={familyGroupId}/><FamilyComfortMeter familyGroupId={familyGroupId}/><FamilyRainyDayIdeas familyGroupId={familyGroupId}/></div>
        <div className="mb-6 grid gap-4 md:grid-cols-3"><FamilyDailyJoy familyGroupId={familyGroupId}/><FamilyHomecomingNote familyGroupId={familyGroupId}/><FamilyHelpBoard familyGroupId={familyGroupId}/></div>
        <div className="mb-6 grid gap-4 md:grid-cols-3"><FamilyLaterListenMemo familyGroupId={familyGroupId}/><FamilyTableTopic familyGroupId={familyGroupId}/><FamilyMeetingMarker familyGroupId={familyGroupId}/></div>
        <div className="mb-6 grid gap-4 md:grid-cols-3"><FamilyMoodResetIdeas familyGroupId={familyGroupId}/><FamilyThanksRelay familyGroupId={familyGroupId}/><FamilyOutingCharmMemo familyGroupId={familyGroupId}/></div>
        <div className="mb-6 grid gap-4 md:grid-cols-3"><FamilyWeeklyCheerTheme familyGroupId={familyGroupId}/><FamilyTinyAchievementBadge familyGroupId={familyGroupId}/><FamilyBedtimePreparationMemo familyGroupId={familyGroupId}/></div>
        <div className="mb-6 grid gap-4 md:grid-cols-3"><FamilyWellbeingNote familyGroupId={familyGroupId}/><FamilyMonthlyJoyBox familyGroupId={familyGroupId}/><FamilyGoodFindMemo familyGroupId={familyGroupId}/></div>
        <div className="mb-6 grid gap-4 md:grid-cols-3"><FamilyWeekStartDeclaration familyGroupId={familyGroupId}/><FamilyCalmMoment familyGroupId={familyGroupId}/><FamilyTomorrowPreparationRelay familyGroupId={familyGroupId}/></div>
        <div className="mb-6 grid gap-4 md:grid-cols-3"><FamilyHelpingHand familyGroupId={familyGroupId}/><FamilyDiscoveryShare familyGroupId={familyGroupId}/><FamilyWeekendCalmPlan familyGroupId={familyGroupId}/></div>
        <div className="mb-6 grid gap-4 md:grid-cols-3"><FamilyWeeklyCareTheme familyGroupId={familyGroupId}/><FamilyTriedMemo familyGroupId={familyGroupId}/><FamilyHomecomingBreather familyGroupId={familyGroupId}/></div>
        <div className="mb-6 grid gap-4 md:grid-cols-3"><FamilyJournalRelay familyGroupId={familyGroupId}/><FamilyConversationTopic familyGroupId={familyGroupId}/><FamilyAppreciationCard familyGroupId={familyGroupId}/></div>
        <div className="mb-6 grid gap-4 md:grid-cols-3"><div id="card-role-handoff" tabIndex={-1} className="scroll-mt-4"><FamilyRoleBaton familyGroupId={familyGroupId}/></div><div id="card-place-ideas" tabIndex={-1} className="scroll-mt-4"><FamilyPlaceCard familyGroupId={familyGroupId}/></div><div id="card-family-notices" tabIndex={-1} className="scroll-mt-4"><FamilyNoticeBoard familyGroupId={familyGroupId}/></div></div>
        <div className="mb-6 grid gap-4 md:grid-cols-3"><div id="card-priority-flow" tabIndex={-1} className="scroll-mt-4"><FamilyPriorityMemo familyGroupId={familyGroupId}/></div><div id="card-plan-checkins" tabIndex={-1} className="scroll-mt-4"><FamilyPlanCheckin familyGroupId={familyGroupId}/></div><div id="card-next-steps" tabIndex={-1} className="scroll-mt-4"><FamilyNextStepCard familyGroupId={familyGroupId}/></div></div>
        <div className="mb-6 grid gap-4 md:grid-cols-3"><div id="card-household-tips" tabIndex={-1} className="scroll-mt-4"><FamilyHouseholdTip familyGroupId={familyGroupId}/></div><div id="card-packing-checks" tabIndex={-1} className="scroll-mt-4"><FamilyPackingCheck familyGroupId={familyGroupId}/></div><div id="card-together-picks" tabIndex={-1} className="scroll-mt-4"><FamilyTogetherPick familyGroupId={familyGroupId}/></div></div>

        {/* Tabs */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-gray-700">{t("family.switchFeatures")}</p>
            <p id="family-current-feature" tabIndex={-1} className="mt-1 text-xs font-semibold text-pink-700"><span className="mr-1 rounded-full bg-pink-100 px-1.5 py-0.5">{t("family.showingNow")}</span>{activeTabLabel[activeTab]} <span className="ml-1 text-pink-600">{t("family.currentFeaturePosition").replace("{current}", String(activeTabPosition.current)).replace("{total}", String(activeTabPosition.total))}</span></p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => changeActiveTab("timeline")}
              disabled={activeTab === "timeline"}
            >
              <Heart className="mr-1.5 h-4 w-4" />
              {t("family.returnTimeline")}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={focusCurrentFamilyTab}>
              {t("family.focusCurrentFeature")}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={focusCurrentFamilyContent} aria-keyshortcuts="Alt+M">
              {t("family.skipToCurrentContent")}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={centerCurrentFamilyTab}>
              {t("family.centerCurrentFeature")}
            </Button>
            <select
              value={activeTab}
              onChange={(event) => changeActiveTab(event.target.value as FamilyDetailTab)}
              aria-label={t("family.chooseFeature")}
              className="h-9 max-w-44 rounded-md border border-gray-300 bg-white px-2 text-sm text-gray-700 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500"
            >
              {Object.entries(activeTabLabel).map(([tab, label]) => <option key={tab} value={tab}>{label}</option>)}
            </select>
            <Button type="button" size="sm" variant={pinnedTabs.includes(activeTab) ? "secondary" : "outline"} onClick={toggleActiveTabPin} aria-pressed={pinnedTabs.includes(activeTab)}>
              <Star className="mr-1.5 h-4 w-4" fill={pinnedTabs.includes(activeTab) ? "currentColor" : "none"} />
              {pinnedTabs.includes(activeTab) ? t("family.unpinFeature") : t("family.pinFeature")}
            </Button>
            {pinnedTabs.filter((tab) => tab !== activeTab).map((tab) => (
              <Button key={tab} type="button" size="sm" variant="secondary" onClick={() => changeActiveTab(tab)} aria-label={`${t("family.pinnedFeatures")}: ${activeTabLabel[tab]}`}>
                <Star className="mr-1.5 h-4 w-4" fill="currentColor" />
                {activeTabLabel[tab]}
              </Button>
            ))}
            {recentTabs.filter((tab) => tab !== activeTab).map((tab) => (
              <Button key={tab} type="button" size="sm" variant="secondary" onClick={() => changeActiveTab(tab)} aria-label={`${t("family.recentFeatures")}: ${activeTabLabel[tab]}`}>
                {activeTabLabel[tab]}
              </Button>
            ))}
            <Button type="button" size="sm" variant="outline" onClick={() => changeActiveTab("timeline")}>
              {t("family.jumpFirstFeature")}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => changeActiveTab("health")}>
              {t("family.jumpLastFeature")}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={toggleTabHelp} aria-expanded={showTabHelp}>
              {showTabHelp ? t("family.tabHelpClose") : t("family.tabHelp")}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => void handleShareActiveTab()}>
              <Share2 className="mr-1.5 h-4 w-4" />
              {t("family.shareFeature")}
            </Button>
          </div>
        </div>
        <div id="family-safety-launcher" tabIndex={-1} className="mb-3 rounded-lg border border-emerald-100 bg-emerald-50/70 p-3" aria-keyshortcuts="Alt+S">
          <p className="text-sm font-medium text-emerald-900">{t("family.safetyLauncher")}</p>
          <p className="mt-1 text-xs text-emerald-800">{t("family.safetyLauncherDescription")}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {safetyTabs.map((tab) => (
              <Button key={tab} type="button" size="sm" variant="secondary" onClick={() => changeActiveTab(tab)} disabled={activeTab === tab}>
                {activeTabLabel[tab]}
              </Button>
            ))}
          </div>
        </div>
        <div className="mb-3 rounded-lg border border-amber-100 bg-amber-50/70 p-3">
          <p className="text-sm font-medium text-amber-900">{t("family.dailyRhythm")}</p>
          <p className="mt-1 text-xs text-amber-800">{t(dailyRhythmDescriptionKey[dayPeriod])}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {dailyRhythmTabs.map((tab) => (
              <Button key={tab} type="button" size="sm" variant="secondary" onClick={() => changeActiveTab(tab)} disabled={activeTab === tab}>
                {activeTabLabel[tab]}
              </Button>
            ))}
          </div>
        </div>
        <div className="mb-3 rounded-lg border border-purple-100 bg-purple-50/70 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-purple-900">{t("family.recommendedFeatures")}</p>
            <Button type="button" size="sm" variant="ghost" onClick={resetRecommendations} disabled={customRecommendedTabs === null}>{t("family.resetRecommendations")}</Button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {recommendedTabs.map((tab) => (
              <Button key={tab} type="button" size="sm" variant="secondary" onClick={() => changeActiveTab(tab)} disabled={activeTab === tab}>
                {activeTabLabel[tab]}
              </Button>
            ))}
          </div>
          <Button type="button" size="sm" variant="outline" className="mt-2" onClick={toggleActiveRecommendation}>
            {recommendedTabs.includes(activeTab) ? t("family.removeRecommendation") : t("family.addRecommendation")}
          </Button>
          <Button type="button" size="sm" variant="outline" className="mt-2 ml-2" onClick={() => void handleShareRecommendations()}>
            <Share2 className="mr-1.5 h-4 w-4" />
            {t("family.shareRecommendations")}
          </Button>
        </div>
        <div className="mb-3 rounded-lg border border-pink-100 bg-white/80 p-3">
          <Label htmlFor="family-feature-search" className="text-sm font-medium text-gray-700">{t("family.searchFeatures")}</Label>
          <Input
            id="family-feature-search"
            ref={featureSearchInputRef}
            value={tabSearchQuery}
            onChange={(event) => setTabSearchQuery(event.target.value)}
            placeholder={t("family.searchFeaturesPlaceholder")}
            aria-describedby="family-feature-search-results"
            aria-keyshortcuts="Alt+F"
            className="mt-2 bg-white"
          />
          {tabSearchQuery.trim() && (
            <div id="family-feature-search-results" className="mt-2" aria-live="polite">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-gray-600">{t("family.searchResultsCount").replace("{count}", String(matchingTabs.length))}</p>
                <Button type="button" size="sm" variant="ghost" onClick={() => setTabSearchQuery("")}>{t("family.clearSearch")}</Button>
              </div>
              {matchingTabs.length ? <div className="mt-2 flex flex-wrap gap-2">{matchingTabs.map((tab) => (
                <Button key={tab} type="button" size="sm" variant="secondary" onClick={() => { changeActiveTab(tab); setTabSearchQuery(""); }}>
                  {activeTabLabel[tab]}
                </Button>
              ))}</div> : <p className="mt-2 text-sm text-gray-600">{t("family.noMatchingFeatures")}</p>}
            </div>
          )}
        </div>
        <div className="flex gap-2 mb-8 border-b border-gray-200 overflow-x-auto" role="tablist" aria-orientation="horizontal" aria-label={t("family.switchFeatures")} aria-describedby="family-tab-keyboard-help" aria-keyshortcuts="Alt+T ArrowLeft ArrowRight Home End Escape" onKeyDown={handleFamilyTabKeyDown}>
          <button
            onClick={() => changeActiveTab("timeline")}
            role="tab"
            aria-pressed={activeTab === "timeline"}
            aria-selected={activeTab === "timeline"}
            aria-current={activeTab === "timeline" ? "page" : undefined}
            aria-label={`${t("family.openFeature")}: ${t("family.timeline")}`}
            data-family-tab="timeline"
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
            onClick={() => changeActiveTab("safety")}
            role="tab"
            aria-pressed={activeTab === "safety"}
            aria-selected={activeTab === "safety"}
            aria-current={activeTab === "safety" ? "page" : undefined}
            aria-label={`${t("family.openFeature")}: ${t("family.safety")}`}
            data-family-tab="safety"
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
            onClick={() => changeActiveTab("trail")}
            role="tab"
            aria-pressed={activeTab === "trail"}
            aria-selected={activeTab === "trail"}
            aria-current={activeTab === "trail" ? "page" : undefined}
            aria-label={`${t("family.openFeature")}: ${t("family.trailHeatmap")}`}
            data-family-tab="trail"
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
            onClick={() => changeActiveTab("ai")}
            role="tab"
            aria-pressed={activeTab === "ai"}
            aria-selected={activeTab === "ai"}
            aria-current={activeTab === "ai" ? "page" : undefined}
            aria-label={`${t("family.openFeature")}: ${t("family.aiProposal")}`}
            data-family-tab="ai"
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
            onClick={() => changeActiveTab("assistant")}
            role="tab"
            aria-pressed={activeTab === "assistant"}
            aria-selected={activeTab === "assistant"}
            aria-current={activeTab === "assistant" ? "page" : undefined}
            aria-label={`${t("family.openFeature")}: ${t("family.assistant")}`}
            data-family-tab="assistant"
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
            onClick={() => changeActiveTab("celebration")}
            role="tab"
            aria-pressed={activeTab === "celebration"}
            aria-selected={activeTab === "celebration"}
            aria-current={activeTab === "celebration" ? "page" : undefined}
            aria-label={`${t("family.openFeature")}: ${t("family.celebration")}`}
            data-family-tab="celebration"
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
            onClick={() => changeActiveTab("digest")}
            role="tab"
            aria-pressed={activeTab === "digest"}
            aria-selected={activeTab === "digest"}
            aria-current={activeTab === "digest" ? "page" : undefined}
            aria-label={`${t("family.openFeature")}: ${t("family.digestAlbum")}`}
            data-family-tab="digest"
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
            onClick={() => changeActiveTab("album")}
            role="tab"
            aria-pressed={activeTab === "album"}
            aria-selected={activeTab === "album"}
            aria-current={activeTab === "album" ? "page" : undefined}
            aria-label={`${t("family.openFeature")}: ${t("family.album")}`}
            data-family-tab="album"
            className={`px-4 py-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "album"
                ? "border-sky-500 text-sky-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            <Images className="w-4 h-4 inline mr-2" />
            {t("family.album")}
          </button>
          <button
            onClick={() => changeActiveTab("automation")}
            role="tab"
            aria-pressed={activeTab === "automation"}
            aria-selected={activeTab === "automation"}
            aria-current={activeTab === "automation" ? "page" : undefined}
            aria-label={`${t("family.openFeature")}: ${t("family.weeklyAi")}`}
            data-family-tab="automation"
            className={`px-4 py-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "automation"
                ? "border-amber-500 text-amber-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            <CalendarClock className="w-4 h-4 inline mr-2" />
            {t("family.weeklyAi")}
          </button>
          <button
            onClick={() => changeActiveTab("health")}
            role="tab"
            aria-pressed={activeTab === "health"}
            aria-selected={activeTab === "health"}
            aria-current={activeTab === "health" ? "page" : undefined}
            aria-label={`${t("family.openFeature")}: ${t("family.healthExperience")}`}
            data-family-tab="health"
            className={`px-4 py-2 font-semibold border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "health"
                ? "border-rose-500 text-rose-600"
                : "border-transparent text-gray-600 hover:text-gray-800"
            }`}
          >
            <Activity className="w-4 h-4 inline mr-2" />
            {t("family.healthExperience")}
          </button>
          <button
            onClick={() => changeActiveTab("stats")}
            role="tab"
            aria-pressed={activeTab === "stats"}
            aria-selected={activeTab === "stats"}
            aria-current={activeTab === "stats" ? "page" : undefined}
            aria-label={`${t("family.openFeature")}: ${t("family.stats")}`}
            data-family-tab="stats"
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

        <p id="family-tab-keyboard-help" className="sr-only" lang={language}>{t("family.tabKeyboardHelp")}</p>
        {showTabHelp && <p className="mb-4 rounded-xl bg-pink-50 px-3 py-2 text-sm text-pink-900" role="note" lang={language}>{t("family.tabHelpText")}</p>}
        <p className="sr-only" aria-live="polite" lang={language}>{t("family.currentFeature").replace("{tab}", activeTabLabel[activeTab])}</p>
        {currentTabCentered && <p className="sr-only" role="status" aria-live="polite" lang={language}>{t("family.currentFeatureCentered")}</p>}
        {sharedCardOpened && <p className="sr-only" role="status" aria-live="polite" lang={language}>{t("family.sharedCardOpened")}</p>}
        {reducedMotion && <p className="sr-only" role="status" aria-live="polite" lang={language}>{t("family.motionReducedNavigation")}</p>}
        {tabShareStatus !== "idle" && (
          <p role="status" className="mb-4 text-sm text-gray-600">
            {tabShareStatus === "shared" && t("family.shareOpened")}
            {tabShareStatus === "copied" && t("family.shareCopied")}
            {tabShareStatus === "unavailable" && t("family.shareUnavailable")}
          </p>
        )}

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

        {activeTab !== "timeline" && activeTab !== "safety" && (
          <Suspense fallback={<div role="status" aria-live="polite" lang={language} className="rounded-2xl border border-pink-100 bg-white p-6 text-center text-sm text-gray-600 shadow-sm">{t("family.preparingFeature").replace("{tab}", activeTabLabel[activeTab])}</div>}>
            {activeTab === "trail" && <FamilyTrailHeatmap familyGroupId={familyGroupId} />}
            {activeTab === "ai" && <AIFeatures familyGroupId={familyGroupId} familyMembers={members?.map((m) => ({ id: m.users.id, name: m.users.name || "Unknown" })) || []} />}
            {activeTab === "assistant" && <FamilyAIAssistant familyGroupId={familyGroupId} />}
            {activeTab === "celebration" && <FamilyCelebrationComposer familyGroupId={familyGroupId} />}
            {activeTab === "digest" && <FamilyDigestAlbum familyGroupId={familyGroupId} />}
            {activeTab === "album" && <FamilyCloudAlbum familyGroupId={familyGroupId} />}
            {activeTab === "automation" && <FamilyAutomationPanel familyGroupId={familyGroupId} />}
            {activeTab === "health" && <WearableHealthSimulator familyGroupId={familyGroupId} />}
            {activeTab === "stats" && <FamilyStatsDashboard familyGroupId={familyGroupId} />}
          </Suspense>
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
