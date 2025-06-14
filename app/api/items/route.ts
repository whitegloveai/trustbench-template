/* eslint-disable no-console */
import { NextRequest, NextResponse } from "next/server"
import { db } from "@/server/db/config/database"
import { items, notifications, workspaces } from "@/server/db/schemas"
import { getCurrentUser } from "@/server/queries/auth-queries"
import { hasPermission, PERMISSIONS } from "@/server/queries/permissions"
import { Ratelimit } from "@upstash/ratelimit"
import { desc, eq } from "drizzle-orm"
import { z } from "zod"

import { RATE_LIMIT_1_MINUTE, RATE_LIMIT_10 } from "@/lib/constants"
import { redis } from "@/lib/redis"
import { createItemSchema, workspaceSchema } from "@/lib/schemas"

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(RATE_LIMIT_10, RATE_LIMIT_1_MINUTE),
})

export async function GET(req: NextRequest) {
  try {
    console.log("Incoming GET request /api/items")

    const searchParams = req.nextUrl.searchParams
    const slug = searchParams.get("slug")
    const madeByMe = searchParams.get("madeByMe")

    const identifier = "ratelimit:get-items"
    const { success } = await ratelimit.limit(identifier)

    if (!success) {
      console.log("Rate limit exceeded")
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
        },
        {
          status: 429,
        }
      )
    }

    if (slug) {
      const validatedSlug = workspaceSchema.pick({ slug: true }).parse({ slug: slug })

      const [workspace] = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.slug, validatedSlug.slug))
        .limit(1)

      if (!workspace) {
        return NextResponse.json(
          {
            error: "Workspace not found",
          },
          {
            status: 404,
          }
        )
      }

      const dbItems = await db.query.items.findMany({
        where: eq(items.workspaceId, workspace.id),
        with: {
          creator: {
            columns: {
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: desc(items.createdAt),
      })

      return NextResponse.json(
        {
          data: dbItems,
        },
        {
          status: 200,
        }
      )
    }

    if (madeByMe) {
      const { user } = await getCurrentUser()

      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const dbItems = await db.query.items.findMany({
        where: eq(items.userId, user.id),
        with: {
          creator: {
            columns: {
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: desc(items.createdAt),
      })

      return NextResponse.json(
        {
          data: dbItems,
        },
        {
          status: 200,
        }
      )
    }

    const dbItems = await db
      .select({
        id: items.id,
        name: items.name,
        description: items.description,
        status: items.status,
        tags: items.tags,
        dueDate: items.dueDate,
        createdAt: items.createdAt,
        updatedAt: items.updatedAt,
      })
      .from(items)
      .orderBy(desc(items.createdAt))
      .limit(25)

    return NextResponse.json(
      {
        data: dbItems,
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

export async function POST(req: NextRequest) {
  try {
    console.log("Incoming POST request")

    const body = await req.json()

    // Transform the date string to Date object
    if (body.values.dueDate) {
      body.values.dueDate = new Date(body.values.dueDate)
    }

    console.log("Request body received:", body)

    const validatedBody = createItemSchema.parse(body.values)
    const validateSlug = workspaceSchema.pick({ slug: true }).parse({ slug: body.slug })

    const { slug } = validateSlug
    const { name, description, dueDate, status, tags } = validatedBody

    const { user } = await getCurrentUser()

    if (!user) {
      console.log("User not found")
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      )
    }

    const identifier = `ratelimit:create-item:${user.id}`
    const { success } = await ratelimit.limit(identifier)

    if (!success) {
      console.log("Rate limit exceeded")
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
        },
        {
          status: 429,
        }
      )
    }

    const [workspace] = await db.select().from(workspaces).where(eq(workspaces.slug, slug)).limit(1)

    if (!workspace) {
      console.log("Workspace not found")
      return NextResponse.json(
        {
          error: "Workspace not found",
        },
        {
          status: 404,
        }
      )
    }

    const [newItem] = await db
      .insert(items)
      .values({
        name,
        description,
        userId: user.id,
        workspaceId: workspace.id,
        dueDate,
        tags,
        status,
      })
      .returning({
        id: items.id,
      })

    if (newItem) {
      await db.insert(notifications).values({
        title: "Item has been created",
        message: `${name} has been created`,
        userId: user.id,
        link: `/${slug}/items/${newItem.id}`,
        expiresAt: null,
        type: "info",
        identifier: newItem.id,
        accepted: false,
      })
    }

    return NextResponse.json(
      {
        message: "Item created successfully",
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

export async function DELETE(req: NextRequest) {
  try {
    console.log("Incoming DELETE request /api/items")

    const body = await req.json()

    const validateBody = workspaceSchema.pick({ slug: true }).parse({ slug: body.slug })

    const { slug } = validateBody

    const { user } = await getCurrentUser()

    if (!user) {
      console.log("User not found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const identifier = `ratelimit:delete-items:${user.id}`
    const { success } = await ratelimit.limit(identifier)

    if (!success) {
      console.log("Rate limit exceeded")
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    const [workspace] = await db.select().from(workspaces).where(eq(workspaces.slug, slug)).limit(1)

    if (!workspace) {
      console.log("Workspace not found")
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 })
    }

    const canDelete = await hasPermission({
      userId: user.id,
      workspaceId: workspace.id,
      permissionName: PERMISSIONS.DELETE_WORKSPACE,
    })

    if (!canDelete) {
      console.log("User does not have permission to delete items")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await db.delete(items).where(eq(items.workspaceId, workspace.id))

    return NextResponse.json(
      {
        message: "All items work workspace deleted successfully",
      },
      {
        status: 200,
      }
    )
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        {
          status: 400,
        }
      )
    }

    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    )
  }
}
