import { db, dbClient } from "@/server/db/config/database"
import {
  notifications,
  roles,
  subscriptions,
  users,
  userSettings,
  workspaceMembers,
  workspaces,
} from "@/server/db/schemas"
import { hasPermission, PERMISSIONS } from "@/server/queries/permissions"
import { getUserSubscription, getWorkspaceSubscriptionBySlug } from "@/server/queries/subscriptions"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import { TRPCError } from "@trpc/server"
import { and, desc, eq, getTableColumns } from "drizzle-orm"
import { z } from "zod"

import { createRoute } from "@/lib/routes"
import {
  createWorkspaceSchema,
  deleteWorkspaceSchema,
  updateWorkspaceSchema,
  workspaceSchema,
} from "@/lib/schemas"
import { capitalizeFirstLetter, slugify } from "@/lib/utils"

export const workspacesRouter = createTRPCRouter({
  getSwitcher: protectedProcedure
    .input(workspaceSchema.pick({ slug: true }))
    .query(async ({ ctx, input }) => {
      const { user } = ctx
      const { slug } = input

      // Run these queries in parallel to improve performance
      const [workspaceData, currentWorkspace] = await Promise.all([
        // Query 1: Get all workspaces with membership info
        db
          .select({
            ...getTableColumns(workspaceMembers),
            workspace: {
              ...getTableColumns(workspaces),
            },
          })
          .from(workspaceMembers)
          .where(eq(workspaceMembers.userId, user.id))
          .leftJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
          .orderBy(desc(workspaces.createdAt)),

        // Query 3: Get current workspace directly
        db.query.workspaces.findFirst({
          where: eq(workspaces.slug, slug),
          with: {
            members: {
              where: eq(workspaceMembers.userId, user.id),
            },
          },
        }),
      ])

      if (!currentWorkspace) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        })
      }

      // Extract and separate workspaces in one pass
      const ownedWorkspaces: (typeof workspaces.$inferSelect)[] = []
      const memberWorkspaces: (typeof workspaces.$inferSelect)[] = []

      workspaceData.forEach((item) => {
        if (item.workspace) {
          if (item.workspace.ownerId === user.id) {
            ownedWorkspaces.push(item.workspace)
          } else {
            memberWorkspaces.push(item.workspace)
          }
        }
      })

      return {
        ownedWorkspaces,
        memberWorkspaces,
        workspace: currentWorkspace,
        user: {
          name: user.name,
          image: user.image,
        },
      }
    }),

  getOne: protectedProcedure
    .input(workspaceSchema.pick({ slug: true }))
    .query(async ({ ctx, input }) => {
      const { user } = ctx

      const { slug } = input

      const [workspace] = await db
        .select({
          name: workspaces.name,
          slug: workspaces.slug,
          logo: workspaces.logo,
          id: workspaces.id,
          ownerId: workspaces.ownerId,
          updatedAt: workspaces.updatedAt,
          owner: {
            name: users.name,
            email: users.email,
            image: users.image,
          },
        })
        .from(workspaces)
        .leftJoin(users, eq(workspaces.ownerId, users.id))
        .where(eq(workspaces.slug, slug))
        .limit(1)

      if (!workspace) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        })
      }

      const [canEdit, subscription] = await Promise.all([
        hasPermission({
          userId: user.id,
          workspaceId: workspace.id,
          permissionName: PERMISSIONS.MANAGE_MEMBERS,
        }),
        getWorkspaceSubscriptionBySlug(slug),
      ])
      const isOwner = workspace.ownerId === user.id

      return {
        user,
        workspace,
        canEdit,
        isOwner,
        subscription,
      }
    }),

  getMany: protectedProcedure.query(async ({ ctx }) => {
    const { user } = ctx

    const allWorkspaces = await db
      .select({
        workspace: workspaces,
        isOwner: eq(workspaces.ownerId, user.id),
      })
      .from(workspaceMembers)
      .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
      .where(and(eq(workspaceMembers.userId, user.id), eq(workspaceMembers.status, "active")))

    const ownedWorkspaces = allWorkspaces.filter((w) => w.isOwner).map((w) => w.workspace)
    const memberWorkspaces = allWorkspaces.filter((w) => !w.isOwner).map((w) => w.workspace)

    return {
      ownedWorkspaces,
      memberWorkspaces,
    }
  }),

  create: protectedProcedure.input(createWorkspaceSchema).mutation(async ({ ctx, input }) => {
    const { user } = ctx

    const { name, slug, logo, isInitial } = input

    const slugName = slugify(slug)

    const userId = user.id

    // 1. Get data
    const [workspaceWithSlug, userOwnedWorkspaces, stripeSubscription, subscription, [ownerRole]] =
      await Promise.all([
        // Check if slug exists
        dbClient.select().from(workspaces).where(eq(workspaces.slug, slugName)).limit(1),
        // Get user's workspaces
        dbClient.select().from(workspaces).where(eq(workspaces.ownerId, userId)),
        // Get subscription data
        getUserSubscription({ user }),
        // Get user's subscription
        dbClient.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1),
        // Get owner role
        dbClient.select().from(roles).where(eq(roles.name, "owner")).limit(1),
      ])

    if (workspaceWithSlug.length) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Workspace with slug already exists",
      })
    }

    if (!subscription.length) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Subscription not found",
      })
    }

    if (!ownerRole) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Owner role not found",
      })
    }

    const { workspacesQuota, type, isSubscribed } = stripeSubscription

    // 2. Check subscription limits
    if (userOwnedWorkspaces.length >= workspacesQuota! && !isSubscribed) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Exceeded ${capitalizeFirstLetter(type!)} plan Workspace quota`,
      })
    }

    const newWorkspace = await dbClient.transaction(async (tx) => {
      // Create workspace
      const [newWorkspace] = await tx
        .insert(workspaces)
        .values({
          ownerId: user.id,
          slug: slugName,
          logo: logo ? (logo as string) : null,
          name,
          subscriptionId: subscription[0].id,
        })
        .returning({
          id: workspaces.id,
          slug: workspaces.slug,
          name: workspaces.name,
          logo: workspaces.logo,
          createdAt: workspaces.createdAt,
        })

      // Create workspace member with owner role
      await tx.insert(workspaceMembers).values({
        roleId: ownerRole.id,
        userId: user.id,
        workspaceId: newWorkspace.id,
      })

      if (isInitial) {
        await tx
          .update(userSettings)
          .set({
            onboardingStep: "collaborate",
            updatedAt: new Date(),
          })
          .where(eq(userSettings.userId, user.id))
      }

      return newWorkspace
    })

    let redirectUrl: string

    if (isInitial) {
      redirectUrl = `/onboarding/collaborate?workspaceId=${newWorkspace.id}`
    } else {
      redirectUrl = createRoute("dashboard", { slug: newWorkspace.slug }).href
    }

    return {
      message: "Workspace created successfully",
      description: "You will be redirected to the workspace",
      redirectUrl,
      workspace: newWorkspace,
    }
  }),

  update: protectedProcedure.input(updateWorkspaceSchema).mutation(async ({ ctx, input }) => {
    const { user } = ctx

    const { name, slug: newSlug, id } = input

    if (!id) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Workspace ID is required",
      })
    }

    const [workspace] = await db.select().from(workspaces).where(eq(workspaces.id, id)).limit(1)

    if (!workspace) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Workspace not found",
      })
    }

    const canUpdate = await hasPermission({
      userId: user.id,
      workspaceId: workspace.id,
      permissionName: PERMISSIONS.MANAGE_WORKSPACE,
    })

    if (!canUpdate) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to update this workspace",
      })
    }

    const [updatedWorkspace] = await db
      .update(workspaces)
      .set({
        name,
        slug: newSlug,
        updatedAt: new Date(),
      })
      .where(eq(workspaces.id, workspace.id))
      .returning({
        id: workspaces.id,
        slug: workspaces.slug,
        name: workspaces.name,
        logo: workspaces.logo,
        updatedAt: workspaces.updatedAt,
      })

    return {
      message: "Workspace updated successfully",
      newSlug: newSlug ?? null,
      updatedWorkspace,
    }
  }),

  updateLogo: protectedProcedure
    .input(workspaceSchema.pick({ id: true, logo: true }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx

      const { id, logo } = input

      if (!id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Workspace ID is required",
        })
      }

      const [workspace] = await db.select().from(workspaces).where(eq(workspaces.id, id)).limit(1)

      if (!workspace) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        })
      }

      const canUpdate = await hasPermission({
        userId: user.id,
        workspaceId: workspace.id,
        permissionName: PERMISSIONS.MANAGE_WORKSPACE,
      })

      if (!canUpdate) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to update this workspace",
        })
      }

      const [updatedWorkspace] = await db
        .update(workspaces)
        .set({ logo })
        .where(eq(workspaces.id, workspace.id))
        .returning({ logo: workspaces.logo })

      return {
        message: "Workspace logo updated successfully",
        updatedWorkspace,
      }
    }),

  delete: protectedProcedure.input(deleteWorkspaceSchema).mutation(async ({ ctx, input }) => {
    const { user } = ctx

    const { id } = input

    if (!id) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Workspace ID is required",
      })
    }

    const [workspace] = await db.select().from(workspaces).where(eq(workspaces.id, id)).limit(1)

    if (!workspace) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Workspace not found",
      })
    }

    // Only owner can delete workspace
    if (workspace.ownerId !== user.id) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to delete this workspace",
      })
    }

    // Check if user has permission to delete workspace
    const canDelete = await hasPermission({
      userId: user.id,
      workspaceId: workspace.id,
      permissionName: PERMISSIONS.DELETE_WORKSPACE,
    })

    if (!canDelete) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are not authorized to delete this workspace",
      })
    }

    await db.delete(workspaces).where(eq(workspaces.id, id))

    return {
      message: "Workspace deleted successfully",
      description: "You will be redirected to the home page",
      redirectUrl: "/callback",
    }
  }),

  transferOwnership: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid({ message: "Invalid workspace ID" }),
        email: z.string().email({ message: "Invalid email address" }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx

      const { id, email } = input

      const [newOwner] = await dbClient.select().from(users).where(eq(users.email, email)).limit(1)

      if (!newOwner) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        })
      }

      if (newOwner.id === user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "New owner cannot be the current user",
        })
      }

      const [workspace] = await dbClient
        .select()
        .from(workspaces)
        .where(eq(workspaces.id, id))
        .limit(1)

      if (!workspace) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Workspace not found",
        })
      }

      const canTransferOwnership = await hasPermission({
        userId: user.id,
        workspaceId: workspace.id,
        permissionName: PERMISSIONS.TRANSFER_OWNERSHIP,
      })

      if (!canTransferOwnership) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to transfer ownership of this workspace",
        })
      }

      // Check if the user is a member of the workspace

      const [[member], [currentOwnerSubscription]] = await Promise.all([
        dbClient
          .select()
          .from(workspaceMembers)
          .where(
            and(
              eq(workspaceMembers.userId, newOwner.id),
              eq(workspaceMembers.workspaceId, workspace.id)
            )
          )
          .limit(1),
        dbClient.select().from(subscriptions).where(eq(subscriptions.userId, user.id)).limit(1),
      ])

      if (!member) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "New owner is not a member of the workspace",
        })
      }

      if (
        currentOwnerSubscription.planType !== "PRO" &&
        currentOwnerSubscription.planType !== "STARTER"
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Current owner must have an active PRO or STARTER subscription",
        })
      }

      const [newOwnerSubscription] = await dbClient
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, newOwner.id))
        .limit(1)

      if (newOwnerSubscription.planType !== currentOwnerSubscription.planType) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "New owner must have the same subscription plan as the current owner",
        })
      }

      await dbClient.transaction(async (trx) => {
        // Update the new owner
        await trx
          .update(workspaces)
          .set({
            ownerId: newOwner.id,
            updatedAt: new Date(),
          })
          .where(eq(workspaces.id, workspace.id))

        const [ownerRole] = await trx
          .select({
            id: roles.id,
          })
          .from(roles)
          .where(eq(roles.name, "owner"))
          .limit(1)

        const [memberRole] = await trx
          .select({
            id: roles.id,
          })
          .from(roles)
          .where(eq(roles.name, "member"))
          .limit(1)

        await trx
          .update(workspaceMembers)
          .set({
            roleId: ownerRole.id,
            updatedAt: new Date(),
          })
          .where(eq(workspaceMembers.userId, newOwner.id))

        await trx
          .update(workspaceMembers)
          .set({
            roleId: memberRole.id,
            updatedAt: new Date(),
          })
          .where(eq(workspaceMembers.userId, user.id))

        await trx.insert(notifications).values({
          title: "Workspace Ownership Transfered",
          message: `You are no longer the owner of ${workspace.name}`,
          userId: user.id,
        })

        await trx.insert(notifications).values({
          title: "Workspace Ownership Transfered",
          message: `You are now the owner of ${workspace.name}`,
          userId: newOwner.id,
        })
      })

      return {
        message: "Workspace ownership transferred successfully",
        description: "You are no longer the owner of this workspace",
      }
    }),
})
