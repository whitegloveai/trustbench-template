import { users, workspaces } from "@/server/db/schemas"
import { relations } from "drizzle-orm"
import { index, json, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core"

export const itemStatus = pgEnum("status", ["todo", "in_progress", "done"])

export const items = pgTable(
  "item",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    description: text("description"),

    userId: text("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    workspaceId: text("workspace_id")
      .references(() => workspaces.id, { onDelete: "cascade" })
      .notNull(),

    status: itemStatus("status").default("todo"),

    tags: json("tags"),

    dueDate: timestamp("due_date"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => [
    index("item_workspace_id_idx").on(t.workspaceId),
    index("item_workspace_created_at_idx").on(t.workspaceId, t.createdAt),
    index("item_user_id_idx").on(t.userId),
    index("item_status_idx").on(t.status),
  ]
)

export const itemsRelations = relations(items, ({ one }) => ({
  creator: one(users, {
    fields: [items.userId],
    references: [users.id],
  }),
  workspace: one(workspaces, {
    fields: [items.workspaceId],
    references: [workspaces.id],
  }),
}))
