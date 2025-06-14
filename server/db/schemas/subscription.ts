import { users, workspaces } from "@/server/db/schemas"
import { relations } from "drizzle-orm"
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core"

import { PlanTypesType, SubscriptionStatusTypesType } from "@/types/types"
import { configuration } from "@/lib/config"

export const subscriptions = pgTable("subscription", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Plan details
  planType: text("plan_type").notNull().$type<PlanTypesType>(),
  priceId: text("price_id"), // Stripe price ID

  maxWorkspaces: integer("max_workspaces")
    .notNull()
    .default(configuration.stripe.products[0].workspacesQuota),
  maxMembers: integer("max_members")
    .notNull()
    .default(configuration.stripe.products[0].membersQuota),

  // Yearly or Monthly
  billingCycle: text("billing_cycle").$type<"yearly" | "monthly">().default("monthly"),

  trialEndsAt: timestamp("trial_ends_at"),
  canceledAt: timestamp("canceled_at"),

  stripeSubscriptionId: text("stripe_subscription_id"),

  // Subscription status
  status: text("status").notNull().$type<SubscriptionStatusTypesType>(),
  currentPeriodStart: timestamp("current_period_start").notNull().defaultNow(),
  currentPeriodEnd: timestamp("current_period_end"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const subscriptionRelations = relations(subscriptions, ({ one, many }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  workspaces: many(workspaces),
}))
