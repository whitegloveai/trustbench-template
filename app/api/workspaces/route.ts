/* eslint-disable no-console */
import { NextRequest, NextResponse } from "next/server"
import { db, dbClient } from "@/server/db/config/database"
import {
  roles,
  subscriptions,
  users,
  userSettings,
  workspaceMembers,
  workspaces,
} from "@/server/db/schemas"
import { getCurrentUser } from "@/server/queries/auth-queries"
import { getUserSubscription } from "@/server/queries/subscriptions"
import { Ratelimit } from "@upstash/ratelimit"
import { eq } from "drizzle-orm"
import { z } from "zod"

import { RATE_LIMIT_1_MINUTE, RATE_LIMIT_10 } from "@/lib/constants"
import { redis } from "@/lib/redis"
import { workspaceSchema } from "@/lib/schemas"
import { capitalizeFirstLetter, slugify } from "@/lib/utils"

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(RATE_LIMIT_10, RATE_LIMIT_1_MINUTE),
})

export async function GET(req: NextRequest) {
  try {
    console.log("Incoming GET request /api/workspaces")

    const identifier = "ratelimit:get-workspaces"
    const { success } = await ratelimit.limit(identifier)

    if (!success) {
      return NextResponse.json(
        {
          error: "Rate Limit Exceeded",
        },
        {
          status: 429,
        }
      )
    }

    const dbWorkspaces = await db.select().from(workspaces)

    return NextResponse.json(
      {
        data: dbWorkspaces,
      },
      {
        status: 200,
      }
    )
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error.message,
      },
      {
        status: 500,
      }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("Incoming POST request /api/workspaces")

    const body = await req.json()

    // 1. Validate request body
    const validateValues = workspaceSchema
      .pick({ name: true, logo: true, slug: true })
      .parse(body.values)

    const validateInitial = z.boolean().parse(body.isInitial)
    const isInitial = validateInitial

    const { name, logo, slug } = validateValues
    const slugName = slugify(slug)

    // 2. Get auth
    const { user } = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        { status: 401 }
      )
    }

    const userId = user.id

    const [dbUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1)

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // 3. Ratelimit
    const identifier = `ratelimit:create-workspace:${user.id}`
    const { success: rateLimitSuccess } = await ratelimit.limit(identifier)

    if (!rateLimitSuccess) {
      return NextResponse.json(
        {
          error: "Rate Limit Exceeded",
        },
        { status: 429 }
      )
    }

    // 4. Get required data
    const [workspaceWithSlug, userOwnedWorkspaces, stripeSubscription, subscription, ownerRole] =
      await Promise.all([
        // Check if slug exists
        db.select().from(workspaces).where(eq(workspaces.slug, slugName)).limit(1),
        // Get user's workspaces
        db.select().from(workspaces).where(eq(workspaces.ownerId, userId)),
        // Get subscription data
        getUserSubscription({ user: dbUser }),
        // Get user's subscription
        db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1),
        // Get owner role
        db.select().from(roles).where(eq(roles.name, "owner")).limit(1),
      ])

    if (workspaceWithSlug.length) {
      return NextResponse.json(
        {
          error: "Workspace with slug already exists",
        },
        { status: 400 }
      )
    }

    if (!subscription.length) {
      return NextResponse.json(
        {
          error: "Subscription not found",
        },
        { status: 404 }
      )
    }

    if (!ownerRole.length) {
      return NextResponse.json(
        {
          error: "Owner role not found",
        },
        { status: 404 }
      )
    }

    const { workspacesQuota, type, isSubscribed } = stripeSubscription

    // 6. Check subscription limits
    if (userOwnedWorkspaces.length >= workspacesQuota! && !isSubscribed) {
      return NextResponse.json(
        {
          error: `Exceeded ${capitalizeFirstLetter(type!)} plan Workspace quota`,
          details: "Please upgrade your plan to create more workspaces",
        },
        { status: 400 }
      )
    }

    const newWorkspace = await dbClient.transaction(async (tx) => {
      // Create workspace
      const [newWorkspace] = await tx
        .insert(workspaces)
        .values({
          ownerId: user.id,
          slug: slugName,
          logo: logo ? (logo as string) : null,
          name,
          subscriptionId: subscription[0].id,
        })
        .returning({
          id: workspaces.id,
          slug: workspaces.slug,
          name: workspaces.name,
          logo: workspaces.logo,
          createdAt: workspaces.createdAt,
        })

      // Create workspace member with owner role
      await tx.insert(workspaceMembers).values({
        roleId: ownerRole[0].id,
        userId: user.id,
        workspaceId: newWorkspace.id,
      })

      if (isInitial) {
        await tx
          .update(userSettings)
          .set({
            onboardingStep: "collaborate",
            updatedAt: new Date(),
          })
          .where(eq(userSettings.userId, user.id))
      }

      return newWorkspace
    })

    return NextResponse.json(
      {
        slug: newWorkspace.slug,
        message: "Workspace created successfully",
        workspace: newWorkspace,
      },
      {
        status: 200,
      }
    )
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation Error",
          details: error.errors,
        },
        {
          status: 400,
        }
      )
    }

    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error.message,
      },
      {
        status: 500,
      }
    )
  }
}
