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
import {
  generatePhotoJournalStory,
  generateFamilyProposal,
  summarizeFamilyDay,
} from "./ai";

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
});

export type AppRouter = typeof appRouter;
