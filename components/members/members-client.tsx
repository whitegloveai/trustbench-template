"use client"

import { Suspense } from "react"
import { WorkspaceType } from "@/server/db/schema-types"
import { trpc } from "@/trpc/client"
import { ErrorBoundary } from "react-error-boundary"

import { PlanTypes } from "@/types/types"
import { redirectToRoute } from "@/lib/routes"
import { CreateInviteForm, CreateInviteFormSkeleton } from "@/components/forms/create-invite-form"
import { Alert } from "@/components/global/alert"
import { RestrictedContent } from "@/components/global/restricted-content"
import { UsageBanner, UsageBannerSkeleton } from "@/components/global/usage-banner"
import { invitationsColumns } from "@/components/invitation/invitations-columns"
import { membersColumns } from "@/components/members/members-columns"
import { MembersTable, MembersTableSkeleton } from "@/components/members/members-table"

type MembersClientProps = {
  slug: WorkspaceType["slug"]
}

export function MembersClient({ slug }: MembersClientProps) {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl space-y-10">
          <UsageBannerSkeleton />
          <CreateInviteFormSkeleton />
          <MembersTableSkeleton />
        </div>
      }
    >
      <ErrorBoundary
        fallbackRender={({ error }) => (
          <Alert
            variant="error"
            title={error.message || "An error occurred"}
            icon="alertTriangle"
          />
        )}
      >
        <MembersClientSuspense slug={slug} />
      </ErrorBoundary>
    </Suspense>
  )
}

function MembersClientSuspense({ slug }: MembersClientProps) {
  const [membersData] = trpc.members.getMany.useSuspenseQuery({ slug })
  const [invitationsData] = trpc.invitations.getMany.useSuspenseQuery({ slug })

  const { currentPlan, user, canManageMembers, exceededQuota, members, workspace } = membersData

  if (!user) {
    return redirectToRoute("sign-in")
  }

  if (!workspace) {
    return <RestrictedContent title="Workspace not found" className="h-fit" />
  }

  return (
    <div className="h-full max-w-2xl space-y-10">
      <UsageBanner usageLabel={`${currentPlan ? currentPlan.name : PlanTypes.FREE} Plan`}>
        <span className="text-xs font-semibold">
          Your team used {members.length} of <strong>{currentPlan?.membersQuota}</strong> included
          member seats available in your plan
        </span>
      </UsageBanner>
      {canManageMembers && (
        <CreateInviteForm
          workspaceId={workspace.id}
          currentUser={user}
          exceededQuota={exceededQuota}
        />
      )}

      <div className="space-y-2">
        <div className="space-y-4">
          <div className="grid gap-y-2">
            <span className="text-sm font-semibold">
              {canManageMembers ? "Manage " : null}
              Members
            </span>
            <p className="text-muted-foreground text-sm">
              Members have access to {canManageMembers ? "your" : "this"} workspace.
            </p>
          </div>
          <MembersTable
            columns={membersColumns({ currentUserId: user.id })}
            data={members}
            enablePagination
            enableSearch
          />
        </div>

        <div className="space-y-4">
          <div className="text-sm font-semibold">Pending invitations</div>
          <MembersTable columns={invitationsColumns()} data={invitationsData} />
        </div>
      </div>
    </div>
  )
}
