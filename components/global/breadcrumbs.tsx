import { WorkspaceType } from "@/server/db/schema-types"
import { HydrateClient, trpc } from "@/trpc/server"

import { KEYBOARD_SHORTCUTS } from "@/lib/shortcuts"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ActionTooltip } from "@/components/global/action-tooltip"
import { BreadCrumbList } from "@/components/global/bread-crumb-list"
import { KeyboardShortcut } from "@/components/global/keyboard-shortcut"
import { NotificationPopover } from "@/components/notification/notification-popover"

type BreadcrumbsProps = {
  slug: WorkspaceType["slug"]
}

export async function Breadcrumbs({ slug }: BreadcrumbsProps) {
  void trpc.notifications.getMany.prefetch()

  return (
    <header
      className="flex items-center justify-between px-4 py-2"
      aria-label="Navigation breadcrumbs"
    >
      <div className="flex h-full shrink-0 items-center gap-x-2">
        <ActionTooltip
          label="Toggle Sidebar"
          side="right"
          delayDuration={500}
          content={
            <div className="ml-3 flex items-center gap-x-1">
              <KeyboardShortcut shortcut={KEYBOARD_SHORTCUTS.COMMAND_KEY} />
              <KeyboardShortcut shortcut={KEYBOARD_SHORTCUTS.TOGGLE_SIDEBAR} />
            </div>
          }
        >
          <SidebarTrigger className="-ml-1" />
        </ActionTooltip>
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
        <BreadCrumbList />
      </div>
      <HydrateClient>
        <NotificationPopover slug={slug} />
      </HydrateClient>
    </header>
  )
}
