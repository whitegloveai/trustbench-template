"use server"

import { NEXT_PUBLIC_APP_URL_ENV } from "@/env"
import { db } from "@/server/db/config/database"
import { WorkspaceType } from "@/server/db/schema-types"
import { users } from "@/server/db/schemas"
import { getCurrentUser } from "@/server/queries/auth-queries"
import { eq } from "drizzle-orm"

import { PlanTypesType } from "@/types/types"
import { configuration } from "@/lib/config"
import { createRoute } from "@/lib/routes"
import { stripe } from "@/lib/stripe"
import { absoluteUrl } from "@/lib/utils"

type stripeRedirectProps = {
  type: PlanTypesType
  from?: "billing"
  slug: WorkspaceType["slug"]
  isYearly?: boolean
}

export async function stripeRedirect({ type, slug, isYearly = false }: stripeRedirectProps) {
  if (!NEXT_PUBLIC_APP_URL_ENV) {
    throw new Error("NEXT_PUBLIC_APP_URL is not defined")
  }

  const { user } = await getCurrentUser()
  if (!user) {
    throw new Error("User not found")
  }

  const [dbUser] = await db.select().from(users).where(eq(users.id, user.id)).limit(1)
  try {
    const plan = configuration.stripe.products.find((plan) => plan.type === type)

    if (!plan) {
      throw new Error("Plan not found")
    }

    const callbackUrl = absoluteUrl(
      `${createRoute("settings-billing", { slug }).href}?upgrade=true`
    )

    if (dbUser.stripeCustomerId) {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: dbUser.stripeCustomerId,
        return_url: callbackUrl,
      })
      return portalSession.url
    }

    const priceId = isYearly ? plan.price.priceIds.yearly : plan.price.priceIds.monthly

    if (!priceId) {
      throw new Error(`${isYearly ? "Yearly" : "Monthly"} price ID not configured`)
    }

    const stripeSession = await stripe.checkout.sessions.create({
      success_url: callbackUrl,
      cancel_url: callbackUrl,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer_email: dbUser?.email,
      line_items: [
        {
          quantity: 1,
          price: priceId,
        },
      ],
      metadata: {
        userId: dbUser.id,
        type: type,
        interval: isYearly ? "yearly" : "monthly",
      },
    })

    return stripeSession.url || ""
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    throw new Error("An unexpected error occurred")
  }
}
