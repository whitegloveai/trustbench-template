/* eslint-disable no-console */
import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/server/queries/auth-queries"
import { Ratelimit } from "@upstash/ratelimit"
import { z } from "zod"

import { configuration } from "@/lib/config"
import { RATE_LIMIT_1_MINUTE, RATE_LIMIT_5 } from "@/lib/constants"
import { redis } from "@/lib/redis"
import { resend } from "@/lib/resend"
import { feedbackSchema } from "@/lib/schemas"
import { FeedbackMail } from "@/components/mail/feedback-mail"

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(RATE_LIMIT_5, RATE_LIMIT_1_MINUTE),
})

export async function POST(req: NextRequest) {
  try {
    console.log("Incomning POST request /api/feedback")

    const body = await req.json()

    console.log("Body:", body)

    const validateFeedback = feedbackSchema.parse(body)

    const { feedback } = validateFeedback

    const { user } = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        { status: 401 }
      )
    }

    const identifier = `ratelimit:send-feedback:${user.id}`
    const { success: rateLimitSuccess } = await ratelimit.limit(identifier)

    if (!rateLimitSuccess) {
      return NextResponse.json({ error: "Too many feedbacks sent" }, { status: 429 })
    }

    const result = await resend.emails.send({
      from: configuration.resend.email,
      to: configuration.site.contactEmail,
      subject: `Feedback from ${user.name} | ${configuration.site.name}`,
      react: FeedbackMail({ feedback, fromUser: user }),
    })

    if (result.error) {
      return NextResponse.json({ error: "Failed to send feedback" }, { status: 500 })
    }

    return NextResponse.json(
      { message: "Feedback sent successfully", description: "Thank you for your feedback!" },
      { status: 200 }
    )
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: "Validation Error",
          details: error.errors,
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error.message,
      },
      { status: 500 }
    )
  }
}
