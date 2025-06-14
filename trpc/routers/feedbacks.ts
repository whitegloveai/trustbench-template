import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import { TRPCError } from "@trpc/server"

import { configuration } from "@/lib/config"
import { resend } from "@/lib/resend"
import { feedbackSchema } from "@/lib/schemas"
import { FeedbackMail } from "@/components/mail/feedback-mail"

export const feedbacksRouter = createTRPCRouter({
  create: protectedProcedure.input(feedbackSchema).mutation(async ({ ctx, input }) => {
    const { user } = ctx

    const { feedback } = input

    const result = await resend.emails.send({
      from: configuration.resend.email,
      to: configuration.site.contactEmail,
      subject: `Feedback from ${user.name} | ${configuration.site.name}`,
      react: FeedbackMail({ feedback, fromUser: user }),
    })

    if (result.error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to send feedback",
      })
    }

    return {
      message: "Feedback sent successfully",
      description: "Thank you for your feedback!",
    }
  }),
})
