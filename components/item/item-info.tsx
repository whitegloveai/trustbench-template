"use client"

import { Suspense } from "react"
import { notFound } from "next/navigation"
import { ItemType } from "@/server/db/schema-types"
import { trpc } from "@/trpc/client"
import { format } from "date-fns"
import { ErrorBoundary } from "react-error-boundary"

import { Badge } from "@/components/ui/badge"
import { Alert } from "@/components/global/alert"

type ItemInfoProps = {
  id: ItemType["id"]
}

export function ItemInfo({ id }: ItemInfoProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorBoundary
        fallbackRender={({ error }) => (
          <Alert
            variant="error"
            title={error.message || "An error occurred"}
            icon="alertTriangle"
          />
        )}
      >
        <ItemInfoSuspense id={id} />
      </ErrorBoundary>
    </Suspense>
  )
}

function ItemInfoSuspense({ id }: ItemInfoProps) {
  const [data] = trpc.items.getOne.useSuspenseQuery({ id })

  if (!data) {
    return notFound()
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 rounded-lg p-4">
      <div>
        <h4 className="text-lg font-semibold">{data.name}</h4>
        <p className="text-muted-foreground text-sm">{data.description}</p>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row flex-wrap items-center gap-2">
          {Array.isArray(data.tags) &&
            data.tags.length > 0 &&
            data.tags.map((tag: { value: string; label: string }) => (
              <Badge key={tag.value} variant="outline">
                {tag.label}
              </Badge>
            ))}
        </div>
        <div>
          <div className="text-muted-foreground text-sm">Status: {data.status}</div>
          <div className="text-muted-foreground text-sm">
            {data.dueDate ? format(data.dueDate, "PPP") : "No due date"}
          </div>
        </div>
      </div>
    </div>
  )
}
