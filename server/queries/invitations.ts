import { db, dbClient } from "@/server/db/config/database"
import { InvitationType, SettingsType, UserType, WorkspaceType } from "@/server/db/schema-types"
import {
  invitations,
  notifications,
  roles,
  users,
  userSettings,
  workspaceMembers,
  workspaces,
} from "@/server/db/schemas"
import { getCurrentUser } from "@/server/queries/auth-queries"
import { getWorkspaceSubscriptionBySlug } from "@/server/queries/subscriptions"
import { eq } from "drizzle-orm"

import { RoleTypesType } from "@/types/types"

type InvitePageResult =
  | { status: "not_found" }
  | { status: "expired"; invitation: InvitationType; workspace: WorkspaceType }
  | { status: "requires_plan"; invitation: InvitationType; workspace: WorkspaceType }
  | {
      status: "exceeds_quota"
      invitation: InvitationType
      workspace: WorkspaceType
    }
  | {
      status: "requires_signin"
      invitation: InvitationType
      workspace: WorkspaceType
    }
  | {
      status: "wrong_user"
      invitation: InvitationType
      workspace: WorkspaceType
      user: Pick<UserType, "id" | "name" | "email" | "image">
    }
  | {
      status: "ready"
      invitation: InvitationType
      workspace: WorkspaceType
      user: Pick<UserType, "id" | "name" | "email" | "image">
      dbUser: UserType
      settings: SettingsType
    }

export async function getInvitePageQuery({ token }: { token: string }): Promise<InvitePageResult> {
  const [invitationData] = await db
    .select({
      invitation: invitations,
      workspace: workspaces,
    })
    .from(invitations)
    .leftJoin(workspaces, eq(invitations.workspaceId, workspaces.id))
    .where(eq(invitations.token, token))
    .limit(1)

  if (!invitationData?.invitation || !invitationData?.workspace) {
    return { status: "not_found" }
  }

  const { invitation, workspace } = invitationData

  const [{ user }, [dbUser]] = await Promise.all([
    getCurrentUser(),
    db.select().from(users).where(eq(users.email, invitation.email)),
  ])

  if (user && (user.email !== invitation.email || dbUser.email !== invitation.email)) {
    return { status: "wrong_user", invitation, workspace, user }
  }

  if (invitation.expired) {
    return { status: "expired", invitation, workspace }
  }

  if (!user || !dbUser) {
    return { status: "requires_signin", invitation, workspace }
  }

  const { plan } = await getWorkspaceSubscriptionBySlug(workspace.slug)

  if (!plan) {
    return { status: "requires_plan", invitation, workspace }
  }

  const members = await db
    .select()
    .from(workspaceMembers)
    .where(eq(workspaceMembers.workspaceId, workspace.id))

  if (members.length >= plan.membersQuota) {
    return { status: "exceeds_quota", invitation, workspace }
  }

  const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, dbUser.id))

  return {
    status: "ready",
    invitation,
    workspace,
    user,
    dbUser,
    settings,
  }
}

export function acceptInvitation({
  invitationId,
  userId,
  workspaceId,
  role,
}: {
  invitationId: string
  userId: string
  workspaceId: string
  role: RoleTypesType
}) {
  return dbClient.transaction(async (trx) => {
    const [roleRecord] = await trx
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.name, role))
      .limit(1)

    const member = await trx
      .insert(workspaceMembers)
      .values({
        userId,
        workspaceId,
        roleId: roleRecord.id,
      })
      .returning()

    await trx
      .update(invitations)
      .set({ expired: true, expiresAt: new Date(), updatedAt: new Date(), status: "accepted" })
      .where(eq(invitations.id, invitationId))

    const [notification] = await trx
      .select()
      .from(notifications)
      .where(eq(notifications.identifier, invitationId))

    if (notification) {
      await trx
        .update(notifications)
        .set({
          read: true,
          expiresAt: new Date(),
          expired: true,
          accepted: true,
          updatedAt: new Date(),
        })
        .where(eq(notifications.id, notification.id))
    }

    return member
  })
}
