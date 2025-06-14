import { notFound, redirect } from "next/navigation"
import { db } from "@/server/db/config/database"
import { WorkspaceType } from "@/server/db/schema-types"
import { userSettings, workspaces } from "@/server/db/schemas"
import { getCurrentUser } from "@/server/queries/auth-queries"
import { eq } from "drizzle-orm"

import { createRoute, redirectToRoute } from "@/lib/routes"
import { RestrictedContent } from "@/components/global/restricted-content"

type PermissionProviderProps = {
  slug: WorkspaceType["slug"]
  children: React.ReactNode
}

export async function PermissionProvider({ slug, children }: PermissionProviderProps) {
  const { user } = await getCurrentUser()

  if (!user) {
    return redirect(createRoute("sign-in").href)
  }

  const [[settings], workspace] = await Promise.all([
    db
      .select({
        onboardingStatus: userSettings.onboardingStatus,
      })
      .from(userSettings)
      .where(eq(userSettings.userId, user.id))
      .limit(1),
    db.query.workspaces.findFirst({
      where: eq(workspaces.slug, slug),
      with: {
        members: {
          columns: {
            userId: true,
            status: true,
          },
        },
      },
    }),
  ])

  // Redirect to onboarding if not completed
  if (!settings || settings.onboardingStatus !== "completed") {
    return redirectToRoute("onboarding")
  }

  if (!workspace) {
    return notFound()
  }

  if (!workspace.members.some((member) => member.userId === user.id)) {
    return (
      <RestrictedContent
        title="Unauthorized"
        description="You are not authorized to access this workspace."
        ctaText="Return"
      />
    )
  }

  if (
    !workspace.members.some((member) => member.userId === user.id && member.status !== "inactive")
  ) {
    return (
      <RestrictedContent
        title="Subscription Plan Expired"
        description="You are a member of this workspace. However, the Workspace's subscription has expired."
        ctaText="Return"
      />
    )
  }

  return children
}
