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
  logUserActivity,
  saveLocationHistory,
  createGeofence,
  getFamilyGeofences,
  getFamilyLatestLocations,
  acknowledgeGeofenceAlert,
  getPhotoJournalSchedule,
  upsertPhotoJournalSchedule,
  setPhotoJournalScheduleTaskUid,
  getRecentPhotoJournals,
} from "./db";
import { generatePhotoJournalStory, generateFamilyProposal, summarizeFamilyDay } from "./ai";
import { getFamilyStats } from "./statistics";
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
