/* eslint-disable no-console */

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/server/db/config/database"
import { items } from "@/server/db/schemas"
import { getCurrentUser } from "@/server/queries/auth-queries"
import { Ratelimit } from "@upstash/ratelimit"
import { eq } from "drizzle-orm"
import { z } from "zod"

import { RATE_LIMIT_1_MINUTE, RATE_LIMIT_10 } from "@/lib/constants"
import { redis } from "@/lib/redis"
import { itemSchema } from "@/lib/schemas"

type routeParams = {
  params: Promise<{ itemId: string }>
}

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(RATE_LIMIT_10, RATE_LIMIT_1_MINUTE),
})

export async function DELETE(req: NextRequest, { params }: routeParams) {
  try {
    const { itemId } = await params
    console.log(`Incoming DELETE request /api/items/${itemId}`)

    const validateItemId = itemSchema.pick({ id: true }).parse({ id: itemId })

    const { id } = validateItemId

    if (!id) {
      console.log("Invalid item id")
      return NextResponse.json({ error: "Invalid item id" }, { status: 400 })
    }

    const { user } = await getCurrentUser()

    if (!user) {
      console.log("User not found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const identifier = `ratelimit:delete-item:${user.id}`
    const { success } = await ratelimit.limit(identifier)

    if (!success) {
      console.log("Rate limit exceeded")
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 })
    }

    const [item] = await db.select().from(items).where(eq(items.id, id)).limit(1)

    if (!item) {
      console.log("Item not found")
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    if (item.userId !== user.id) {
      console.log("User does not have permission to delete this item")
      return NextResponse.json(
        { error: "Unauthorized", description: "You do not have permission to delete this item" },
        { status: 401 }
      )
    }

    await db.delete(items).where(eq(items.id, id))

    console.log("Item deleted successfully")

    return NextResponse.json({ message: "Item deleted successfully" }, { status: 200 })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
