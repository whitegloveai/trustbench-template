import { items, notifications, subscriptions, workspaceMembers } from "@/server/db/schemas"
import { relations } from "drizzle-orm"
import { boolean, index, pgEnum, pgTable, primaryKey, text, timestamp } from "drizzle-orm/pg-core"

export const onboardingStatusEnum = pgEnum("onboarding_status", [
  "not_started",
  "in_progress",
  "completed",
])

export const users = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  lastName: text("last_name"),
  email: text("email").unique().notNull(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),

  stripeCustomerId: text("stripe_customer_id").unique(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  stripePriceId: text("stripe_price_id"),
  stripeCurrentPeriodEnd: timestamp("stripe_current_period_end").defaultNow(),

  lastLoggedIn: timestamp("last_logged_in").defaultNow(),
  lastActive: timestamp("last_active").defaultNow(),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const usersRelations = relations(users, ({ one, many }) => ({
  notifications: many(notifications),
  userNotificationSettings: one(userNotificationSettings),
  subscription: one(subscriptions),
  items: many(items),
  workspaceMemberships: many(workspaceMembers),
}))

export const userSettings = pgTable(
  "user_setting",
  {
    id: text("id").$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    onboardingStatus: onboardingStatusEnum("onboarding_status").notNull().default("not_started"),
    onboardingStep: text("onboarding_step")
      .$type<"profile" | "workspace" | "collaborate" | "done">()
      .default("profile"), // Track current step
    onboardingCompletedAt: timestamp("onboarding_completed_at"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.id] }),
    index("user_setting_onboarding_status_idx").on(t.onboardingStatus),
  ]
)

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}))

export const userNotificationSettings = pgTable("user_notification_setting", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  userSettingsId: text("user_settings_id").notNull(),
  updateEmails: boolean("update_emails").notNull(),
  subscriptionEmails: boolean("subscription_emails"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

export const userNotificationSettingsRelations = relations(userNotificationSettings, ({ one }) => ({
  user: one(users, {
    fields: [userNotificationSettings.userId],
    references: [users.id],
  }),
  userSettings: one(userSettings, {
    fields: [userNotificationSettings.userSettingsId],
    references: [userSettings.id],
  }),
}))
