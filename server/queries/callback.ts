import { db } from "@/server/db/config/database"
import { userSettings, workspaces } from "@/server/db/schemas"
import { asc, eq } from "drizzle-orm"

export async function getCallbackPageQuery(userId: string) {
  const [currentUserSettings, workspaceData] = await Promise.all([
    // Get user settings
    db
      .select({
        onboardingStatus: userSettings.onboardingStatus,
      })
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1)
      .then((results) => results[0]),

    // Get both owned and member workspaces in parallel
    Promise.all([
      // Get owned workspaces
      db
        .select()
        .from(workspaces)
        .orderBy(asc(workspaces.createdAt))
        .where(eq(workspaces.ownerId, userId)),

      // Get member workspaces
      db.query.workspaceMembers.findMany({
        where: (members, { and, eq, not, exists }) =>
          and(
            eq(members.userId, userId),
            not(
              exists(
                db
                  .select()
                  .from(workspaces)
                  .where(
                    and(eq(workspaces.id, members.workspaceId), eq(workspaces.ownerId, userId))
                  )
              )
            )
          ),

        with: {
          workspace: {
            columns: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: asc(workspaces.createdAt),
      }),
    ]),
  ])

  const [ownedWorkspaces, memberWorkspaces] = workspaceData
  const otherWorkspaces = memberWorkspaces.map((member) => member.workspace)

  const isNotOnboarded =
    !currentUserSettings || currentUserSettings.onboardingStatus !== "completed"

  return {
    ownedWorkspaces,
    memberWorkspaces: otherWorkspaces,
    isNotOnboarded,
  }
}
