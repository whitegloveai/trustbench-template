import { BETTER_AUTH_URL_ENV } from "@/env"
import { db, dbClient } from "@/server/db/config/database"
import {
  invitations,
  notifications,
  users,
  workspaceMembers,
  workspaces,
} from "@/server/db/schemas"
import { hasPermission, PERMISSIONS } from "@/server/queries/permissions"
import { getWorkspaceSubscriptionBySlug } from "@/server/queries/subscriptions"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import { TRPCError } from "@trpc/server"
import { isAfter } from "date-fns"
import { and, count, eq, ne } from "drizzle-orm"
import { z } from "zod"

import { RoleTypesType } from "@/types/types"
import { configuration } from "@/lib/config"
import { generateUniqueToken } from "@/lib/invitation"
import { resend } from "@/lib/resend"
import { invitationSchema, workspaceSchema } from "@/lib/schemas"
import { capitalizeFirstLetter } from "@/lib/utils"
import { InvitationMail } from "@/components/mail/invitation-mail"

export const invitationsRouter = createTRPCRouter({
  getMany: protectedProcedure
    .input(workspaceSchema.pick({ slug: true }))
    .query(async ({ input }) => {
      const { slug } = input

      const workspace = await db.query.workspaces.findFirst({
        where: eq(workspaces.slug, slug),
        with: {
          invitations: {
            where: ne(invitations.status, "accepted"),
          },
        },
      })

      if (!workspace) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" })
      }

      const filteredInvitations = workspace.invitations.map((invitation) => ({
        ...invitation,
        isExpired: isAfter(new Date(), new Date(invitation.expiresAt)),
      }))

      return filteredInvitations
    }),

  create: protectedProcedure.input(invitationSchema).mutation(async ({ ctx, input }) => {
    const { user } = ctx
    const { email, role, workspaceId, invitedBy, invitedByProfileImage } = input

    await dbClient.transaction(async (trx) => {
      // Get workspace
      const [workspace] = await trx
        .select({
          id: workspaces.id,
          name: workspaces.name,
          slug: workspaces.slug,
          logo: workspaces.logo,
          members: count(workspaceMembers.userId),
        })
        .from(workspaces)
        .where(eq(workspaces.id, workspaceId))
        .limit(1)
        .leftJoin(workspaceMembers, eq(workspaceMembers.workspaceId, workspaces.id))
        .groupBy(workspaces.id)

      if (!workspace) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" })
      }

      const [{ plan }, canInviteMembers, [invitedUser], [invitation]] = await Promise.all([
        // Get subscription
        getWorkspaceSubscriptionBySlug(workspace.slug),

        // Get permission
        hasPermission({
          userId: user.id,
          workspaceId: workspaceId,
          permissionName: PERMISSIONS.INVITE_MEMBERS,
        }),

        // Check if the invited user exists in the database
        await trx.select().from(users).where(eq(users.email, email)).limit(1),

        // Get invitation
        await trx
          .select()
          .from(invitations)
          .where(
            and(
              eq(invitations.email, email),
              eq(invitations.workspaceId, workspace.id),
              eq(invitations.expired, false)
            )
          )
          .limit(1),
      ])

      if (!plan) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Subscription not found" })
      }

      const { membersQuota, type } = plan

      if (workspace.members >= membersQuota!) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `You have reached the maximum number of members for ${capitalizeFirstLetter(type!)} plan`,
        })
      }

      if (!canInviteMembers) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to invite members to this workspace",
        })
      }

      if (invitedUser) {
        // Check if the user is already a member
        const [existingMember] = await trx
          .select()
          .from(workspaceMembers)
          .leftJoin(users, eq(workspaceMembers.userId, users.id))
          .where(
            and(
              eq(workspaceMembers.userId, invitedUser.id),
              eq(workspaceMembers.workspaceId, workspaceId)
            )
          )
          .limit(1)

        if (existingMember && existingMember.user) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `${existingMember.user.email} is already a member of this workspace`,
          })
        }
      }

      if (invitation && invitation.status === "accepted") {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Invitation already exists and was accepted",
        })
      }

      if (invitation && invitation.status === "rejected") {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Invitation already exists and was rejected",
        })
      }

      if (invitation) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Invitation already exists and is pending",
        })
      }

      // Create the invitation token
      const token = await generateUniqueToken()
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 24)

      if (!token) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error generating token" })
      }

      // Create the invitation
      const invitationUrl = `${BETTER_AUTH_URL_ENV}/invite/${token}?from=invitation`

      const [newInvitation] = await trx
        .insert(invitations)
        .values({
          email,
          workspaceId: workspace.id!,
          role: role as RoleTypesType,
          token,
          invitedBy,
          invitedByProfileImage: invitedByProfileImage ?? "",
          expiresAt,
        })
        .returning({ id: invitations.id })

      if (newInvitation) {
        await resend.emails.send({
          from: configuration.resend.email,
          to: email,
          subject: `Invitation to join the ${workspace.name} workspace | ${configuration.site.name}`,
          react: InvitationMail({
            email: email,
            workspaceName: workspace.name,
            logo: workspace.logo,
            invitedBy: user.name,
            invitedByImage: user.image ?? "",
            inviteString: invitationUrl,
          }),
        })
      }

      // Send the invitation email & Notify user if an user exists
      if (invitedUser) {
        await trx.insert(notifications).values({
          title: "Workspace Invitation",
          message: `You have been invited to join ${workspace.name}`,
          userId: invitedUser.id,
          link: invitationUrl,
          expiresAt: expiresAt,
          type: "invitation",
          identifier: newInvitation.id,
          accepted: false,
        })
      }
    })

    return {
      message: "Invitation sent successfully",
      description: "Please check email for the invitation link",
    }
  }),

  createBulk: protectedProcedure
    .input(
      z.object({
        emails: z.array(z.string().email()),
        workspaceId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx
      const { emails, workspaceId } = input

      await dbClient.transaction(async (trx) => {
        // Get workspace
        const [workspace] = await trx
          .select()
          .from(workspaces)
          .where(eq(workspaces.id, workspaceId))
          .limit(1)

        if (!workspace) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" })
        }

        const [{ plan }, canInviteMembers, members] = await Promise.all([
          // Get subscription
          getWorkspaceSubscriptionBySlug(workspace.slug),

          // Get permission
          hasPermission({
            userId: user.id,
            workspaceId: workspaceId,
            permissionName: PERMISSIONS.INVITE_MEMBERS,
          }),

          // Get members
          await trx
            .select()
            .from(workspaceMembers)
            .leftJoin(users, eq(workspaceMembers.userId, users.id))
            .where(eq(workspaceMembers.workspaceId, workspace.id)),
        ])

        if (!plan) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Subscription not found" })
        }

        const { membersQuota, type } = plan

        if (members.length >= membersQuota!) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `You have reached the maximum number of members for ${capitalizeFirstLetter(type!)} plan`,
          })
        }

        if (!canInviteMembers) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to invite members to this workspace",
          })
        }

        // Check if member already exists by email
        const existingMember = emails.some((email) =>
          members.some((member) => member.user?.email === email)
        )

        if (existingMember) {
          const existingMemberEmail = emails.find((email) =>
            members.some((member) => member.user?.email === email)
          )

          throw new TRPCError({
            code: "CONFLICT",
            message: `User ${existingMemberEmail} is already a member of this workspace`,
          })
        }

        for (const email of emails) {
          // Check if the invited user exists in the database
          const [invitedUserExist] = await trx
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1)

          if (invitedUserExist) {
            // Check if the user is already a member
            const [existingMember] = await trx
              .select()
              .from(workspaceMembers)
              .leftJoin(users, eq(workspaceMembers.userId, users.id))
              .where(
                and(
                  eq(workspaceMembers.userId, invitedUserExist.id),
                  eq(workspaceMembers.workspaceId, workspace.id)
                )
              )
              .limit(1)

            if (existingMember && existingMember.user) {
              throw new TRPCError({
                code: "CONFLICT",
                message: `${existingMember.user.email} is already a member of this workspace`,
              })
            }
          }

          // Check if the invitation exists
          const [invitation] = await trx
            .select()
            .from(invitations)
            .where(
              and(
                eq(invitations.email, email),
                eq(invitations.workspaceId, workspace.id),
                eq(invitations.expired, false)
              )
            )
            .limit(1)

          if (invitation) {
            throw new TRPCError({ code: "CONFLICT", message: "Invitation already exists" })
          }

          // Create the invitation token
          const token = await generateUniqueToken()
          const expiresAt = new Date()
          expiresAt.setHours(expiresAt.getHours() + 24)

          if (!token) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Error generating token",
            })
          }

          // Create the invitation
          const invitationUrl = `${process.env.NEXTAUTH_URL}/invite/${token}?from=invitation`

          const [newInvitation] = await trx
            .insert(invitations)
            .values({
              email,
              workspaceId: workspace.id!,
              role: "member",
              token,
              invitedBy: user.email,
              invitedByProfileImage: user.image ?? "",
              expiresAt,
            })
            .returning({ id: invitations.id })

          if (newInvitation) {
            const result = await resend.emails.send({
              from: configuration.resend.email,
              to: email,
              subject: `Invitation to join the ${workspace.name} workspace | ${configuration.site.name}`,
              react: InvitationMail({
                email: email,
                workspaceName: workspace.name,
                logo: workspace.logo,
                invitedBy: user.name,
                invitedByImage: user.image ?? "",
                inviteString: invitationUrl,
              }),
            })

            if (invitedUserExist && result.data) {
              await trx.insert(notifications).values({
                title: "Workspace Invitation",
                message: `You have been invited to join ${workspace.name}`,
                userId: invitedUserExist.id,
                link: invitationUrl,
                expiresAt: expiresAt,
                type: "invitation",
                identifier: newInvitation.id,
                accepted: false,
              })
            }

            if (result.error) {
              throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Error sending email" })
            }
          }
        }
      })

      return {
        message: "Invitations created successfully",
      }
    }),

  revoke: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        workspaceId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx
      const { email, workspaceId } = input

      await dbClient.transaction(async (trx) => {
        // Get workspace
        const [workspace] = await trx
          .select()
          .from(workspaces)
          .where(eq(workspaces.id, workspaceId))
          .limit(1)

        if (!workspace) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Workspace not found" })
        }

        const [[invitation], canRevokeInvitations] = await Promise.all([
          // Get invitation object
          await trx
            .select()
            .from(invitations)
            .where(and(eq(invitations.workspaceId, workspaceId), eq(invitations.email, email)))
            .limit(1),

          // Get permission
          hasPermission({
            userId: user.id,
            workspaceId: workspace.id,
            permissionName: PERMISSIONS.DELETE_MEMBERS,
          }),
        ])

        if (!invitation) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Invitation not found" })
        }

        if (!canRevokeInvitations) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to delete invitations",
          })
        }

        // Delete the invitation object
        await trx.delete(invitations).where(eq(invitations.id, invitation.id))

        // Check for notification object
        const [notification] = await trx
          .select()
          .from(notifications)
          .where(eq(notifications.identifier, invitation.id))
          .limit(1)

        if (notification) {
          await trx.delete(notifications).where(eq(notifications.identifier, invitation.id))
        }
      })

      return {
        message: "Invitation revoked successfully",
      }
    }),

  decline: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const { id } = input

      // Get invitation object
      const [invitation] = await db
        .select()
        .from(invitations)
        .where(eq(invitations.id, id))
        .limit(1)

      if (!invitation) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invitation not found" })
      }

      await db
        .update(invitations)
        .set({ status: "rejected", updatedAt: new Date() })
        .where(eq(invitations.id, id))

      return {
        message: "Invitation deleted successfully",
      }
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const { id } = input

      // Get invitation object
      const [invitation] = await db
        .select()
        .from(invitations)
        .where(eq(invitations.id, id))
        .limit(1)

      if (!invitation) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invitation not found" })
      }

      await db.delete(invitations).where(eq(invitations.id, id))

      return {
        message: "Invitation deleted successfully",
      }
    }),
})
