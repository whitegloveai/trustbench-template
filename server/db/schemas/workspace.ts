import { invitations, items, subscriptions, users, workspaceMembers } from "@/server/db/schemas"
import { relations } from "drizzle-orm"
import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core"

export const workspaces = pgTable(
  "workspace",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),

    phone: text("phone"),
    logo: text("logo"),

    subscriptionId: text("subscription_id").references(() => subscriptions.id, {
      onDelete: "cascade",
    }),

    createdAt: timestamp("created_at", { mode: "date" })
      .notNull()
      .$default(() => new Date()),
    updatedAt: timestamp("updated_at", { mode: "date" }),
  },
  (table) => [
    index("workspace_slug_idx").on(table.slug),
    index("workspace_owner_idx").on(table.ownerId),
    index("workspace_created_at_idx").on(table.createdAt),
  ]
)

export const workspaceRelations = relations(workspaces, ({ many, one }) => ({
  creator: one(users, {
    fields: [workspaces.ownerId],
    references: [users.id],
  }),
  subscription: one(subscriptions, {
    fields: [workspaces.subscriptionId],
    references: [subscriptions.id],
  }),
  members: many(workspaceMembers),
  items: many(items),
  invitations: many(invitations),
}))
