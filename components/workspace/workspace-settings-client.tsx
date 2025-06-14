"use client"

import { Suspense } from "react"
import { notFound } from "next/navigation"
import { WorkspaceType } from "@/server/db/schema-types"
import { trpc } from "@/trpc/client"
import { ErrorBoundary } from "react-error-boundary"

import { PlanType } from "@/types/types"
import { redirectToRoute } from "@/lib/routes"
import { Alert } from "@/components/global/alert"
import { WorkspaceCard, WorkspaceCardSkeleton } from "@/components/workspace/workspace-card"
import {
  WorkspaceDangerZone,
  WorkspaceDangerZoneSkeleton,
} from "@/components/workspace/workspace-danger-zone"

type WorkspaceSettingsClientProps = {
  slug: WorkspaceType["slug"]
}

export function WorkspaceSettingsClient({ slug }: WorkspaceSettingsClientProps) {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl space-y-4">
          <WorkspaceCardSkeleton />
          <WorkspaceDangerZoneSkeleton />
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
        <WorkspaceSettingsClientSuspense slug={slug} />
      </ErrorBoundary>
    </Suspense>
  )
}

function WorkspaceSettingsClientSuspense({ slug }: WorkspaceSettingsClientProps) {
  const [data] = trpc.workspaces.getOne.useSuspenseQuery({ slug })

  const { canEdit, isOwner, subscription, user, workspace } = data

  if (!user) {
    return redirectToRoute("sign-in")
  }

  if (!workspace) {
    return notFound()
  }

  return (
    <div className="max-w-2xl space-y-4">
      <WorkspaceCard
        canEdit={canEdit}
        workspace={workspace}
        plan={subscription.planType as PlanType}
        isOwner={isOwner}
        owner={workspace.owner!}
      />

      <WorkspaceDangerZone
        slug={slug}
        action={canEdit ? "delete" : "leave"}
        id={workspace.id}
        owner={workspace.owner!}
        isOwner={isOwner}
      />
    </div>
  )
}
