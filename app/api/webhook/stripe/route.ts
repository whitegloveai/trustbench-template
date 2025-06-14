/* eslint-disable no-console */
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { db, dbClient } from "@/server/db/config/database"
import { subscriptions, users, workspaceMembers, workspaces } from "@/server/db/schemas"
import { and, eq, notLike } from "drizzle-orm"
import Stripe from "stripe"

import { PlanTypesType } from "@/types/types"
import { configuration } from "@/lib/config"
import { resend } from "@/lib/resend"
import { stripe } from "@/lib/stripe"
import { capitalizeFirstLetter, getBillingCycle } from "@/lib/utils"
import { ReceiptMail } from "@/components/mail/receipt-mail"

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get("Stripe-Signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (error: any) {
    return new NextResponse("Webhook error", { status: 400 })
  }

  const session = event.data.object as Stripe.Checkout.Session

  if (event.type === "checkout.session.completed") {
    console.log("Processing checkout.session.completed")
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
    console.log("Retrieved subscription from Stripe:", subscription.id)
    const priceId = subscription.items.data[0].price.id
    const amount = subscription.items.data[0].price.unit_amount

    if (!session?.metadata?.userId || !session?.metadata?.type) {
      console.error("Missing metadata:", session.metadata)
      return new NextResponse("User ID is required", { status: 400 })
    }

    try {
      await createOrUpdateSubscription(session, subscription, priceId, amount)
    } catch (error) {
      console.error("Error creating subscription:", error)
      return new NextResponse("Error creating subscription", { status: 500 })
    }
  }

  if (event.type === "invoice.payment_succeeded") {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
    const priceId = subscription.items.data[0].price.id

    await db
      .update(users)
      .set({
        stripePriceId: priceId,
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
        updatedAt: new Date(),
      })
      .where(eq(users.stripeCustomerId, subscription.customer as string)) // Fix: Use customer instead of subscription.id
  }

  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.resumed"
  ) {
    const subscription = event.data.object as Stripe.Subscription
    const priceId = subscription.items.data[0].price.id

    // Determine billing cycle
    const matchingPlan = configuration.stripe.products.find(
      (plan) => plan.price.priceIds.monthly === priceId || plan.price.priceIds.yearly === priceId
    )
    const billingCycle = priceId === matchingPlan?.price.priceIds.yearly ? "yearly" : "monthly"

    const planType = configuration.stripe.products.find(
      (plan) => plan.price.priceIds.monthly === priceId || plan.price.priceIds.yearly === priceId
    )?.type

    if (!planType) {
      return new NextResponse("Plan not found", { status: 400 })
    }

    const plan = configuration.stripe.products.find((plan) => plan.type === planType)

    if (!plan) {
      return new NextResponse("Plan not found", { status: 400 })
    }

    await dbClient.transaction(async (trx) => {
      // First, update the subscription
      await trx
        .update(subscriptions)
        .set({
          status: "active",
          planType: planType,
          billingCycle: billingCycle,
          maxWorkspaces: plan.workspacesQuota,
          maxMembers: plan.membersQuota,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.stripeSubscriptionId, subscription.id))

      // Then get the updated subscription
      const [dbSubscription] = await trx
        .select({
          id: subscriptions.id,
        })
        .from(subscriptions)
        .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
        .limit(1)

      if (!dbSubscription) {
        console.error("No subscription found for stripeSubscriptionId:", subscription.id)
        return new NextResponse("Subscription not found", { status: 400 })
      }

      // Now we can safely use dbSubscription.id
      const dbWorkspaces = await trx
        .select()
        .from(workspaces)
        .where(eq(workspaces.subscriptionId, dbSubscription.id))

      for (const workspace of dbWorkspaces) {
        await trx
          .update(workspaceMembers)
          .set({
            status: "active",
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(workspaceMembers.workspaceId, workspace.id),
              notLike(workspaceMembers.userId, workspace.ownerId)
            )
          )
      }
    })
  }

  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription

    if (subscription.cancel_at_period_end) {
      await dbClient.transaction(async (trx) => {
        const [dbSubscription] = await trx
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
          .limit(1)

        // Update the user's stripeCurrentPeriodEnd
        await trx
          .update(users)
          .set({
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            updatedAt: new Date(),
          })
          .where(eq(users.stripeCustomerId, subscription.customer as string))

        // Only update the subscription status to cancelled
        await trx
          .update(subscriptions)
          .set({
            status: "cancelled",
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.stripeSubscriptionId, dbSubscription.id))
      })
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription

    await dbClient.transaction(async (trx) => {
      const [dbSubscription] = await trx
        .select({
          id: subscriptions.id,
        })
        .from(subscriptions)
        .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
        .limit(1)

      if (!dbSubscription) {
        return new NextResponse("Subscription not found", { status: 400 })
      }

      await trx
        .update(subscriptions)
        .set({
          status: "cancelled",
          planType: "FREE",
          maxWorkspaces: configuration.stripe.products[0].workspacesQuota,
          maxMembers: configuration.stripe.products[0].membersQuota,
          stripeSubscriptionId: null,
          currentPeriodEnd: null,
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.stripeSubscriptionId, subscription.id))

      const dbWorkspaces = await trx
        .select()
        .from(workspaces)
        .where(eq(workspaces.subscriptionId, dbSubscription.id))

      // Set members to inactive only when the subscription is actually deleted
      for (const workspace of dbWorkspaces) {
        await trx
          .update(workspaceMembers)
          .set({
            status: "inactive",
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(workspaceMembers.workspaceId, workspace.id),
              notLike(workspaceMembers.userId, workspace.ownerId)
            )
          )
      }
    })
  }

  return new NextResponse(null, { status: 200 })
}

