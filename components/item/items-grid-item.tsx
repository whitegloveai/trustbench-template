import { ComponentProps } from "react"
import Link from "next/link"
import { WorkspaceType } from "@/server/db/schema-types"
import { format } from "date-fns"

import { ItemWithCreatorType } from "@/types/types"
import { createRoute } from "@/lib/routes"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { UserAvatar } from "@/components/global/user-avatar"
import { ItemActions } from "@/components/item/item-actions"

type ItemsGridItemProps = {
  item: ItemWithCreatorType
  slug: WorkspaceType["slug"]
} & ComponentProps<typeof Card>

export function ItemsGridItem({ item, slug, className }: ItemsGridItemProps) {
  const href = createRoute("item", { id: item.id, slug }).href

  return (
    <Link prefetch href={href}>
      <Card
        className={cn(
          "hover:bg-card/70 relative flex h-64 w-48 flex-col overflow-hidden md:w-56",
          className
        )}
      >
        <ItemActions id={item.id} className="absolute top-2 right-2 z-10" />
        <CardHeader className="p-4">
          <CardTitle className="truncate pr-8 text-base">{item.name}</CardTitle>
          <CardDescription className="line-clamp-2 text-xs">{item.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex grow flex-col justify-between px-4">
          <div className="flex flex-row flex-wrap items-center gap-x-2">
            {Array.isArray(item.tags) &&
              item.tags.length > 0 &&
              item.tags.map((tag: { value: string; label: string }) => (
                <Badge key={tag.value} variant="outline">
                  {tag.label}
                </Badge>
              ))}
          </div>
        </CardContent>
        <CardFooter className="mt-auto flex flex-col items-start gap-y-2 p-4">
          {item.creator ? (
            <div className="flex items-center gap-x-2">
              <UserAvatar user={item.creator} size="xs" />
              <span className="text-muted-foreground text-xs">{item.creator.name}</span>
            </div>
          ) : null}

          <div className="text-muted-foreground flex items-center gap-x-2 text-xs">
            <div>Status: {item.status}</div>

            <div>{item.dueDate ? format(item.dueDate, "PPP") : "No due date"}</div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}

export function ItemsGridItemSkeleton() {
  return (
    <Card className="h-64 w-48 overflow-hidden md:w-56">
      <div className="flex flex-col gap-y-2 p-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    </Card>
  )
}
