import { db } from "@/server/db/config/database"
import { notifications } from "@/server/db/schemas"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import { TRPCError } from "@trpc/server"
import { and, desc, eq } from "drizzle-orm"
import { z } from "zod"

export const notificationsRouter = createTRPCRouter({
  getMany: protectedProcedure.query(async ({ ctx }) => {
    const { user } = ctx

    const userId = user.id

    const [notArchivedNotifications, archivedNotifications] = await Promise.all([
      // Query for non-archived notifications
      db
        .select()
        .from(notifications)
        .where(and(eq(notifications.userId, userId), eq(notifications.archived, false)))
        .orderBy(desc(notifications.createdAt)),

      // Query for archived notifications
      db
        .select()
        .from(notifications)
        .where(and(eq(notifications.userId, userId), eq(notifications.archived, true)))
        .orderBy(desc(notifications.createdAt)),
    ])
    return {
      notifications: notArchivedNotifications,
      archivedNotifications: archivedNotifications,
    }
  }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid({ message: "Invalid notification ID" }),
        status: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx
      const { id, status } = input

      const [notification] = await db
        .select()
        .from(notifications)
        .where(eq(notifications.id, id))
        .limit(1)

      if (!notification) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Notification not found",
        })
      }

      if (notification.userId !== user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to update this notification",
        })
      }

      await db
        .update(notifications)
        .set({ read: status, accepted: status, updatedAt: new Date() })
        .where(eq(notifications.id, id))

      return {
        message: "Notification updated",
      }
    }),

  updateArchiveOne: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid({ message: "Invalid notification ID" }),
        value: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx
      const { id, value } = input

      const [notification] = await db
        .select()
        .from(notifications)
        .where(eq(notifications.id, id))
        .limit(1)

      if (!notification) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Notification not found",
        })
      }

      if (notification.userId !== user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to delete this notification",
        })
      }
      await db
        .update(notifications)
        .set({ read: false, archived: value, updatedAt: new Date() })
        .where(eq(notifications.id, id))

      const message = value ? "Notification archived" : "Notification un-archived"
      return {
        message,
      }
    }),
  updateArchiveMany: protectedProcedure.mutation(async ({ ctx }) => {
    const { user } = ctx

    await db
      .update(notifications)
      .set({ archived: true, updatedAt: new Date() })
      .where(eq(notifications.userId, user.id))

    return {
      message: "All notifications archived",
    }
  }),
})
