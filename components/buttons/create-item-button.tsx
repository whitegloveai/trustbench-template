"use client"

import { ComponentProps } from "react"

import { KEYBOARD_SHORTCUTS } from "@/lib/shortcuts"
import { useCreateItemModal } from "@/hooks/use-create-item-modal"
import { useKeyPress } from "@/hooks/use-key-press"
import { Button } from "@/components/ui/button"
import { SidebarMenuButton } from "@/components/ui/sidebar"
import { ActionTooltip } from "@/components/global/action-tooltip"
import { Icons } from "@/components/global/icons"
import { KeyboardShortcut } from "@/components/global/keyboard-shortcut"

type CreateItemButtonProps = {
  type?: "default" | "sidebar" | "sidebar-header"
  variant?: ComponentProps<typeof Button>["variant"]
  className?: ComponentProps<typeof Button>["className"]
  size?: ComponentProps<typeof Button>["size"]
}

export function CreateItemButton({ type = "default", ...props }: CreateItemButtonProps) {
  const { open } = useCreateItemModal()

  useKeyPress(KEYBOARD_SHORTCUTS.CREATE_ITEM, open)

  const handleOpen = () => {
    open()
  }

  if (type === "sidebar") {
    return (
      <SidebarMenuButton
        variant={"outline"}
        className="bg-os-background-100 data-[active=false]:border-border hidden w-full justify-center group-data-[collapsible=icon]:flex"
        tooltip={"New Item"}
        onClick={handleOpen}
      >
        <Icons.plus className="group-data-[collapsible=icon]:block" />
        <span className="sr-only">New Item</span>
      </SidebarMenuButton>
    )
  }

  if (type === "sidebar-header") {
    return (
      <ActionTooltip
        delayDuration={400}
        label=""
        content={
          <div className="flex items-center gap-x-2">
            Create item
            <KeyboardShortcut shortcut={KEYBOARD_SHORTCUTS.CREATE_ITEM} />
          </div>
        }
      >
        <Button
          size={"icon"}
          variant={"outline"}
          className="bg-muted/40 dark:bg-background size-8 max-w-8 min-w-8 rounded-xl group-data-[collapsible=icon]:hidden"
          onClick={handleOpen}
        >
          <Icons.edit className="size-4" />
          <span className="sr-only">Create item</span>
        </Button>
      </ActionTooltip>
    )
  }

  return (
    <Button variant={"outline"} onClick={handleOpen} {...props}>
      <Icons.plus />
      New Item
    </Button>
  )
}
