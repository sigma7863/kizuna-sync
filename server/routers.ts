import { COOKIE_NAME } from "@shared/const";
import { parse as parseCookie } from "cookie";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import {
  createFamilyGroup,
  getFamilyGroupById,
  getUserFamilyGroups,
  addFamilyMember,
  getFamilyMembers,
  createInvitation,
  getInvitationByCode,
  createTimelineEntry,
  getFamilyTimeline,
  getFamilyDigestAlbumEntries,
  getFamilyDigestAvailableMonths,
  createFamilyAlbumPhoto,
  getFamilyAlbumPhotos,
  searchFamilyAlbumPhotos,
  setFamilyAlbumPhotoFavorite,
  logUserActivity,
  saveLocationHistory,
  createGeofence,
  getFamilyGeofences,
  getFamilyLatestLocations,
  getFamilyLocationHistory,
  acknowledgeGeofenceAlert,
  getPhotoJournalSchedule,
  upsertPhotoJournalSchedule,
  setPhotoJournalScheduleTaskUid,
  getRecentPhotoJournals,
  getFamilyLatestWearableHealthSnapshots,
  createFamilyHelpRequest,
  getFamilyHelpRequests,
  acceptFamilyHelpRequest,
  completeFamilyHelpRequest,
  createFamilyShoppingItem,
  getFamilyShoppingItems,
  toggleFamilyShoppingItem,
  createFamilyTimeCapsule,
  getFamilyTimeCapsules,
  setFamilyTimeCapsuleTaskUid,
  createFamilyPoll,
  getFamilyPollsWithResults,
  answerFamilyPoll,
  createFamilySafetyChecklistItem,
  getFamilySafetyChecklistItems,
  toggleFamilySafetyChecklistItem,
  createFamilyCelebrationDate,
  getFamilyCelebrationDates,
  createFamilyContactCard,
  getFamilyContactCards,
  createFamilyGentleRule,
  getFamilyGentleRules,
  toggleFamilyGentleRule,
  createFamilyWeekendPlan,
  getFamilyWeekendPlans,
  getFamilyWeekendPlan,
  setFamilyWeekendPlanShared,
  getFamilyRoleProfiles,
  upsertFamilyRoleProfile,
  createFamilyBookshelfItem,
  getFamilyBookshelfItems,
  createFamilyOuting,
  getFamilyOutingsWithChecklist,
  createFamilyOutingChecklistItem,
  toggleFamilyOutingChecklistItem,
  createFamilyMealIdea,
  getFamilyMealIdeas,
  selectFamilyMealIdea,
  createFamilyCareDuty,
  getFamilyCareDuties,
  completeFamilyCareDuty,
  createFamilyFunPrompt,
  getFamilyFunPrompts,
  createFamilyCareMessage,
  getFamilyCareMessages,
  markFamilyCareMessageRead,
  createFamilySharedItem,
  getFamilySharedItems,
  updateFamilySharedItemStatus,
  createFamilyMonthlyChallenge,
  getFamilyMonthlyChallenges,
  advanceFamilyMonthlyChallenge,
  createFamilyWalkRoute,
  getFamilyWalkRoutes,
  createFamilyLearningCard,
  getFamilyLearningCards,
  createFamilyDailyMoment,
  getFamilyDailyMoments,
  createFamilyMovementBingoCell,
  getFamilyMovementBingoCells,
  toggleFamilyMovementBingoCell,
  createFamilyTakeHomeNote,
  getFamilyTakeHomeNotes,
  toggleFamilyTakeHomeNote,
  createFamilyEncouragementPost,
  getFamilyEncouragementPosts,
  createFamilyEnergyStatus,
  getFamilyEnergyStatuses,
  createFamilyWishListItem,
  getFamilyWishListItems,
  updateFamilyWishListStatus,
  createFamilyMorningPlan,
  getFamilyMorningPlans,
  createFamilyVoiceMemo,
  getFamilyVoiceMemos,
  createFamilyAchievementEntry,
  getFamilyAchievementEntries,
} from "./db";
import { generatePhotoJournalStory, generateFamilyProposal, summarizeFamilyDay } from "./ai";
import { analyzePhotoWithAI } from "./familyAlbum";
import { getFamilyStats } from "./statistics";
import { buildWeekendPlanPoll, normalizeWeekendPlanDraft } from "../shared/familyWeekendPlans";
import {
  createFamilyNotification,
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  savePushSubscription,
  getNotificationSettings,
  updateNotificationSettings,
} from "./notifications";
import {
  getFamilyAssistantResponse,
  confirmFamilySchedule,
  getFamilyScheduleEvents,
  AssistantLanguage,
  ScheduleAction,
} from "./family-assistant";
import { transcribeAudio } from "./_core/voiceTranscription";
import { storagePut, storageGetSignedUrl } from "./storage";
import { evaluateGeofenceForLocation } from "./geofence-monitor";
import { buildWeeklyCron } from "./photo-journal-scheduler";
import { createHeartbeatJob, deleteHeartbeatJob, updateHeartbeatJob } from "./_core/heartbeat";
import { cancelWearableSimulation, clearWearableSimulationCancellation, generateWearableSnapshot, isWearableSimulationCancelled, persistWearableSnapshot, WearableSimulationCancelledError } from "./wearable-simulator";
import { broadcastFamilyLocationUpdate, broadcastRippleNotification } from "./websocket-integration";
import { buildCelebrationMetadata, CelebrationOccasion } from "./celebration";
import { MAX_ALBUM_PHOTO_BYTES, SUPPORTED_ALBUM_MIME_TYPES, albumFileExtension } from "../shared/album";
import { buildCheckInContent, buildCheckInMetadata } from "../shared/checkin";
import { buildTodayKizunaHighlights } from "../shared/familyHighlights";
import { formatGratitudeContent } from "../shared/gratitude";
import { buildWeeklyPulse } from "../shared/weeklyPulse";
import { buildTimeCapsuleCron } from "./time-capsule-scheduler";
import { formatWordBatonContent } from "../shared/familyCelebrations";
// Chat, Memory, and Routine features are imported but not yet fully integrated
// import { sendChatMessage, getChatHistory } from "./family-chat";
// import { createMemoryArchive, getMemoriesByDateRange, createTimeCapsule, getTimeCapsules } from "./memory-archive";
// import { createRoutine, getFamilyRoutines, completeRoutine, getRoutineStats } from "./family-routine";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  family: router({
    create: protectedProcedure
      .input(z.object({ name: z.string().min(1).max(255) }))
      .mutation(async ({ ctx, input }) => {
        const result = await createFamilyGroup(input.name, ctx.user.id);
        return { success: true, familyGroupId: (result as any).insertId };
      }),

    getUserGroups: protectedProcedure.query(async ({ ctx }) => {
      return await getUserFamilyGroups(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getFamilyGroupById(input.id);
      }),

    getMembers: protectedProcedure
      .input(z.object({ familyGroupId: z.number() }))
      .query(async ({ input }) => {
        return await getFamilyMembers(input.familyGroupId);
      }),

    createInvitation: protectedProcedure
      .input(
        z.object({
          familyGroupId: z.number(),
          suggestedRole: z.enum(["guardian", "child", "elderly"]),
          invitedEmail: z.string().email().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const invitationCode = nanoid(32);
        await createInvitation(
          input.familyGroupId,
          invitationCode,
          input.suggestedRole,
          input.invitedEmail
        );
        return { invitationCode };
      }),

    joinByInvitation: protectedProcedure
      .input(z.object({ invitationCode: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const invitation = await getInvitationByCode(input.invitationCode);
        if (!invitation) throw new Error("Invalid invitation code");
        if (new Date() > invitation.expiresAt) throw new Error("Invitation expired");

        await addFamilyMember(
          invitation.familyGroupId,
          ctx.user.id,
          invitation.suggestedRole as 'guardian' | 'child' | 'elderly'
        );
        return { success: true };
      }),
  }),

  timeline: router({
    getFamilyTimeline: protectedProcedure
      .input(z.object({ familyGroupId: z.number(), limit: z.number().default(50) }))
      .query(async ({ input }) => {
        return await getFamilyTimeline(input.familyGroupId, input.limit);
      }),

    getDigestAlbum: protectedProcedure
      .input(z.object({ familyGroupId: z.number(), yearMonth: z.string() }))
      .query(async ({ input }) => {
        return await getFamilyDigestAlbumEntries(input.familyGroupId, input.yearMonth);
      }),

    getDigestMonths: protectedProcedure
      .input(z.object({ familyGroupId: z.number() }))
      .query(async ({ input }) => {
        return await getFamilyDigestAvailableMonths(input.familyGroupId);
      }),

    createEntry: protectedProcedure
      .input(
        z.object({
          familyGroupId: z.number(),
          entryType: z.enum(["mood", "photo", "message", "location", "activity"]),
          content: z.string().optional(),
          imageUrl: z.string().optional(),
          metadata: z.any().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await createTimelineEntry(
          input.familyGroupId,
          ctx.user.id,
          input.entryType,
          input.content,
          input.imageUrl,
          input.metadata
        );
      }),
  }),

  album: router({
    list: protectedProcedure
      .input(z.object({ familyGroupId: z.number(), favoritesOnly: z.boolean().optional() }))
      .query(({ input }) => getFamilyAlbumPhotos(input.familyGroupId, input.favoritesOnly ?? false)),

    search: protectedProcedure
      .input(z.object({ familyGroupId: z.number(), keyword: z.string().max(100) }))
      .query(({ input }) => searchFamilyAlbumPhotos(input.familyGroupId, input.keyword)),

    upload: protectedProcedure
      .input(z.object({
        familyGroupId: z.number(),
        dataUrl: z.string().min(1),
        fileName: z.string().min(1).max(255),
        mimeType: z.enum(SUPPORTED_ALBUM_MIME_TYPES),
      }))
      .mutation(async ({ ctx, input }) => {
        const match = input.dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
        if (!match) throw new TRPCError({ code: "BAD_REQUEST", message: "Unsupported image data" });
        const imageBuffer = Buffer.from(match[2], "base64");
        if (imageBuffer.byteLength > MAX_ALBUM_PHOTO_BYTES) {
          throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Image must be 8MB or smaller" });
        }

        const extension = albumFileExtension(input.mimeType);
        const fileKey = `family-albums/${input.familyGroupId}/${ctx.user.id}/${nanoid()}.${extension}`;
        const { key, url } = await storagePut(fileKey, imageBuffer, input.mimeType);
        const analysis = await analyzePhotoWithAI(url);
        await createFamilyAlbumPhoto({
          familyGroupId: input.familyGroupId,
          userId: ctx.user.id,
          fileKey: key,
          imageUrl: url,
          fileName: input.fileName,
          mimeType: input.mimeType,
          description: analysis.description,
          tags: analysis.tags.slice(0, 8),
        });
        return { url, description: analysis.description, tags: analysis.tags.slice(0, 8) };
      }),

    setFavorite: protectedProcedure
      .input(z.object({ familyGroupId: z.number(), photoId: z.number(), isFavorite: z.boolean() }))
      .mutation(({ input }) => setFamilyAlbumPhotoFavorite(input)),
  }),

  checkIn: router({
    send: protectedProcedure
      .input(z.object({ familyGroupId: z.number(), note: z.string().max(120).optional() }))
      .mutation(async ({ ctx, input }) => {
        const displayName = ctx.user.name ?? "家族";
        const content = buildCheckInContent(input.note);
        await createTimelineEntry(input.familyGroupId, ctx.user.id, "message", content, undefined, buildCheckInMetadata());
        const members = await getFamilyMembers(input.familyGroupId);
        const guardianIds = members
          .filter((member) => member.family_members.memberRole === "guardian")
          .map((member) => member.family_members.userId);
        await createFamilyNotification({
          familyGroupId: input.familyGroupId,
          type: "safety",
          title: "安心チェックイン",
          message: `${displayName}さんが「大丈夫」と知らせました。`,
          payload: { status: "okay", note: content, sourceUserId: ctx.user.id },
          quiet: true,
          excludeUserId: ctx.user.id,
          recipientUserIds: guardianIds,
        });
        broadcastRippleNotification({
          familyGroupId: input.familyGroupId,
          userId: ctx.user.id,
          userName: displayName,
          activityType: "message",
          timestamp: Date.now(),
          metadata: { isCheckIn: true, status: "okay" },
        });
        return { success: true, content };
      }),
  }),

  highlights: router({
    today: protectedProcedure
      .input(z.object({ familyGroupId: z.number() }))
      .query(async ({ input }) => {
        const [timeline, locations, health] = await Promise.all([
          getFamilyTimeline(input.familyGroupId, 100),
          getFamilyLatestLocations(input.familyGroupId),
          getFamilyLatestWearableHealthSnapshots(input.familyGroupId),
        ]);
        return buildTodayKizunaHighlights({ timeline, locations, health });
      }),
  }),

  helpBoard: router({
    list: protectedProcedure
      .input(z.object({ familyGroupId: z.number() }))
      .query(({ input }) => getFamilyHelpRequests(input.familyGroupId)),

    create: protectedProcedure
      .input(z.object({ familyGroupId: z.number(), title: z.string().min(1).max(160), detail: z.string().max(500).optional() }))
      .mutation(async ({ ctx, input }) => {
        const request = await createFamilyHelpRequest({ ...input, requesterUserId: ctx.user.id });
        await createFamilyNotification({
          familyGroupId: input.familyGroupId,
          type: "activity",
          title: "おたすけリクエスト",
          message: `${ctx.user.name ?? "家族"}さんが「${input.title}」をお願いしています。`,
          payload: { requestId: request.id, kind: "help_request" },
          excludeUserId: ctx.user.id,
          quiet: true,
        });
        return request;
      }),

    accept: protectedProcedure
      .input(z.object({ familyGroupId: z.number(), requestId: z.number() }))
      .mutation(({ ctx, input }) => acceptFamilyHelpRequest({ ...input, helperUserId: ctx.user.id })),

    complete: protectedProcedure
      .input(z.object({ familyGroupId: z.number(), requestId: z.number() }))
      .mutation(({ ctx, input }) => completeFamilyHelpRequest({ ...input, userId: ctx.user.id })),
  }),

  gratitude: router({
    send: protectedProcedure
      .input(z.object({ familyGroupId: z.number(), message: z.string().min(1).max(140), stamp: z.string().max(12).optional() }))
      .mutation(async ({ ctx, input }) => {
        const stamp = input.stamp || "💐";
        const content = formatGratitudeContent(input.message, stamp);
        await createTimelineEntry(input.familyGroupId, ctx.user.id, "message", content, undefined, { isGratitude: true, stamp });
        await createFamilyNotification({
          familyGroupId: input.familyGroupId,
          type: "celebration",
          title: "ありがとうリレー",
          message: `${ctx.user.name ?? "家族"}さんから感謝が届きました。`,
          payload: { message: input.message, stamp, isGratitude: true },
          excludeUserId: ctx.user.id,
          quiet: true,
        });
        broadcastRippleNotification({
          familyGroupId: input.familyGroupId,
          userId: ctx.user.id,
          userName: ctx.user.name ?? "家族",
          activityType: "message",
          timestamp: Date.now(),
          metadata: { isGratitude: true, stamp },
        });
        return { success: true, content };
      }),
  }),

  pulse: router({
    weekly: protectedProcedure
      .input(z.object({ familyGroupId: z.number() }))
      .query(async ({ input }) => {
        const [timeline, albumPhotos, health] = await Promise.all([
          getFamilyTimeline(input.familyGroupId, 500),
          getFamilyAlbumPhotos(input.familyGroupId),
          getFamilyLatestWearableHealthSnapshots(input.familyGroupId),
        ]);
        return buildWeeklyPulse({ timeline, albumPhotos, health });
      }),
  }),

  shopping: router({
    list: protectedProcedure
      .input(z.object({ familyGroupId: z.number() }))
      .query(({ input }) => getFamilyShoppingItems(input.familyGroupId)),
    create: protectedProcedure
      .input(z.object({ familyGroupId: z.number(), itemName: z.string().min(1).max(160), quantity: z.string().max(80).optional() }))
      .mutation(({ ctx, input }) => createFamilyShoppingItem({ ...input, createdByUserId: ctx.user.id })),
    toggle: protectedProcedure
      .input(z.object({ familyGroupId: z.number(), itemId: z.number(), isPurchased: z.boolean() }))
      .mutation(({ ctx, input }) => toggleFamilyShoppingItem({ ...input, userId: ctx.user.id })),
  }),

  timeCapsule: router({
    list: protectedProcedure
      .input(z.object({ familyGroupId: z.number() }))
      .query(({ input }) => getFamilyTimeCapsules(input.familyGroupId)),
    create: protectedProcedure
      .input(z.object({ familyGroupId: z.number(), title: z.string().min(1).max(160), message: z.string().min(1).max(2000), opensAt: z.string().datetime() }))
      .mutation(async ({ ctx, input }) => {
        const opensAt = new Date(input.opensAt);
        if (opensAt <= new Date()) throw new TRPCError({ code: "BAD_REQUEST", message: "公開日時は未来に設定してください" });
        const capsule = await createFamilyTimeCapsule({ ...input, opensAt, creatorUserId: ctx.user.id });
        const sessionToken = parseCookie(ctx.req.headers.cookie ?? "")[COOKIE_NAME] ?? "";
        if (!sessionToken) throw new TRPCError({ code: "UNAUTHORIZED", message: "スケジュール登録には再ログインが必要です" });
        const cron = buildTimeCapsuleCron(opensAt);
        const job = await createHeartbeatJob({
          name: `kizuna-capsule-${capsule.id}`,
          cron,
          path: "/api/scheduled/releaseTimeCapsule",
          payload: {},
          description: `Release family time capsule ${capsule.id}`,
        }, sessionToken);
        await setFamilyTimeCapsuleTaskUid(capsule.id, job.taskUid);
        return { ...capsule, scheduleCronTaskUid: job.taskUid, cron };
      }),
  }),

  familyPoll: router({
    list: protectedProcedure
      .input(z.object({ familyGroupId: z.number() }))
      .query(({ ctx, input }) => getFamilyPollsWithResults(input.familyGroupId, ctx.user.id)),
    create: protectedProcedure
      .input(z.object({ familyGroupId: z.number(), question: z.string().min(1).max(240), options: z.array(z.string().min(1).max(80)).min(2).max(4), endsAt: z.string().datetime() }))
      .mutation(({ ctx, input }) => createFamilyPoll({ ...input, endsAt: new Date(input.endsAt), creatorUserId: ctx.user.id })),
    answer: protectedProcedure
      .input(z.object({ pollId: z.number(), optionIndex: z.number().int().min(0).max(3) }))
      .mutation(({ ctx, input }) => answerFamilyPoll({ ...input, userId: ctx.user.id })),
  }),

  safetyChecklist: router({
    list: protectedProcedure.input(z.object({ familyGroupId: z.number() })).query(({ input }) => getFamilySafetyChecklistItems(input.familyGroupId)),
    create: protectedProcedure.input(z.object({ familyGroupId: z.number(), label: z.string().min(1).max(180), category: z.string().min(1).max(80) })).mutation(({ ctx, input }) => createFamilySafetyChecklistItem({ ...input, createdByUserId: ctx.user.id })),
    toggle: protectedProcedure.input(z.object({ familyGroupId: z.number(), itemId: z.number(), isCompleted: z.boolean() })).mutation(({ input }) => toggleFamilySafetyChecklistItem(input)),
  }),

  celebrationCalendar: router({
    list: protectedProcedure.input(z.object({ familyGroupId: z.number() })).query(({ input }) => getFamilyCelebrationDates(input.familyGroupId)),
    create: protectedProcedure.input(z.object({ familyGroupId: z.number(), title: z.string().min(1).max(160), celebrationAt: z.string().datetime() })).mutation(({ ctx, input }) => createFamilyCelebrationDate({ ...input, createdByUserId: ctx.user.id, celebrationAt: new Date(input.celebrationAt) })),
  }),

  wordBaton: router({
    list: protectedProcedure.input(z.object({ familyGroupId: z.number() })).query(async ({ input }) => {
      const entries = await getFamilyTimeline(input.familyGroupId, 100);
      return entries.filter((entry) => Boolean((entry.metadata as Record<string, unknown> | null)?.isWordBaton)).slice(0, 20);
    }),
    add: protectedProcedure.input(z.object({ familyGroupId: z.number(), content: z.string().min(1).max(180) })).mutation(async ({ ctx, input }) => {
      await createTimelineEntry(input.familyGroupId, ctx.user.id, "message", formatWordBatonContent(input.content), undefined, { isWordBaton: true });
      return { success: true };
    }),
  }),

  familyContacts: router({
    list: protectedProcedure.input(z.object({ familyGroupId: z.number() })).query(({ input }) => getFamilyContactCards(input.familyGroupId)),
    create: protectedProcedure.input(z.object({ familyGroupId: z.number(), label: z.string().min(1).max(120), phone: z.string().min(1).max(40), category: z.string().min(1).max(80) })).mutation(({ ctx, input }) => createFamilyContactCard({ ...input, createdByUserId: ctx.user.id })),
  }),
  gentleRules: router({
    list: protectedProcedure.input(z.object({ familyGroupId: z.number() })).query(({ input }) => getFamilyGentleRules(input.familyGroupId)),
    create: protectedProcedure.input(z.object({ familyGroupId: z.number(), title: z.string().min(1).max(160), detail: z.string().max(500).optional() })).mutation(({ ctx, input }) => createFamilyGentleRule({ ...input, createdByUserId: ctx.user.id })),
    toggle: protectedProcedure.input(z.object({ familyGroupId: z.number(), ruleId: z.number(), isAgreed: z.boolean() })).mutation(({ input }) => toggleFamilyGentleRule(input)),
  }),
  weekendPlanner: router({
    list: protectedProcedure.input(z.object({ familyGroupId: z.number() })).query(({ input }) => getFamilyWeekendPlans(input.familyGroupId)),
    create: protectedProcedure.input(z.object({ familyGroupId: z.number(), title: z.string().min(1).max(160), description: z.string().max(500).optional(), activityType: z.enum(["indoor", "outdoor", "hybrid"]) })).mutation(({ ctx, input }) => createFamilyWeekendPlan({ ...normalizeWeekendPlanDraft(input), familyGroupId: input.familyGroupId, createdByUserId: ctx.user.id })),
    share: protectedProcedure.input(z.object({ familyGroupId: z.number(), planId: z.number() })).mutation(async ({ ctx, input }) => {
      const plan = await getFamilyWeekendPlan(input.familyGroupId, input.planId);
      if (!plan) throw new TRPCError({ code: "NOT_FOUND", message: "週末プランが見つかりません" });
      if (plan.sharedPollId) return { pollId: plan.sharedPollId, alreadyShared: true as const };
      const poll = buildWeekendPlanPoll(plan.title);
      const createdPoll = await createFamilyPoll({ familyGroupId: input.familyGroupId, creatorUserId: ctx.user.id, ...poll });
      await setFamilyWeekendPlanShared({ familyGroupId: input.familyGroupId, planId: plan.id, sharedPollId: createdPoll.id });
      return { pollId: createdPoll.id, alreadyShared: false as const };
    }),
  }),
  roleMap: router({
    list: protectedProcedure.input(z.object({ familyGroupId: z.number() })).query(async ({ input }) => {
      const [members, profiles] = await Promise.all([getFamilyMembers(input.familyGroupId), getFamilyRoleProfiles(input.familyGroupId)]);
      return members.map(({ family_members, users }) => {
        const profile = profiles.find((item) => item.userId === users.id);
        return { userId: users.id, name: users.name ?? "家族", memberRole: family_members.memberRole, strengths: Array.isArray(profile?.strengths) ? profile.strengths.filter((skill): skill is string => typeof skill === "string") : [], supportNote: profile?.supportNote ?? null };
      });
    }),
    saveMine: protectedProcedure.input(z.object({ familyGroupId: z.number(), strengths: z.array(z.string().trim().min(1).max(32)).max(8), supportNote: z.string().trim().max(240).optional() })).mutation(({ ctx, input }) => upsertFamilyRoleProfile({ familyGroupId: input.familyGroupId, userId: ctx.user.id, strengths: input.strengths, supportNote: input.supportNote })),
  }),
  bookshelf: router({
    list: protectedProcedure.input(z.object({ familyGroupId: z.number() })).query(({ input }) => getFamilyBookshelfItems(input.familyGroupId)),
    create: protectedProcedure.input(z.object({ familyGroupId: z.number(), title: z.string().trim().min(1).max(180), resourceType: z.enum(["book", "video", "article"]), theme: z.string().trim().min(1).max(80), resourceUrl: z.string().url().max(512).optional().or(z.literal("")), note: z.string().trim().max(500).optional() })).mutation(({ ctx, input }) => createFamilyBookshelfItem({ ...input, resourceUrl: input.resourceUrl || undefined, note: input.note || undefined, createdByUserId: ctx.user.id })),
  }),
  outingPrep: router({
    list: protectedProcedure.input(z.object({ familyGroupId: z.number() })).query(({ input }) => getFamilyOutingsWithChecklist(input.familyGroupId)),
    createOuting: protectedProcedure.input(z.object({ familyGroupId: z.number(), title: z.string().trim().min(1).max(160), meetingAt: z.string().datetime(), meetingPlace: z.string().trim().max(180).optional(), notes: z.string().trim().max(500).optional() })).mutation(({ ctx, input }) => createFamilyOuting({ familyGroupId: input.familyGroupId, createdByUserId: ctx.user.id, title: input.title, meetingAt: new Date(input.meetingAt), meetingPlace: input.meetingPlace || undefined, notes: input.notes || undefined })),
    addItem: protectedProcedure.input(z.object({ outingId: z.number(), label: z.string().trim().min(1).max(180) })).mutation(({ ctx, input }) => createFamilyOutingChecklistItem({ ...input, createdByUserId: ctx.user.id })),
    toggleItem: protectedProcedure.input(z.object({ outingId: z.number(), itemId: z.number(), isCompleted: z.boolean() })).mutation(({ input }) => toggleFamilyOutingChecklistItem(input)),
  }),
  mealRelay: router({
    list: protectedProcedure.input(z.object({ familyGroupId: z.number() })).query(({ input }) => getFamilyMealIdeas(input.familyGroupId)),
    create: protectedProcedure.input(z.object({ familyGroupId: z.number(), title: z.string().trim().min(1).max(160), ideaType: z.enum(["want", "can_make"]), note: z.string().trim().max(240).optional() })).mutation(({ ctx, input }) => createFamilyMealIdea({ ...input, note: input.note || undefined, createdByUserId: ctx.user.id })),
    select: protectedProcedure.input(z.object({ familyGroupId: z.number(), mealIdeaId: z.number() })).mutation(({ input }) => selectFamilyMealIdea(input)),
  }),
  careBoard: router({
    list: protectedProcedure.input(z.object({ familyGroupId: z.number() })).query(({ input }) => getFamilyCareDuties(input.familyGroupId)),
    create: protectedProcedure.input(z.object({ familyGroupId: z.number(), assignedUserId: z.number().optional(), careTarget: z.string().trim().min(1).max(80), title: z.string().trim().min(1).max(180), dueOn: z.string().datetime().optional() })).mutation(({ ctx, input }) => createFamilyCareDuty({ ...input, createdByUserId: ctx.user.id, dueOn: input.dueOn ? new Date(input.dueOn) : undefined })),
    complete: protectedProcedure.input(z.object({ familyGroupId: z.number(), dutyId: z.number(), isDone: z.boolean() })).mutation(({ input }) => completeFamilyCareDuty(input)),
  }),
  funLottery: router({
    list: protectedProcedure.input(z.object({ familyGroupId: z.number() })).query(({ input }) => getFamilyFunPrompts(input.familyGroupId)),
    create: protectedProcedure.input(z.object({ familyGroupId: z.number(), content: z.string().trim().min(1).max(240), theme: z.string().trim().min(1).max(80) })).mutation(({ ctx, input }) => createFamilyFunPrompt({ ...input, createdByUserId: ctx.user.id })),
  }),
  careMessages: router({
    list: protectedProcedure.input(z.object({ familyGroupId: z.number() })).query(({ input }) => getFamilyCareMessages(input.familyGroupId)),
    create: protectedProcedure.input(z.object({ familyGroupId: z.number(), recipientUserId: z.number().optional(), message: z.string().trim().min(1).max(180) })).mutation(async ({ ctx, input }) => {
      await createFamilyNotification({ familyGroupId: input.familyGroupId, type: "safety", title: "見守りメッセージ帳", message: `${ctx.user.name ?? "家族"}さんから気づかいメッセージが届きました。`, payload: { message: input.message }, excludeUserId: ctx.user.id, quiet: true });
      return createFamilyCareMessage({ ...input, senderUserId: ctx.user.id });
    }),
    markRead: protectedProcedure.input(z.object({ familyGroupId: z.number(), messageId: z.number() })).mutation(({ input }) => markFamilyCareMessageRead(input)),
  }),
  sharedShelf: router({
    list: protectedProcedure.input(z.object({ familyGroupId: z.number() })).query(({ input }) => getFamilySharedItems(input.familyGroupId)),
    create: protectedProcedure.input(z.object({ familyGroupId: z.number(), itemName: z.string().trim().min(1).max(160), note: z.string().trim().max(240).optional() })).mutation(({ ctx, input }) => createFamilySharedItem({ ...input, note: input.note || undefined, ownerUserId: ctx.user.id })),
    updateStatus: protectedProcedure.input(z.object({ familyGroupId: z.number(), itemId: z.number(), borrowerUserId: z.number().optional(), status: z.enum(["available", "borrowed", "returned"]) })).mutation(({ input }) => updateFamilySharedItemStatus(input)),
  }),
  monthlyChallenge: router({
    list: protectedProcedure.input(z.object({ familyGroupId: z.number() })).query(({ input }) => getFamilyMonthlyChallenges(input.familyGroupId)),
    create: protectedProcedure.input(z.object({ familyGroupId: z.number(), title: z.string().trim().min(1).max(160), description: z.string().trim().max(240).optional(), targetCount: z.number().int().min(1).max(99), celebrationNote: z.string().trim().max(180).optional() })).mutation(({ ctx, input }) => createFamilyMonthlyChallenge({ ...input, description: input.description || undefined, celebrationNote: input.celebrationNote || undefined, createdByUserId: ctx.user.id })),
    advance: protectedProcedure.input(z.object({ familyGroupId: z.number(), challengeId: z.number(), delta: z.number().int().min(-1).max(1) })).mutation(({ input }) => advanceFamilyMonthlyChallenge(input)),
  }),
  walkRoutes: router({
    list: protectedProcedure.input(z.object({ familyGroupId: z.number() })).query(({ input }) => getFamilyWalkRoutes(input.familyGroupId)),
    create: protectedProcedure.input(z.object({ familyGroupId: z.number(), title: z.string().trim().min(1).max(160), description: z.string().trim().max(500).optional(), startPoint: z.string().trim().min(1).max(180), highlights: z.string().trim().max(500).optional(), distanceKm: z.number().positive().max(99.99), durationMin: z.number().int().min(1).max(1_440), safetyNote: z.string().trim().max(280).optional() })).mutation(({ ctx, input }) => createFamilyWalkRoute({ ...input, description: input.description || undefined, highlights: input.highlights || undefined, safetyNote: input.safetyNote || undefined, createdByUserId: ctx.user.id })),
  }),
  learningCards: router({
    list: protectedProcedure.input(z.object({ familyGroupId: z.number() })).query(({ input }) => getFamilyLearningCards(input.familyGroupId)),
    create: protectedProcedure.input(z.object({ familyGroupId: z.number(), title: z.string().trim().min(1).max(160), source: z.string().trim().max(180).optional(), sourceType: z.enum(["book", "school", "work", "other"]), insight: z.string().trim().min(1).max(500) })).mutation(({ ctx, input }) => createFamilyLearningCard({ ...input, source: input.source || undefined, createdByUserId: ctx.user.id })),
  }),
  dailyMoments: router({
    list: protectedProcedure.input(z.object({ familyGroupId: z.number() })).query(({ input }) => getFamilyDailyMoments(input.familyGroupId)),
    create: protectedProcedure.input(z.object({ familyGroupId: z.number(), photoId: z.number().int().positive().optional(), moodSign: z.string().trim().max(32).optional(), note: z.string().trim().min(1).max(280) })).mutation(({ ctx, input }) => createFamilyDailyMoment({ ...input, photoId: input.photoId || undefined, moodSign: input.moodSign || undefined, createdByUserId: ctx.user.id })),
  }),
  movementBingo: router({
    list: protectedProcedure.input(z.object({ familyGroupId: z.number() })).query(({ input }) => getFamilyMovementBingoCells(input.familyGroupId)),
    create: protectedProcedure.input(z.object({ familyGroupId: z.number(), label: z.string().trim().min(1).max(100), icon: z.string().trim().max(16).optional() })).mutation(({ ctx, input }) => createFamilyMovementBingoCell({ ...input, icon: input.icon || undefined, createdByUserId: ctx.user.id })),
    toggle: protectedProcedure.input(z.object({ familyGroupId: z.number(), cellId: z.number(), isCompleted: z.boolean() })).mutation(({ input }) => toggleFamilyMovementBingoCell(input)),
  }),
  takeHomeNotes: router({
    list: protectedProcedure.input(z.object({ familyGroupId: z.number() })).query(({ input }) => getFamilyTakeHomeNotes(input.familyGroupId)),
    create: protectedProcedure.input(z.object({ familyGroupId: z.number(), category: z.enum(["school", "work", "outing", "other"]), title: z.string().trim().min(1).max(160), content: z.string().trim().min(1).max(500) })).mutation(({ ctx, input }) => createFamilyTakeHomeNote({ ...input, createdByUserId: ctx.user.id })),
    toggleResolved: protectedProcedure.input(z.object({ familyGroupId: z.number(), noteId: z.number(), isResolved: z.boolean() })).mutation(({ input }) => toggleFamilyTakeHomeNote(input)),
  }),
  encouragements: router({
    list: protectedProcedure.input(z.object({ familyGroupId: z.number() })).query(({ input }) => getFamilyEncouragementPosts(input.familyGroupId)),
    create: protectedProcedure.input(z.object({ familyGroupId: z.number(), recipientUserId: z.number().optional(), message: z.string().trim().min(1).max(180), stamp: z.string().trim().max(16).optional() })).mutation(({ ctx, input }) => createFamilyEncouragementPost({ ...input, recipientUserId: input.recipientUserId || undefined, stamp: input.stamp || undefined, senderUserId: ctx.user.id })),
  }),
  energyStatuses: router({
    list: protectedProcedure.input(z.object({ familyGroupId: z.number() })).query(({ input }) => getFamilyEnergyStatuses(input.familyGroupId)),
    share: protectedProcedure.input(z.object({ familyGroupId: z.number(), energyLevel: z.number().int().min(1).max(5), note: z.string().trim().max(160).optional() })).mutation(({ ctx, input }) => createFamilyEnergyStatus({ ...input, note: input.note || undefined, userId: ctx.user.id })),
  }),
  wishList: router({
    list: protectedProcedure.input(z.object({ familyGroupId: z.number() })).query(({ input }) => getFamilyWishListItems(input.familyGroupId)),
    create: protectedProcedure.input(z.object({ familyGroupId: z.number(), title: z.string().trim().min(1).max(160), category: z.enum(["place", "activity", "challenge", "other"]), note: z.string().trim().max(240).optional() })).mutation(({ ctx, input }) => createFamilyWishListItem({ ...input, note: input.note || undefined, createdByUserId: ctx.user.id })),
    updateStatus: protectedProcedure.input(z.object({ familyGroupId: z.number(), itemId: z.number(), status: z.enum(["wish", "candidate", "done"]) })).mutation(({ input }) => updateFamilyWishListStatus(input)),
  }),
  morningPlans: router({
    list: protectedProcedure.input(z.object({ familyGroupId: z.number() })).query(({ input }) => getFamilyMorningPlans(input.familyGroupId)),
    share: protectedProcedure.input(z.object({ familyGroupId: z.number(), departureTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(), moodSign: z.string().trim().max(32).optional(), carryingItems: z.string().trim().max(280).optional(), isReady: z.boolean() })).mutation(({ ctx, input }) => createFamilyMorningPlan({ ...input, departureTime: input.departureTime || undefined, moodSign: input.moodSign || undefined, carryingItems: input.carryingItems || undefined, userId: ctx.user.id })),
  }),
  voiceMemos: router({
    list: protectedProcedure.input(z.object({ familyGroupId: z.number() })).query(({ input }) => getFamilyVoiceMemos(input.familyGroupId)),
    upload: protectedProcedure.input(z.object({ familyGroupId: z.number(), dataUrl: z.string().min(1), mimeType: z.enum(["audio/webm", "audio/ogg", "audio/mp4"]), durationSeconds: z.number().int().min(0).max(600), note: z.string().trim().max(180).optional() })).mutation(async ({ ctx, input }) => {
      const match = input.dataUrl.match(/^data:(audio\/(?:webm|ogg|mp4));base64,([A-Za-z0-9+/=]+)$/);
      if (!match || match[1] !== input.mimeType) throw new TRPCError({ code: "BAD_REQUEST", message: "Unsupported audio data" });
      const audioBuffer = Buffer.from(match[2], "base64");
      if (audioBuffer.byteLength > 8 * 1024 * 1024) throw new TRPCError({ code: "PAYLOAD_TOO_LARGE", message: "Audio must be 8MB or smaller" });
      const extension = input.mimeType === "audio/ogg" ? "ogg" : input.mimeType === "audio/mp4" ? "m4a" : "webm";
      const uploaded = await storagePut(`family-voice-memos/${input.familyGroupId}/${ctx.user.id}/${nanoid()}.${extension}`, audioBuffer, input.mimeType);
      return createFamilyVoiceMemo({ familyGroupId: input.familyGroupId, userId: ctx.user.id, fileKey: uploaded.key, audioUrl: uploaded.url, mimeType: input.mimeType, durationSeconds: input.durationSeconds, note: input.note || undefined });
    }),
  }),
  achievements: router({
    list: protectedProcedure.input(z.object({ familyGroupId: z.number() })).query(({ input }) => getFamilyAchievementEntries(input.familyGroupId)),
    create: protectedProcedure.input(z.object({ familyGroupId: z.number(), title: z.string().trim().min(1).max(160), category: z.enum(["help", "movement", "challenge", "other"]), note: z.string().trim().max(240).optional() })).mutation(({ ctx, input }) => createFamilyAchievementEntry({ ...input, note: input.note || undefined, userId: ctx.user.id })),
  }),

  activity: router({
    logActivity: protectedProcedure
      .input(
        z.object({
          familyGroupId: z.number(),
          activityType: z.enum(["walking", "photo", "music", "location", "mood", "message"]),
          activityData: z.any().optional(),
          latitude: z.number().optional(),
          longitude: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await logUserActivity(
          ctx.user.id,
          input.familyGroupId,
          input.activityType,
          input.activityData,
          input.latitude,
          input.longitude
        );
      }),
  }),

  location: router({
    saveLocation: protectedProcedure
      .input(
        z.object({
          familyGroupId: z.number(),
          latitude: z.number(),
          longitude: z.number(),
          accuracy: z.number().optional(),
          locationName: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const saved = await saveLocationHistory(
          ctx.user.id,
          input.familyGroupId,
          input.latitude,
          input.longitude,
          input.accuracy,
          input.locationName
        );
        broadcastFamilyLocationUpdate({
          familyGroupId: input.familyGroupId,
          userId: ctx.user.id,
          userName: ctx.user.name ?? "Family member",
          latitude: input.latitude,
          longitude: input.longitude,
          accuracy: input.accuracy,
          locationName: input.locationName,
          timestamp: Date.now(),
        });
        const alerts = await evaluateGeofenceForLocation({
          familyGroupId: input.familyGroupId,
          userId: ctx.user.id,
          userName: ctx.user.name,
          latitude: input.latitude,
          longitude: input.longitude,
        });
        return { saved, alerts };
      }),

    latestByFamily: protectedProcedure
      .input(z.object({ familyGroupId: z.number() }))
      .query(async ({ input }) => getFamilyLatestLocations(input.familyGroupId)),

    history: protectedProcedure
      .input(z.object({
        familyGroupId: z.number(),
        from: z.coerce.date(),
        to: z.coerce.date(),
        userId: z.number().optional(),
        limit: z.number().int().min(1).max(5000).default(5000),
      }))
      .query(async ({ input }) => {
        if (input.from >= input.to) throw new TRPCError({ code: "BAD_REQUEST", message: "from must be before to" });
        const maxRangeMs = 31 * 24 * 60 * 60 * 1000;
        if (input.to.getTime() - input.from.getTime() > maxRangeMs) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Location history range is limited to 31 days" });
        }
        return getFamilyLocationHistory(input);
      }),
  }),

  geofence: router({
    create: protectedProcedure
      .input(
        z.object({
          familyGroupId: z.number(),
          name: z.string(),
          latitude: z.number(),
          longitude: z.number(),
          radiusMeters: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        return await createGeofence(
          input.familyGroupId,
          input.name,
          input.latitude,
          input.longitude,
          input.radiusMeters
        );
      }),

    getByFamilyGroup: protectedProcedure
      .input(z.object({ familyGroupId: z.number() }))
      .query(async ({ input }) => {
        return await getFamilyGeofences(input.familyGroupId);
      }),

    acknowledgeAlert: protectedProcedure
      .input(z.object({ familyGroupId: z.number(), geofenceId: z.number() }))
      .mutation(async ({ ctx, input }) => acknowledgeGeofenceAlert(ctx.user.id, input.familyGroupId, input.geofenceId)),
  }),

  health: router({
    simulate: protectedProcedure
      .input(z.object({ familyGroupId: z.number(), seed: z.number().optional(), simulationId: z.string().min(1).max(80) }))
      .mutation(async ({ ctx, input }) => {
        if (isWearableSimulationCancelled(input.simulationId)) {
          clearWearableSimulationCancellation(input.simulationId);
          return { cancelled: true, simulationId: input.simulationId };
        }
        const snapshot = generateWearableSnapshot({ familyGroupId: input.familyGroupId, userId: ctx.user.id, seed: input.seed });
        if (isWearableSimulationCancelled(input.simulationId)) {
          clearWearableSimulationCancellation(input.simulationId);
          return { cancelled: true, simulationId: input.simulationId };
        }
        let persisted;
        try {
          persisted = await persistWearableSnapshot(snapshot, input.simulationId);
        } catch (error) {
          if (error instanceof WearableSimulationCancelledError) {
            clearWearableSimulationCancellation(input.simulationId);
            return { cancelled: true, simulationId: input.simulationId };
          }
          throw error;
        }
        if (isWearableSimulationCancelled(input.simulationId)) {
          clearWearableSimulationCancellation(input.simulationId);
          return { cancelled: true, simulationId: input.simulationId };
        }
        broadcastRippleNotification({
          familyGroupId: input.familyGroupId,
          userId: ctx.user.id,
          activityType: "walking",
          userName: ctx.user.name ?? "Family member",
          timestamp: Date.now(),
          metadata: { source: "simulated", steps: snapshot.steps, heartRate: snapshot.heartRate, sleepMinutes: snapshot.sleepMinutes },
        });
        clearWearableSimulationCancellation(input.simulationId);
        return { ...persisted, cancelled: false, simulationId: input.simulationId };
      }),

    stopSimulation: protectedProcedure
      .input(z.object({ simulationId: z.string().min(1).max(80) }))
      .mutation(async ({ input }) => {
        cancelWearableSimulation(input.simulationId);
        return { success: true, simulationId: input.simulationId };
      }),

    latest: protectedProcedure
      .input(z.object({ familyGroupId: z.number() }))
      .query(async ({ ctx, input }) => {
        const { getLatestWearableHealthSnapshot } = await import("./db");
        return getLatestWearableHealthSnapshot(input.familyGroupId, ctx.user.id);
      }),
  }),

  celebration: router({
    send: protectedProcedure
      .input(z.object({
        familyGroupId: z.number(),
        message: z.string().trim().min(1).max(1000),
        occasion: z.enum(["birthday", "achievement", "welcome", "thanks", "encouragement", "general"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const metadata = buildCelebrationMetadata(input.message, input.occasion as CelebrationOccasion | undefined);
        await createTimelineEntry(input.familyGroupId, ctx.user.id, "message", input.message, undefined, metadata);
        await createFamilyNotification({
          familyGroupId: input.familyGroupId,
          type: "celebration",
          title: "お祝いメッセージ",
          message: input.message,
          payload: metadata,
          quiet: true,
        });
        broadcastRippleNotification({
          familyGroupId: input.familyGroupId,
          userId: ctx.user.id,
          activityType: "message",
          userName: ctx.user.name ?? "Family member",
          timestamp: Date.now(),
          metadata,
        });
        return { success: true, metadata };
      }),
  }),

  photoJournal: router({
    getSchedule: protectedProcedure
      .input(z.object({ familyGroupId: z.number() }))
      .query(async ({ ctx, input }) => getPhotoJournalSchedule(input.familyGroupId, ctx.user.id)),

    list: protectedProcedure
      .input(z.object({ familyGroupId: z.number() }))
      .query(async ({ input }) => getRecentPhotoJournals(input.familyGroupId)),

    saveSchedule: protectedProcedure
      .input(z.object({
        familyGroupId: z.number(),
        enabled: z.boolean(),
        weekday: z.number().int().min(0).max(6),
        hour: z.number().int().min(0).max(23),
        minute: z.number().int().min(0).max(59),
      }))
      .mutation(async ({ ctx, input }) => {
        const existing = await getPhotoJournalSchedule(input.familyGroupId, ctx.user.id);
        const saved = await upsertPhotoJournalSchedule({ ...input, userId: ctx.user.id });
        const sessionToken = parseCookie(ctx.req.headers.cookie ?? "")[COOKIE_NAME] ?? "";
        const cron = buildWeeklyCron(input.weekday, input.hour, input.minute);
        const job = {
          name: `kizuna-weekly-journal-${input.familyGroupId}-${ctx.user.id}`,
          cron,
          path: "/api/scheduled/generateWeeklyPhotoJournal",
          payload: {},
          description: "Weekly KizunaSync AI photo journal generation",
        } as const;

        if (input.enabled) {
          if (existing?.scheduleCronTaskUid) {
            await updateHeartbeatJob(existing.scheduleCronTaskUid, { cron, enable: true, path: job.path, payload: job.payload, description: job.description }, sessionToken);
          } else {
            const created = await createHeartbeatJob(job, sessionToken);
            await setPhotoJournalScheduleTaskUid(saved.id, created.taskUid);
          }
        } else if (existing?.scheduleCronTaskUid) {
          await updateHeartbeatJob(existing.scheduleCronTaskUid, { enable: false }, sessionToken);
        }
        return { ...saved, cron, setupRequired: !sessionToken };
      }),
  }),

  ai: router({
    generatePhotoJournal: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          description: z.string(),
          photoCount: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        const story = await generatePhotoJournalStory(
          input.title,
          input.description,
          input.photoCount
        );
        return { story };
      }),

    generateFamilyProposal: protectedProcedure
      .input(
        z.object({
          familyName: z.string(),
          preferences: z.string(),
          memberCount: z.number(),
          roles: z.array(z.string()),
        })
      )
      .mutation(async ({ input }) => {
        const proposal = await generateFamilyProposal(
          input.familyName,
          input.preferences,
          input.memberCount,
          input.roles
        );
        return { proposal };
      }),

    summarizeDay: protectedProcedure
      .input(
        z.object({
          activities: z.array(
            z.object({
              userName: z.string(),
              activityType: z.string(),
              content: z.string().optional(),
            })
          ),
        })
      )
      .mutation(async ({ input }) => {
        const summary = await summarizeFamilyDay(input.activities);
        return { summary };
      }),
  }),
  statistics: router({
    getFamilyStats: protectedProcedure
      .input(z.object({ familyGroupId: z.number() }))
      .query(async ({ input }) => {
        return await getFamilyStats(input.familyGroupId);
      }),
  }),

  notifications: router({
    list: protectedProcedure
      .input(z.object({ familyGroupId: z.number(), limit: z.number().min(1).max(100).default(30) }))
      .query(async ({ ctx, input }) => getUserNotifications(ctx.user.id, input.familyGroupId, input.limit)),

    unreadCount: protectedProcedure
      .input(z.object({ familyGroupId: z.number() }))
      .query(async ({ ctx, input }) => getUnreadNotificationCount(ctx.user.id, input.familyGroupId)),

    settings: protectedProcedure
      .input(z.object({ familyGroupId: z.number() }))
      .query(async ({ ctx, input }) => getNotificationSettings(ctx.user.id, input.familyGroupId)),

    updateSettings: protectedProcedure
      .input(
        z.object({
          familyGroupId: z.number(),
          vibrationEnabled: z.boolean(),
          soundEnabled: z.boolean(),
          bannerEnabled: z.boolean(),
          quietMode: z.boolean(),
        })
      )
      .mutation(async ({ ctx, input }) => updateNotificationSettings(ctx.user.id, input.familyGroupId, {
        vibrationEnabled: input.vibrationEnabled,
        soundEnabled: input.soundEnabled,
        bannerEnabled: input.bannerEnabled,
        quietMode: input.quietMode,
      })),

    markRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ ctx, input }) => markNotificationRead(ctx.user.id, input.notificationId)),

    markAllRead: protectedProcedure
      .input(z.object({ familyGroupId: z.number() }))
      .mutation(async ({ ctx, input }) => markAllNotificationsRead(ctx.user.id, input.familyGroupId)),

    publish: protectedProcedure
      .input(
        z.object({
          familyGroupId: z.number(),
          type: z.enum(["calendar_event", "achievement", "reward", "safety", "assistant", "activity"]),
          title: z.string().min(1).max(255),
          message: z.string().min(1),
          payload: z.record(z.string(), z.unknown()).optional(),
          quiet: z.boolean().default(true),
          excludeSelf: z.boolean().default(false),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return createFamilyNotification({
          familyGroupId: input.familyGroupId,
          type: input.type,
          title: input.title,
          message: input.message,
          payload: input.payload,
          quiet: input.quiet,
          excludeUserId: input.excludeSelf ? ctx.user.id : undefined,
        });
      }),

    subscribe: protectedProcedure
      .input(
        z.object({
          endpoint: z.string().url(),
          keys: z.object({ auth: z.string().min(1), p256dh: z.string().min(1) }),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await savePushSubscription(ctx.user.id, input);
        return { success: true } as const;
      }),
  }),

  assistant: router({
    ask: protectedProcedure
      .input(
        z.object({
          familyGroupId: z.number(),
          message: z.string().min(1).max(2000),
          language: z.enum(["ja", "en", "zh", "ko"]).default("ja"),
        })
      )
      .mutation(async ({ input }) =>
        getFamilyAssistantResponse({
          familyGroupId: input.familyGroupId,
          message: input.message,
          language: input.language as AssistantLanguage,
        })
      ),

    confirmSchedule: protectedProcedure
      .input(
        z.object({
          familyGroupId: z.number(),
          action: z.object({
            type: z.enum(["create_schedule", "update_schedule", "delete_schedule"]),
            eventId: z.number().optional(),
            title: z.string().min(1).max(255),
            description: z.string().max(2000),
            startTime: z.string(),
            endTime: z.string(),
            location: z.string().max(255),
          }),
        })
      )
      .mutation(async ({ ctx, input }) =>
        confirmFamilySchedule({
          familyGroupId: input.familyGroupId,
          userId: ctx.user.id,
          action: input.action as ScheduleAction,
        })
      ),

    schedule: protectedProcedure
      .input(z.object({ familyGroupId: z.number() }))
      .query(({ input }) => getFamilyScheduleEvents(input.familyGroupId)),
  }),

  voice: router({
    transcribe: protectedProcedure
      .input(
        z.object({
          audioUrl: z.string().url(),
          language: z.enum(["ja", "en", "zh", "ko"]).optional(),
          prompt: z.string().max(500).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const result = await transcribeAudio(input);
        if ("error" in result) {
          throw new TRPCError({ code: "BAD_REQUEST", message: result.error, cause: result });
        }
        return result;
      }),

    transcribeBase64: protectedProcedure
      .input(
        z.object({
          audioData: z.string().min(32).max(24_000_000),
          mimeType: z.string().regex(/^audio\//),
          language: z.enum(["ja", "en", "zh", "ko"]).optional(),
          prompt: z.string().max(500).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const rawBase64 = input.audioData.replace(/^data:[^;]+;base64,/, "");
        const buffer = Buffer.from(rawBase64, "base64");
        if (buffer.length === 0 || buffer.length > 16 * 1024 * 1024) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "音声ファイルのサイズが不正です" });
        }
        const uploaded = await storagePut(
          `voice-assistant/${ctx.user.id}/${Date.now()}.webm`,
          buffer,
          input.mimeType
        );
        const signedUrl = await storageGetSignedUrl(uploaded.key);
        const result = await transcribeAudio({
          audioUrl: signedUrl,
          language: input.language,
          prompt: input.prompt,
        });
        if ("error" in result) {
          throw new TRPCError({ code: "BAD_REQUEST", message: result.error, cause: result });
        }
        return result;
      }),
  }),
  // Chat, Memory, and Routine routers are implemented but temporarily disabled
  // They will be fully integrated in the next phase
  // chat: router({ ... }),
  // memories: router({ ... }),
  // timeCapsules: router({ ... }),
  // routines: router({ ... }),
});

export type AppRouter = typeof appRouter;
