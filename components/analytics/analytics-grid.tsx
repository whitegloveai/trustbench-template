import { notFound } from "next/navigation"
import { db } from "@/server/db/config/database"
import { WorkspaceType } from "@/server/db/schema-types"
import { workspaces } from "@/server/db/schemas"
import { eq } from "drizzle-orm"

import {
  AnalyticsGridItem,
  AnalyticsGridItemSkeleton,
} from "@/components/analytics/analytics-grid-item"

type AnalyticsGridProps = {
  slug: WorkspaceType["slug"]
}

export async function AnalyticsGrid({ slug }: AnalyticsGridProps) {
  const workspaceDetails = await db.query.workspaces.findFirst({
    where: eq(workspaces.slug, slug),
    with: {
      members: true,
      items: true,
    },
  })

  if (!workspaceDetails) {
    return notFound()
  }

  const { items, members } = workspaceDetails

  return (
    <div className="grid grid-cols-3 gap-x-4">
      <AnalyticsGridItem title="Total items" number={items.length} />
      <AnalyticsGridItem title="Total members" number={members.length} />
      <AnalyticsGridItem title="Total members" number={members.length} />
    </div>
  )
}

export function AnalyticsGridSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-x-4">
      <AnalyticsGridItemSkeleton />
      <AnalyticsGridItemSkeleton />
      <AnalyticsGridItemSkeleton />
    </div>
  )
}
