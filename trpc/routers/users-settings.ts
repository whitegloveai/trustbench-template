import { db } from "@/server/db/config/database"
import { userNotificationSettings, users, userSettings } from "@/server/db/schemas"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import { TRPCError } from "@trpc/server"
import { and, eq } from "drizzle-orm"
import { z } from "zod"

import { userNotificationSettingsSchema } from "@/lib/schemas"

// Create a TypeScript enum representation of the Postgres enum
const OnboardingStatus = {
  NOT_STARTED: "not_started",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
} as const

export const usersSettingsRouter = createTRPCRouter({
  getOne: protectedProcedure.query(async ({ ctx }) => {
    const { user } = ctx

    const [settings] = await db
      .select({
        id: userNotificationSettings.id,
        updateEmails: userNotificationSettings.updateEmails,
        subscriptionEmails: userNotificationSettings.subscriptionEmails,
      })
      .from(userNotificationSettings)
      .where(eq(userNotificationSettings.userId, user.id))
      .limit(1)

    return {
      settings,
      userId: user.id,
    }
  }),

  update: protectedProcedure
    .input(userNotificationSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx

      const userId = user.id

      const { updateEmails, subscriptionEmails, userSettingsId } = input

      const [dbUser] = await db.select().from(users).where(eq(users.id, user.id)).limit(1)

      if (!dbUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        })
      }

      if (dbUser.id !== user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to update this user's notification settings",
        })
      }

      let message: string = "No changes made"

      await db
        .update(userNotificationSettings)
        .set({
          updateEmails,
          subscriptionEmails,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(userNotificationSettings.userId, userId),
            eq(userNotificationSettings.id, userSettingsId)
          )
        )
      message = message === "No changes made" ? "Updated notification settings" : "Updated settings"

      return {
        message,
      }
    }),

  updateOnboarding: protectedProcedure
    .input(
      z.object({
        onboardingStep: z.enum([
          OnboardingStatus.NOT_STARTED,
          OnboardingStatus.IN_PROGRESS,
          OnboardingStatus.COMPLETED,
        ]),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx

      const { onboardingStep, userId } = input

      if (user.id !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not allowed to update this user's onboarding status",
        })
      }

      const [dbUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1)

      if (!dbUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        })
      }

      await db
        .update(userSettings)
        .set({
          onboardingStatus: onboardingStep,
          onboardingCompletedAt: onboardingStep === "completed" ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(eq(userSettings.userId, userId))

      return {
        message: `Onboarding ${onboardingStep}`,
        description: `You are being redirected to the ${onboardingStep === "completed" ? "Dashboard" : "Onboarding"}  page`,
      }
    }),
})
