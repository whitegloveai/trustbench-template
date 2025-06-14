// "use server"

// import { getCurrentUser } from "@/server/actions/auth-actions"
// import { db } from "@/server/db/config/database"
// import { UserType } from "@/server/db/schema-types"
// import { userNotificationSettings, userSettings } from "@/server/db/schemas"
// import {
//   ApiError,
//   AuthenticationError,
//   DatabaseError,
//   RateLimitError,
//   ValidationError,
// } from "@/server/exceptions/exceptions"
// import { formatZodError } from "@/server/utils/format-zod-error"
// import { Ratelimit } from "@upstash/ratelimit"
// import { and, eq } from "drizzle-orm"
// import { z } from "zod"

// import { OnboardingStatusType } from "@/types/types"
// import { RATE_LIMIT_1_MINUTE, RATE_LIMIT_5 } from "@/lib/constants"
// import { redis } from "@/lib/redis"
// import { userNotificationSettingsSchema, userSettingsSchema } from "@/lib/schemas"

// const ratelimit = new Ratelimit({
//   redis,
//   limiter: Ratelimit.slidingWindow(RATE_LIMIT_5, RATE_LIMIT_1_MINUTE),
// })

// export const updateUserSettingsAction = async ({
//   values,
// }: {
//   values: z.infer<typeof userNotificationSettingsSchema>
// }) => {
//   try {
//     const validateValues = userNotificationSettingsSchema
//       .pick({ userId: true, subscriptionEmails: true, updateEmails: true, userSettingsId: true })
//       .safeParse(values)

//     if (!validateValues.success) {
//       throw new ValidationError(formatZodError(validateValues.error))
//     }

//     const { updateEmails, userId, subscriptionEmails, userSettingsId } = validateValues.data

//     // 2. Checks for user session
//     const { user } = await getCurrentUser()

//     if (!user) {
//       throw new AuthenticationError()
//     }

//     const identifier = `ratelimit:edit-profile:${user.id}`
//     const { success } = await ratelimit.limit(identifier)

//     if (!success) {
//       throw new RateLimitError()
//     }

//     if (user.id !== userId) {
//       throw new AuthenticationError("Cannot update another user's settings")
//     }

//     let message = "No changes made"

//     await db
//       .update(userNotificationSettings)
//       .set({
//         updateEmails,
//         subscriptionEmails,
//         updatedAt: new Date(),
//       })
//       .where(
//         and(
//           eq(userNotificationSettings.userId, userId),
//           eq(userNotificationSettings.id, userSettingsId)
//         )
//       )
//     message = message === "No changes made" ? "Updated notification settings" : "Updated settings"

//     return {
//       status: 200,
//       success: true,
//       message,
//     }
//   } catch (error: any) {
//     // Re-throw known errors
//     if (error instanceof ApiError) {
//       throw error
//     }
//     // Handle unexpected errors
//     throw new DatabaseError("Failed to update profile settings", "An unexpected error occurred")
//   }
// }

// // export const updateOnboardingAction = async ({
// //   userId,
// //   status,
// // }: {
// //   userId: UserType["id"]
// //   status: OnboardingStatusType
// // }) => {
// //   try {
// //     const validateValues = userSettingsSchema
// //       .pick({ userId: true, onboardingStatus: true })
// //       .safeParse({ userId, onboardingStatus: status })

// //     if (!validateValues.success) {
// //       throw new ValidationError(formatZodError(validateValues.error))
// //     }

// //     const { onboardingStatus, userId: validatedId } = validateValues.data

// //     // 2. Checks for user session
// //     const { user } = await getCurrentUser()

// //     if (!user) {
// //       throw new AuthenticationError()
// //     }

// //     const identifier = `ratelimit:edit-onboarding:${user.id}`
// //     const { success } = await ratelimit.limit(identifier)

// //     if (user.id !== validatedId) {
// //       throw new AuthenticationError("Cannot edit other user's onboarding")
// //     }

// //     if (!success) {
// //       throw new RateLimitError()
// //     }

// //     await db
// //       .update(userSettings)
// //       .set({
// //         onboardingStatus,
// //         onboardingCompletedAt: onboardingStatus === "completed" ? new Date() : null,
// //         updatedAt: new Date(),
// //       })
// //       .where(eq(userSettings.userId, validatedId))

// //     return {
// //       status: 200,
// //       success: true,
// //       message: `Onboarding ${onboardingStatus}`,
// //       description: `You are being redirected to the ${onboardingStatus === "completed" ? "Dashboard" : "Onboarding"}  page`,
// //     }
// //   } catch (error: any) {
// //     if (error instanceof ApiError) {
// //       throw error
// //     }
// //     throw new DatabaseError("Failed to update onboarding", "An unexpected error occurred")
// //   }
// // }
