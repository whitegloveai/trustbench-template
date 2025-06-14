import { users } from "@/server/db/schemas"
import { relations } from "drizzle-orm"
import { boolean, index, pgTable, text, timestamp } from "drizzle-orm/pg-core"

import { NotificationTypesType } from "@/types/types"

export const notifications = pgTable(
  "notification",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    title: text("title").notNull(),
    message: text("message").notNull(),
    type: text("type").notNull().$type<NotificationTypesType>().default("info"),

    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    read: boolean("is_read").notNull().default(false),
    link: text("link"),
    archived: boolean("archived").notNull().default(false),
    accepted: boolean("accepted"),
    identifier: text("identifier"),

    expiresAt: timestamp("expires_at").defaultNow(),
    expired: boolean("expired"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => [
    index("notification_user_archived_created_at_idx").on(t.userId, t.archived, t.createdAt),
    index("notification_user_id_idx").on(t.userId),
  ]
)

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}))
