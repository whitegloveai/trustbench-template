import { ComponentProps } from "react"
import Link from "next/link"
import { db } from "@/server/db/config/database"
import { WorkspaceType } from "@/server/db/schema-types"
import { items, workspaces } from "@/server/db/schemas"
import { formatDistanceToNow } from "date-fns"
import { desc, eq } from "drizzle-orm"

import { TagType } from "@/types/types"
import { createRoute } from "@/lib/routes"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

type AnalyticsItemGridProps = { slug: WorkspaceType["slug"] } & ComponentProps<
  typeof Card
>

export async function AnalyticsItemGrid({
  slug,
  className,
}: AnalyticsItemGridProps) {
  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.slug, slug))
    .limit(1)

  if (!workspace) return null

  const dbItems = await db
    .select()
    .from(items)
    .where(eq(items.workspaceId, workspace.id))
    .orderBy(desc(items.createdAt))

  return (
    <Card className={cn("flex h-72 w-full flex-col", className)}>
      <CardHeader>
        <CardTitle className="text-sm">Items</CardTitle>
        <CardDescription className="text-xs">
          Latest items in workspace
        </CardDescription>
      </CardHeader>
      <ScrollArea className="max-h-72 flex-1">
        <CardContent className="flex h-20 flex-col gap-x-2 p-0 pb-2">
          {dbItems.length ? (
            dbItems.map((item) => (
              <Link
                key={item.id}
                href={createRoute("item", { id: item.id, slug: slug }).href}
              >
                <div className="hover:bg-muted flex cursor-pointer items-center justify-between gap-x-2 px-6 py-2">
                  <div className="grid min-w-fit gap-y-1">
                    <span className="max-w-72 truncate text-sm">
                      {item.name}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {formatDistanceToNow(new Date(item.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  <div className="text-muted-foreground flex items-center gap-x-2 text-sm">
                    {(item.tags as TagType[]).slice(0, 4).map((tag) => (
                      <Badge key={tag.value} variant={"secondary"}>
                        {tag.label}
                      </Badge>
                    ))}
                    {(item.tags as TagType[]).length > 4 && (
                      <Badge variant="secondary">
                        +{(item.tags as TagType[]).length - 6} more
                      </Badge>
                    )}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-muted-foreground flex h-full items-start justify-start px-6 py-2 text-sm">
              No items
            </div>
          )}
        </CardContent>
      </ScrollArea>
    </Card>
  )
}

export function AnalyticsItemGridSkeleton() {
  return (
    <Card className="flex h-72 w-full flex-col">
      <CardHeader>
        <CardTitle className="text-sm">Items</CardTitle>
        <CardDescription className="text-xs">
          Latest items in workspace
        </CardDescription>
      </CardHeader>
      <ScrollArea className="max-h-72 flex-1">
        <CardContent className="flex flex-col gap-2 p-0 px-6 pb-2">
          <Skeleton className="h-7 w-full" />
          <Skeleton className="h-7 w-full" />
          <Skeleton className="h-7 w-full" />
          <Skeleton className="h-7 w-full" />
        </CardContent>
      </ScrollArea>
    </Card>
  )
}
