"use client"

import { useParams } from "next/navigation"
import { ItemType } from "@/server/db/schema-types"
import { useDeleteItemTRPC, useDuplicateItemTRPC } from "@/trpc/hooks/items-hooks"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Icons } from "@/components/global/icons"

type ItemActionsProps = {
  id: ItemType["id"]
  className?: string
}

export function ItemActions({ id, className }: ItemActionsProps) {
  const params = useParams()
  const slug = params.slug as string
  const { mutate: deleteItem, isPending: isDeletingItem } = useDeleteItemTRPC()
  const { mutate: duplicateItem, isPending: isDuplicatingItem } = useDuplicateItemTRPC()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size={"icon"} variant={"ghost"} className={cn("size-8", className)}>
          <Icons.actions className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="start" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuLabel className="sr-only">Item Actions</DropdownMenuLabel>
        <DropdownMenuItem>
          <Icons.edit className="text-muted-foreground" />
          Edit
          {/* <DropdownMenuShortcut>E</DropdownMenuShortcut> */}
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={isDuplicatingItem}
          onClick={(e) => {
            e.preventDefault()
            duplicateItem({ id, slug })
          }}
          className="font-medium"
        >
          <Icons.copy className="text-muted-foreground stroke-2" />
          Duplicate
          {/* <div className="text-primary ml-auto flex items-center gap-1">
            <DropdownMenuShortcut>⌘</DropdownMenuShortcut>
            <DropdownMenuShortcut>D</DropdownMenuShortcut>
          </div> */}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => deleteItem({ id, slug })}
          disabled={isDeletingItem}
          className="focus:text-destructive text-destructive font-medium hover:cursor-pointer"
        >
          <Icons.trash className="text-destructive mr-2 size-4 stroke-2" />
          Delete
          {/* <div className="ml-auto flex items-center gap-1 text-primary">
            <DropdownMenuShortcut>⌘</DropdownMenuShortcut>
            <DropdownMenuShortcut>E</DropdownMenuShortcut>
          </div> */}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
