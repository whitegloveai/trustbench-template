import { getUserSubscription } from "@/server/queries/subscriptions"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"

export const subscriptionsRouter = createTRPCRouter({
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    const { user } = ctx

    const subscription = await getUserSubscription({ user })

    return subscription
  }),
})
