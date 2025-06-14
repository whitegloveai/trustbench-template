"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { WorkspaceType } from "@/server/db/schema-types"
import { Check } from "lucide-react"

import { cn, isRouteActive } from "@/lib/utils"
import { useKeyPress } from "@/hooks/use-key-press"
import { DropdownMenuItem, DropdownMenuShortcut } from "@/components/ui/dropdown-menu"
import { LogoBadge } from "@/components/global/logo-badge"

type WorkspaceSwitcherItemProps = {
  item: WorkspaceType | null
  index: number
  status?: "active" | "inactive"
}

export function WorkspaceSwitcherItem({
  item,
  index,
  status = "active",
}: WorkspaceSwitcherItemProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handlePush = () => {
    router.push(workspacePath)
  }

  useKeyPress(`${index + 1}`, handlePush, { metaKey: true })

  if (!item) return null

  // Get the current path segments and replace the slug
  const workspacePath = pathname
    .split("/")
    .map((segment, i) => (i === 1 ? item.slug : segment))
    .join("/")

  const isActive = isRouteActive(workspacePath, pathname, 1)

  return (
    <Link
      href={status === "active" ? workspacePath : ""}
      className={cn("", {
        "cursor-default": status === "inactive",
      })}
    >
      <DropdownMenuItem
        className={cn("cursor-pointer justify-between", {
          "bg-accent/50": isActive,
          "cursor-default": status === "inactive",
        })}
        disabled={status === "inactive"}
      >
        <LogoBadge size="md" value={item} maxChars={15} borderRadius="sm" />
        <div className="flex items-center gap-x-2">
          {isActive ? <Check className="text-primary size-4" /> : null}
          <DropdownMenuShortcut className="min-w-fit self-center">
            ⌘ {index + 1}
          </DropdownMenuShortcut>
        </div>
      </DropdownMenuItem>
    </Link>
  )
}
