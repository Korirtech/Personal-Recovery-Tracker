import { COOKIE_NAME } from "@shared/const";
import { checkinInputSchema } from "@shared/checkin";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  ensureRecoveryAccount,
  getCheckinForLocalDate,
  getCheckinsInRange,
  getCheckinHistory,
  deleteRecoveryAccount,
  getInsightByFingerprint,
  getLatestInsight,
  getRecoveryProfile,
  deleteCheckinById,
  updateRecoveryProfile,
  updateCheckinById,
  upsertInsight,
  upsertTodayCheckin,
} from "./db";
import { calculateRecoveryScore } from "./recovery/score";
import { buildDashboardProjection } from "./recovery/dashboard";
import { buildAnalyticsProjection } from "./recovery/analytics";
import {
  buildPatternSummary,
  fingerprintPatternSummary,
  generateValidatedInsight,
} from "./recovery/insights";
import { getRecoveryEntitlements } from "./recovery/entitlements";
import { getDataExportStatus } from "./recovery/exports";
import {
  getLocalDateKey,
  isValidTimeZone,
  localDateToDatabaseDate,
  shiftLocalDate,
} from "./recovery/timezone";

const timeZoneInput = z.string().trim().min(1).max(64).refine(isValidTimeZone, {
  message: "Choose a valid IANA timezone.",
});

const reminderTimeInput = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use a 24-hour time.");

