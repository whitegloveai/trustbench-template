import { db } from "@/server/db/config/database"
import { items, notifications, users, workspaces } from "@/server/db/schemas"
import { getIsUserMember, hasPermission, PERMISSIONS } from "@/server/queries/permissions"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import { TRPCError } from "@trpc/server"
import { desc, eq, getTableColumns } from "drizzle-orm"
import { z } from "zod"

import { createItemSchema, itemSchema, slugSchema, workspaceSchema } from "@/lib/schemas"

export const itemsRouter = createTRPCRouter({
  getOne: protectedProcedure
    .input(
      itemSchema.pick({
        id: true,
      })
    )
    .query(async (opts) => {
      const { id } = opts.input

      if (!id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Item ID is required" })
      }

      const [item] = await db.select().from(items).where(eq(items.id, id)).limit(1)

      if (!item) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" })
      }

      return item
    }),

  getMany: protectedProcedure
    .input(
      workspaceSchema.pick({
        slug: true,
      })
    )
    .query(async ({ ctx, input }) => {
      const { slug } = input
      const { user } = ctx

      const [workspace] = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.slug, slug))
        .limit(1)

      if (!workspace) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" })
      }

      const isMember = await getIsUserMember({ userId: user.id, workspaceId: workspace.id })

      if (!isMember) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a member of this workspace",
        })
      }

      const data = await db
        .select({
          ...getTableColumns(items),
          creator: {
            image: users.image,
            name: users.name,
            email: users.email,
          },
        })
        .from(items)
        .where(eq(items.workspaceId, workspace.id))
        .leftJoin(users, eq(items.userId, users.id))
        .orderBy(desc(items.createdAt))

      return data
    }),

  create: protectedProcedure.input(createItemSchema).mutation(async ({ ctx, input }) => {
    const { user } = ctx

    const { description, dueDate, status, slug, name, tags } = input

    const [workspace] = await db.select().from(workspaces).where(eq(workspaces.slug, slug)).limit(1)

    if (!workspace) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" })
    }

    const isMember = await getIsUserMember({ userId: user.id, workspaceId: workspace.id })

    if (!isMember) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not a member of this workspace",
      })
    }

    const [newItem] = await db
      .insert(items)
      .values({
        name,
        description,
        userId: user.id,
        workspaceId: workspace.id,
        dueDate,
        tags,
        status,
      })
      .returning({
        id: items.id,
      })

    if (newItem) {
      await db.insert(notifications).values({
        title: "Item has been created",
        message: `${name} has been created`,
        userId: user.id,
        link: `/${slug}/items/${newItem.id}`,
        expiresAt: null,
        type: "info",
        identifier: newItem.id,
        accepted: false,
      })
    }

    return {
      message: "Item created successfully",
      newItem,
      slug,
    }
  }),

  duplicate: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid({ message: "Invalid item ID" }).optional(),
        slug: slugSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx
      const { id, slug } = input

      if (!id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Item ID is required" })
      }

      const [item] = await db.select().from(items).where(eq(items.id, id)).limit(1)

      if (!item) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" })
      }

      const [isMember, canCreate, [workspace]] = await Promise.all([
        getIsUserMember({ userId: user.id, workspaceId: item.workspaceId }),
        hasPermission({
          userId: user.id,
          workspaceId: item.workspaceId,
          permissionName: PERMISSIONS.CREATE_ITEMS,
        }),
        db.select().from(workspaces).where(eq(workspaces.slug, slug)).limit(1),
      ])

      if (!workspace) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" })
      }

      if (!isMember) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a member of this workspace",
        })
      }

      if (!canCreate) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to create items",
        })
      }

      const newItem = await db
        .insert(items)
        .values({
          name: item.name,
          description: item.description,
          userId: user.id,
          workspaceId: item.workspaceId,
          dueDate: item.dueDate,
          tags: item.tags,
          status: item.status,
        })
        .returning({
          id: items.id,
          name: items.name,
          description: items.description,
          dueDate: items.dueDate,
          tags: items.tags,
          status: items.status,
        })

      return {
        message: "Item duplicated successfully",
        newItem,
      }
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid({ message: "Invalid item ID" }).optional(),
        slug: slugSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx
      const { id, slug } = input

      if (!id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Item ID is required" })
      }

      const [item] = await db.select().from(items).where(eq(items.id, id)).limit(1)

      if (!item) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" })
      }

      const [isMember, canDelete, [workspace]] = await Promise.all([
        getIsUserMember({ userId: user.id, workspaceId: item.workspaceId }),
        hasPermission({
          userId: user.id,
          workspaceId: item.workspaceId,
          permissionName: PERMISSIONS.DELETE_ITEMS,
        }),
        db.select().from(workspaces).where(eq(workspaces.slug, slug)).limit(1),
      ])

      if (!workspace) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" })
      }

      if (!isMember) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a member of this workspace",
        })
      }

      if (!canDelete) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to delete this item",
        })
      }

      await db.delete(items).where(eq(items.id, id))

      return {
        message: "Item deleted successfully",
      }
    }),
})
