import { db } from "@/server/db/config/database"
import { UserType } from "@/server/db/schema-types"
import { subscriptions, users, workspaces } from "@/server/db/schemas"
import { eq } from "drizzle-orm"

import { configuration } from "@/lib/config"
import { stripe } from "@/lib/stripe"

export async function getUserSubscription({
  user,
}: {
  user: Pick<UserType, "id" | "name" | "lastName" | "email" | "image">
}) {
  const userId = user.id

  const [userSubscription] = await db
    .select({
      stripePriceId: users.stripePriceId,
      stripeCurrentPeriodEnd: users.stripeCurrentPeriodEnd,
      stripeSubscriptionId: users.stripeSubscriptionId,
      stripeCustomerId: users.stripeCustomerId,
      billingCycle: subscriptions.billingCycle,
    })
    .from(users)
    .leftJoin(subscriptions, eq(users.id, subscriptions.userId))
    .where(eq(users.id, userId))
    .limit(1)

  if (!userSubscription) {
    return {
      ...configuration.stripe.products[0],
      isSubscribed: false,
      isCanceled: false,
      stripeCurrentPeriodEnd: null,
      session: true,
      userId: user.id,
      billingCycle: null,
      plan: configuration.stripe.products[0],
      user: user,
    }
  }

  const isSubscribed = Boolean(
    userSubscription.stripePriceId &&
      userSubscription.stripeCurrentPeriodEnd &&
      userSubscription.stripeCurrentPeriodEnd.getTime() + 86_400_400 > Date.now()
  )

  // Default to FREE plan (index 0)
  const freePlan = configuration.stripe.products[0]

  // Find the user's plan if subscribed, with fallback to free plan
  const plan = isSubscribed
    ? configuration.stripe.products.find(
        (plan) =>
          plan.price.priceIds.monthly === userSubscription.stripePriceId ||
          plan.price.priceIds.yearly === userSubscription.stripePriceId
      ) || freePlan
    : freePlan

  let isCanceled = false
  if (isSubscribed && userSubscription.stripeSubscriptionId) {
    const stripePlan = await stripe.subscriptions.retrieve(userSubscription.stripeSubscriptionId)
    isCanceled = stripePlan.cancel_at_period_end
  }

  return {
    ...plan, // Now plan is guaranteed to have a value
    stripeSubscriptionId: userSubscription.stripeSubscriptionId,
    stripeCurrentPeriodEnd: userSubscription.stripeCurrentPeriodEnd,
    stripeCustomerId: userSubscription.stripeCustomerId,
    isSubscribed,
    isCanceled,
    userId: user.id,
    billingCycle: userSubscription.billingCycle,
    plan: plan,
    user: user,
  }
}

export const getWorkspaceSubscriptionBySlug = async (slug: string) => {
  const workspace = await db.query.workspaces.findFirst({
    where: eq(workspaces.slug, slug),
    with: {
      subscription: true,
      creator: {
        columns: {
          stripePriceId: true,
          stripeCurrentPeriodEnd: true,
          stripeSubscriptionId: true,
        },
      },
    },
  })

  if (!workspace) return { planType: "FREE", plan: configuration.stripe.products[0] }

  if (!workspace.subscription) return { planType: "FREE", plan: configuration.stripe.products[0] }

  const { planType, billingCycle, stripeSubscriptionId } = workspace.subscription
  const user = workspace.creator

  // Check if the subscription is active
  const isSubscribed = Boolean(
    user?.stripePriceId &&
      user?.stripeCurrentPeriodEnd &&
      user.stripeCurrentPeriodEnd.getTime() + 86_400_400 > Date.now()
  )

  if (!isSubscribed) {
    return { planType: "FREE", plan: configuration.stripe.products[0] }
  }

  let isCanceled = false
  if (isSubscribed && stripeSubscriptionId) {
    const stripePlan = await stripe.subscriptions.retrieve(stripeSubscriptionId)
    isCanceled = stripePlan.cancel_at_period_end
  }

  const plan = configuration.stripe.products.find((plan) => plan.type === planType)

  return {
    planType,
    plan,
    isSubscribed,
    isCanceled,
    billingCycle,
    stripeCurrentPeriodEnd: user?.stripeCurrentPeriodEnd,
  }
}