const checkinInput = checkinInputSchema;

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
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
  recovery: router({
    profile: router({
      get: protectedProcedure.query(async ({ ctx }) => {
        await ensureRecoveryAccount(ctx.user.id, ctx.user.name);
        const profile = await getRecoveryProfile(ctx.user.id);

        return {
          email: ctx.user.email,
          accountName: ctx.user.name,
          profile,
        };
      }),
      update: protectedProcedure
        .input(
          z.object({
            displayName: z.string().trim().max(120).optional(),
            timezone: timeZoneInput,
            reminderEnabled: z.boolean(),
            localReminderTime: reminderTimeInput,
          })
        )
        .mutation(async ({ ctx, input }) => {
          await ensureRecoveryAccount(ctx.user.id, ctx.user.name);
          await updateRecoveryProfile(ctx.user.id, {
            displayName: input.displayName?.trim() || null,
            timezone: input.timezone,
            reminderEnabled: input.reminderEnabled,
            localReminderTime: input.localReminderTime,
          });
          return { success: true } as const;
        }),
    }),
    dashboard: router({
      get: protectedProcedure.query(async ({ ctx }) => {
        await ensureRecoveryAccount(ctx.user.id, ctx.user.name);
        const profile = await getRecoveryProfile(ctx.user.id);
        const timezone = profile?.timezone ?? "UTC";
        const localDate = getLocalDateKey(timezone);
        const todayDate = localDateToDatabaseDate(localDate);
        const startDate = localDateToDatabaseDate(
          shiftLocalDate(localDate, -6)
        );
        const [today, recentEntries] = await Promise.all([
          getCheckinForLocalDate(ctx.user.id, todayDate),
          getCheckinsInRange(ctx.user.id, startDate, todayDate),
        ]);

        return {
          localDate,
          timezone,
          ...buildDashboardProjection(today, recentEntries),
        };
      }),
    }),
    checkins: router({
      getToday: protectedProcedure.query(async ({ ctx }) => {
        await ensureRecoveryAccount(ctx.user.id, ctx.user.name);
        const profile = await getRecoveryProfile(ctx.user.id);
        const timezone = profile?.timezone ?? "UTC";
        const localDate = getLocalDateKey(timezone);
        const checkin = await getCheckinForLocalDate(
          ctx.user.id,
          localDateToDatabaseDate(localDate)
        );

        return { checkin, localDate, timezone };
      }),
      saveToday: protectedProcedure
        .input(checkinInput)
        .mutation(async ({ ctx, input }) => {
          await ensureRecoveryAccount(ctx.user.id, ctx.user.name);
          const profile = await getRecoveryProfile(ctx.user.id);
          const timezone = profile?.timezone ?? "UTC";
          const localDate = getLocalDateKey(timezone);
          const localDatabaseDate = localDateToDatabaseDate(localDate);
          const existing = await getCheckinForLocalDate(
            ctx.user.id,
            localDatabaseDate
          );
          const score = calculateRecoveryScore(input);

          await upsertTodayCheckin(ctx.user.id, localDatabaseDate, {
            ...input,
            recoveryScore: score.score,
          });

          const checkin = await getCheckinForLocalDate(
            ctx.user.id,
            localDatabaseDate
          );
          return {
            checkin,
            score,
            localDate,
            status: existing ? "updated" : "created",
          } as const;
        }),
    }),
    history: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        await ensureRecoveryAccount(ctx.user.id, ctx.user.name);
        return getCheckinHistory(ctx.user.id);
      }),
      update: protectedProcedure
        .input(
          z.object({ id: z.number().int().positive(), ...checkinInput.shape })
        )
        .mutation(async ({ ctx, input }) => {
          const score = calculateRecoveryScore(input);
          const updated = await updateCheckinById(ctx.user.id, input.id, {
            ...input,
            recoveryScore: score.score,
          });
          if (!updated) throw new Error("Check-in not found");
          return { success: true, score } as const;
        }),
      delete: protectedProcedure
        .input(z.object({ id: z.number().int().positive() }))
        .mutation(async ({ ctx, input }) => {
          const deleted = await deleteCheckinById(ctx.user.id, input.id);
          if (!deleted) throw new Error("Check-in not found");
          return { success: true } as const;
        }),
    }),
    analytics: router({
      get: protectedProcedure.query(async ({ ctx }) => {
        await ensureRecoveryAccount(ctx.user.id, ctx.user.name);
        const profile = await getRecoveryProfile(ctx.user.id);
        const timezone = profile?.timezone ?? "UTC";
        const localDate = getLocalDateKey(timezone);
        const entries = await getCheckinsInRange(
          ctx.user.id,
          localDateToDatabaseDate(shiftLocalDate(localDate, -59)),
          localDateToDatabaseDate(localDate)
        );
        return { localDate, ...buildAnalyticsProjection(entries, localDate) };
      }),
    }),
    insights: router({
      get: protectedProcedure.query(async ({ ctx }) => {
        await ensureRecoveryAccount(ctx.user.id, ctx.user.name);
        const [profile, entries, latestInsight] = await Promise.all([
          getRecoveryProfile(ctx.user.id),
          getCheckinHistory(ctx.user.id),
          getLatestInsight(ctx.user.id),
        ]);
        return {
          plan: profile?.plan ?? "free",
          checkinCount: entries.length,
          requiredCheckins: 7,
          insight: latestInsight,
        };
      }),
      generate: protectedProcedure.mutation(async ({ ctx }) => {
        await ensureRecoveryAccount(ctx.user.id, ctx.user.name);
        const [profile, entries] = await Promise.all([
          getRecoveryProfile(ctx.user.id),
          getCheckinHistory(ctx.user.id),
        ]);
        if ((profile?.plan ?? "free") !== "pro")
          throw new Error("A Pro subscription is required for AI insights");
        if (entries.length < 7)
          return {
            status: "insufficient_data",
            requiredCheckins: 7,
            checkinCount: entries.length,
          } as const;

        const summary = buildPatternSummary(entries);
        const fingerprint = fingerprintPatternSummary(summary);
        const cached = await getInsightByFingerprint(ctx.user.id, fingerprint);
        if (cached) return { status: "cached", insight: cached } as const;

        const insight = await generateValidatedInsight(summary);
        const stored = await upsertInsight(ctx.user.id, {
          periodStart: entries.at(-1)!.localDate,
          periodEnd: entries[0].localDate,
          dataFingerprint: fingerprint,
          ...insight,
        });
        return { status: "generated", insight: stored } as const;
      }),
    }),
    subscription: router({
      get: protectedProcedure.query(async ({ ctx }) => {
        await ensureRecoveryAccount(ctx.user.id, ctx.user.name);
        const profile = await getRecoveryProfile(ctx.user.id);
        return getRecoveryEntitlements(profile?.plan ?? "free");
      }),
    }),
    privacy: router({
      deleteRecoveryData: protectedProcedure.mutation(async ({ ctx }) => {
        const deleted = await deleteRecoveryAccount(ctx.user.id);
        if (!deleted)
          throw new Error("RecoveryLog account data could not be deleted");
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
        return { success: true } as const;
      }),
    }),
    exports: router({
      status: protectedProcedure.query(async ({ ctx }) => {
        await ensureRecoveryAccount(ctx.user.id, ctx.user.name);
        const profile = await getRecoveryProfile(ctx.user.id);
        return getDataExportStatus(profile?.plan ?? "free");
      }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
