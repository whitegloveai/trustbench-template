"use client"

import { Suspense } from "react"
import { WorkspaceType } from "@/server/db/schema-types"
import { trpc } from "@/trpc/client"
import { ErrorBoundary } from "react-error-boundary"

import { CreateItemButton } from "@/components/buttons/create-item-button"
import { Alert } from "@/components/global/alert"
import { Icons } from "@/components/global/icons"
import { ItemsGridItem, ItemsGridItemSkeleton } from "@/components/item/items-grid-item"

type ItemsGridProps = {
  slug: WorkspaceType["slug"]
}

export function ItemsGrid({ slug }: ItemsGridProps) {
  return (
    <Suspense fallback={<ItemsGridSkeleton />}>
      <ErrorBoundary
        fallbackRender={({ error }) => (
          <Alert
            variant="error"
            title={error.message || "An error occurred"}
            icon="alertTriangle"
          />
        )}
      >
        <ItemsGridSuspense slug={slug} />
      </ErrorBoundary>
    </Suspense>
  )
}

function ItemsGridSuspense({ slug }: ItemsGridProps) {
  const [data] = trpc.items.getMany.useSuspenseQuery({ slug })

  if (!data.length) {
    return (
      <div className="flex h-full min-h-svh flex-col items-center justify-center gap-y-6">
        <span className="bg-card flex size-24 items-center justify-center rounded-full border">
          <Icons.blocks className="text-muted-foreground size-12" />
        </span>
        <div className="flex flex-col items-center justify-center gap-y-2">
          <span className="font-semibold">No items</span>
          <p className="text-muted-foreground w-[30ch] text-center text-sm">
            We couldn&apos;t find any requests. Please check back again later.
          </p>
        </div>
        <CreateItemButton variant="default" size="sm" />
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-4">
        {data.map((item) => (
          <ItemsGridItem key={item.id} item={item} slug={slug} />
        ))}
      </div>
    </div>
  )
}

export function ItemsGridSkeleton() {
  return (
    <div className="flex flex-row flex-wrap gap-4">
      <ItemsGridItemSkeleton />
      <ItemsGridItemSkeleton />
      <ItemsGridItemSkeleton />
    </div>
  )
}