async function createOrUpdateSubscription(
  session: Stripe.Checkout.Session,
  subscription: Stripe.Subscription,
  priceId: string,
  amount: number | null
) {
  console.log("Starting createOrUpdateSubscription...")
  const billingCycle = getBillingCycle(priceId)
  const planType = session.metadata?.type as PlanTypesType
  const plan = configuration.stripe.products.find((plan) => plan.type === planType)

  // Retrieve payment details
  let last4 = ""
  let brand = ""
  let paymentType = ""

  try {
    if (session.mode === "subscription") {
      // For subscriptions, get the default payment method from the subscription
      const paymentMethod = await stripe.paymentMethods.retrieve(
        subscription.default_payment_method as string
      )

      last4 = paymentMethod.card?.last4 || ""
      brand = paymentMethod.card?.brand || ""
      paymentType = paymentMethod.type
    } else if (session.payment_intent) {
      // For one-time payments
      const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent as string)
      const paymentMethod = await stripe.paymentMethods.retrieve(
        paymentIntent.payment_method as string
      )

      last4 = paymentMethod.card?.last4 || ""
      brand = paymentMethod.card?.brand || ""
      paymentType = paymentMethod.type
    }

    if (!plan) {
      throw new Error("Plan not found")
    }

    try {
      await dbClient.transaction(async (trx) => {
        // Update user
        console.log("Updating user...")
        await trx
          .update(users)
          .set({
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer as string,
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            updatedAt: new Date(),
          })
          .where(eq(users.id, session.metadata!.userId))

        // Check if subscription exists
        console.log("Checking existing subscription...")
        const [existingSubscription] = await trx
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.userId, session.metadata!.userId))
          .limit(1)

        let subscriptionId

        if (existingSubscription) {
          // Update existing subscription
          console.log("Updating existing subscription...")
          const [updated] = await trx
            .update(subscriptions)
            .set({
              maxWorkspaces: plan.workspacesQuota,
              maxMembers: plan.membersQuota,
              planType: planType,
              status: "active",
              billingCycle: billingCycle,
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              stripeSubscriptionId: subscription.id,
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.userId, session.metadata!.userId))
            .returning({ id: subscriptions.id })

          subscriptionId = updated.id
        } else {
          // Create new subscription
          console.log("Creating new subscription...")
          const [newSubscription] = await trx
            .insert(subscriptions)
            .values({
              userId: session.metadata!.userId,
              maxWorkspaces: plan.workspacesQuota,
              maxMembers: plan.membersQuota,
              planType: planType,
              status: "active",
              billingCycle: billingCycle,
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              stripeSubscriptionId: subscription.id,
            })
            .returning({ id: subscriptions.id })

          subscriptionId = newSubscription.id
        }

        // Update workspaces
        console.log("Updating workspaces...")
        await trx
          .update(workspaces)
          .set({
            subscriptionId: subscriptionId,
            updatedAt: new Date(),
          })
          .where(eq(workspaces.ownerId, session.metadata!.userId))

        // Send receipt email
        console.log("Sending receipt email...")

        await resend.emails.send({
          from: configuration.resend.email,
          to: session.customer_email as string,
          subject: `Boring Template Receipt | ${configuration.site.name}`,
          react: ReceiptMail({
            email: session.customer_email as string,
            purchaseId: subscription.id,
            amount: (amount ?? 0) / 100,
            productName: `Boring Template: ${capitalizeFirstLetter(planType)} Plan`,
            purchaseDate: new Date(),
            desc: plan.description,
            last4,
            brand,
            paymentType,
          }),
        })
      })

      console.log("Transaction completed successfully")
    } catch (error) {
      console.error("Error in createOrUpdateSubscription:", error)
      throw error
    }
  } catch (error) {
    console.error("Error in createOrUpdateSubscription:", error)
    throw error
  }
}
