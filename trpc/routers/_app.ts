import { createTRPCRouter } from "@/trpc/init"
import { feedbacksRouter } from "@/trpc/routers/feedbacks"
import { invitationsRouter } from "@/trpc/routers/invitations"
import { itemsRouter } from "@/trpc/routers/items"
import { membersRouter } from "@/trpc/routers/members"
import { notificationsRouter } from "@/trpc/routers/notifications"
import { subscriptionsRouter } from "@/trpc/routers/subscriptions"
import { usersRouter } from "@/trpc/routers/users"
import { usersSettingsRouter } from "@/trpc/routers/users-settings"
import { workspacesRouter } from "@/trpc/routers/workspaces"

export const appRouter = createTRPCRouter({
  users: usersRouter,
  items: itemsRouter,
  notifications: notificationsRouter,
  workspaces: workspacesRouter,
  members: membersRouter,
  invitations: invitationsRouter,
  usersSettings: usersSettingsRouter,
  subscriptions: subscriptionsRouter,
  feedbacks: feedbacksRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
