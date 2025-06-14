import { items, userNotificationSettings, workspaces } from "@/server/db/schemas"
import { itemStatus } from "@/server/db/schemas/item"
import { createInsertSchema } from "drizzle-zod"
import { z } from "zod"

import { BUCKET_NAME } from "@/lib/constants"
import { slugRegex } from "@/lib/utils"

// Base schema for string validations with common options
const baseStringSchema = ({
  minChar = 1,
  maxChar = 25,
  required_error = "Field is required",
}: {
  minChar?: number
  maxChar?: number
  required_error?: string
}) =>
  z
    .string({ required_error })
    .min(minChar, { message: `Must be at least ${minChar} characters` })
    .max(maxChar, { message: `Must be at most ${maxChar} characters` })

export const userIdSchema = z
  .string()
  .length(32, { message: "User ID must be 32 characters long" })
  .regex(/^[A-Za-z0-9]+$/, { message: "User ID must be alphanumeric" })

const s3ImageSchema = z
  .string()
  .url()
  .max(2048)
  .refine((url) => url.startsWith("https://"), {
    message: "Image URL must use HTTPS",
  })
  .refine(
    (url) => {
      // Allow either S3 bucket or Google user content URLs
      return (
        url.startsWith(`https://${BUCKET_NAME}.s3.amazonaws.com`) ||
        url.startsWith("https://lh3.googleusercontent.com")
      )
    },
    {
      message: "Image URL must be from either Tsker S3 bucket or Google user content",
    }
  )
  .refine(
    (url) => {
      if (url.startsWith(`https://${BUCKET_NAME}.s3.amazonaws.com`)) {
        const s3Pattern =
          /^https:\/\/tsker\.s3\.amazonaws\.com\/[A-Za-z0-9]{32}\/[a-f0-9]{32}\.(jpg|jpeg|png|gif|webp)$/i
        return s3Pattern.test(url)
      }
      // Google user content URLs pattern
      const googlePattern = /^https:\/\/lh3\.googleusercontent\.com\/.+$/
      return googlePattern.test(url)
    },
    {
      message: "Invalid image URL format",
    }
  )
  .or(z.literal(""))
  .optional()

const usernameSchema = z
  .string()
  .min(1, { message: "Username must be at least 3 characters" })
  .max(20, { message: "Username cannot exceed 20 characters" })
  .regex(/^[a-zA-Z0-9_.\- ]+$/, {
    message: "Username can only contain letters, numbers, underscores, dots, hyphens, and spaces",
  })
  .refine(
    (username) =>
      !username.startsWith(".") &&
      !username.endsWith(".") &&
      !username.startsWith("-") &&
      !username.endsWith("-") &&
      !username.startsWith("_") &&
      !username.endsWith("_"),
    {
      message: "Username cannot start or end with a period, hyphen, or underscore",
    }
  )
  .refine(
    (name) => {
      // Allow letters (both cases), spaces, hyphens, apostrophes
      // Support international characters
      return /^[\p{L}\p{M}' \-]+$/u.test(name)
    },
    {
      message: "Name should only contain letters, spaces, hyphens, and apostrophes",
    }
  )
  .refine(
    (username) => {
      // List of reserved usernames to prevent
      const reserved = [
        "admin",
        "administrator",
        "system",
        "moderator",
        "mod",
        "help",
        "support",
        "staff",
        "root",
        "webmaster",
        "security",
        "info",
        "contact",
        "abuse",
        "postmaster",
      ]
      return !reserved.includes(username)
    },
    {
      message: "This username is reserved and cannot be used",
    }
  )
  .transform((name) =>
    // Trim whitespace but preserve original case
    name.trim().replace(/\s+/g, " ")
  )

export const slugSchema = baseStringSchema({
  minChar: 3,
  maxChar: 32,
  required_error: "Slug is required",
}).regex(slugRegex, {
  message: "Slug must be lowercase, contain no spaces or special characters (except '-')",
})

export const userSchema = z.object({
  id: userIdSchema,
  name: usernameSchema,
  lastName: usernameSchema.optional(),
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .min(3, { message: "Email must be at least 3 characters" })
    .email("Invalid email address")
    .toLowerCase(),
  image: s3ImageSchema,
})

const nameRegex = /^[a-zA-Z0-9\s]+$/

export const workspaceSchema = createInsertSchema(workspaces, {
  id: z.string().uuid({ message: "Invalid workspace ID" }).optional(),
  name: z
    .string()
    .trim()
    .min(1, { message: "Name is required" })
    .max(32, { message: "Name must be at most 32 characters" })
    .regex(nameRegex, { message: "Name can only contain letters and numbers" }),
  slug: slugSchema,
  logo: s3ImageSchema,
  ownerId: z.string().uuid({ message: "Invalid owner ID" }).optional(),
})

export const createWorkspaceSchema = workspaceSchema
  .pick({
    name: true,
    slug: true,
    logo: true,
  })
  .extend({
    isInitial: z.boolean(),
  })

export const deleteWorkspaceSchema = workspaceSchema.pick({
  id: true,
})

export const updateWorkspaceSchema = workspaceSchema.pick({
  name: true,
  slug: true,
  id: true,
})

export const itemSchema = createInsertSchema(items, {
  id: z.string().uuid({ message: "Invalid item ID" }).optional(),
  name: z
    .string()
    .trim()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name must be at most 100 characters" }),
  description: z
    .string()
    .trim()
    .max(255, { message: "Description must be at most 255 characters" })
    .optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(itemStatus.enumValues).default("todo"),
})

export const createItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().nullable(),
  dueDate: z.date().optional(),
  status: z.enum(itemStatus.enumValues).default("todo"),
  tags: z.array(z.object({ value: z.string(), label: z.string() })),
  slug: slugSchema,
})

export const userNotificationSettingsSchema = createInsertSchema(userNotificationSettings, {
  subscriptionEmails: z.boolean().optional(),
  updateEmails: z.boolean(),
})

export const invitationSchema = z.object({
  id: z.string().optional(),
  email: z.string().email({ message: "Please enter a valid email address" }),
  token: z.string().optional(),
  expiresAt: z.date().optional(),
  workspaceId: z.string().uuid({ message: "Invalid workspace ID" }),
  invitedBy: z.string().min(1, { message: "Invited by is required" }),
  invitedByProfileImage: z.string().nullable().optional(), // Allow null values
  role: z.enum(["member", "admin"]),
})

export const idSchema = ({ uuidMessage }: { uuidMessage?: string }) =>
  z
    .string({
      required_error: "ID is required",
      invalid_type_error: "ID must be a string",
    })
    .uuid({ message: uuidMessage ?? "Invalid ID format: must be a valid UUID" })
    .refine(
      (id) => {
        // Additional security checks
        const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        return uuidV4Regex.test(id)
      },
      { message: "Invalid ID: must be a valid UUID v4" }
    )
    .refine(
      (id) => {
        // Prevent specific patterns or known bad IDs
        const blacklist = [
          "00000000-0000-0000-0000-000000000000",
          "11111111-1111-1111-1111-111111111111",
        ]
        return !blacklist.includes(id)
      },
      { message: "Invalid ID: this ID is not allowed" }
    )

export const bulkInvitationSchema = z.object({
  emails: z.array(z.string().email("Please enter a valid email address")),
})

export const feedbackSchema = z.object({
  feedback: z
    .string()
    .min(1, "Feedback is required")
    .max(255, "Feedback must be at most 255 characters"),
})
