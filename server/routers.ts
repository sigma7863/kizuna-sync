import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
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
} from "./db";
import { generatePhotoJournalStory, generateFamilyProposal, summarizeFamilyDay } from "./ai";
import { getFamilyStats } from "./statistics";
import { sendChatMessage, getChatHistory } from "./family-chat";
import { createMemoryArchive, getMemoriesByDateRange, createTimeCapsule, getTimeCapsules } from "./memory-archive";
import { createRoutine, getFamilyRoutines, completeRoutine, getRoutineStats } from "./family-routine";

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
        return await saveLocationHistory(
          ctx.user.id,
          input.familyGroupId,
          input.latitude,
          input.longitude,
          input.accuracy,
          input.locationName
        );
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
  chat: router({
    send: protectedProcedure
      .input(z.object({ familyGroupId: z.number(), content: z.string(), messageType: z.enum(['text', 'image', 'audio', 'emoji']).default('text') }))
      .mutation(async ({ ctx, input }) => {
        return await sendChatMessage(input.familyGroupId, ctx.user.id, ctx.user.name || 'Unknown', input.content, input.messageType);
      }),
    getHistory: protectedProcedure
      .input(z.object({ familyGroupId: z.number(), limit: z.number().default(50) }))
      .query(async ({ input }) => {
        return await getChatHistory(input.familyGroupId, input.limit);
      }),
  }),
  memories: router({
    create: protectedProcedure
      .input(z.object({ familyGroupId: z.number(), title: z.string(), description: z.string(), photoUrls: z.array(z.string()), tags: z.array(z.string()), sentiment: z.enum(['happy', 'sad', 'nostalgic', 'funny', 'meaningful']) }))
      .mutation(async ({ input }) => {
        return await createMemoryArchive(input.familyGroupId, input.title, input.description, input.photoUrls, input.tags, input.sentiment);
      }),
    getByDateRange: protectedProcedure
      .input(z.object({ familyGroupId: z.number(), startDate: z.date(), endDate: z.date() }))
      .query(async ({ input }) => {
        return await getMemoriesByDateRange(input.familyGroupId, input.startDate, input.endDate);
      }),
  }),
  timeCapsules: router({
    create: protectedProcedure
      .input(z.object({ familyGroupId: z.number(), title: z.string(), content: z.string(), photoUrls: z.array(z.string()), unlockDate: z.date(), contributors: z.array(z.string()) }))
      .mutation(async ({ input }) => {
        return await createTimeCapsule(input.familyGroupId, input.title, input.content, input.photoUrls, input.unlockDate, input.contributors);
      }),
    getAll: protectedProcedure
      .input(z.object({ familyGroupId: z.number() }))
      .query(async ({ input }) => {
        return await getTimeCapsules(input.familyGroupId);
      }),
  }),
  routines: router({
    create: protectedProcedure
      .input(z.object({ familyGroupId: z.number(), title: z.string(), description: z.string(), category: z.enum(['morning', 'evening', 'meal', 'exercise', 'study', 'other']), scheduledTime: z.string(), frequency: z.enum(['daily', 'weekly', 'monthly']), pointsReward: z.number(), icon: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return await createRoutine(input.familyGroupId, ctx.user.id, ctx.user.name || 'Unknown', input.title, input.description, input.category, input.scheduledTime, input.frequency, input.pointsReward, input.icon);
      }),
    getFamilyRoutines: protectedProcedure
      .input(z.object({ familyGroupId: z.number() }))
      .query(async ({ input }) => {
        return await getFamilyRoutines(input.familyGroupId);
      }),
    complete: protectedProcedure
      .input(z.object({ routineId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await completeRoutine(input.routineId, ctx.user.id);
      }),
    getStats: protectedProcedure
      .input(z.object({ familyGroupId: z.number() }))
      .query(async ({ input }) => {
        return await getRoutineStats(input.familyGroupId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
