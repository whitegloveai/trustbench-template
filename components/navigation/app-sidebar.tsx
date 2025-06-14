import { HydrateClient, trpc } from "@/trpc/server"

import { RouteConfigType, ROUTES } from "@/lib/routes"
import { KEYBOARD_SHORTCUTS } from "@/lib/shortcuts"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { CreateItemButton } from "@/components/buttons/create-item-button"
import { FeedbackButton } from "@/components/buttons/feedback-button"
import { UserButton } from "@/components/buttons/user-button"
import { ActionTooltip } from "@/components/global/action-tooltip"
import { KeyboardShortcut } from "@/components/global/keyboard-shortcut"
import { Search } from "@/components/global/search"
import { NavCollapsible } from "@/components/navigation/nav-collapsible"
import { NavMain } from "@/components/navigation/nav-main"
import { WorkspaceSwitcher } from "@/components/workspace/workspace-switcher"

const dashboardRoutes: RouteConfigType[] = [ROUTES.dashboard, ROUTES.analytics, ROUTES.items]

const miscRoutes: RouteConfigType[] = [
  {
    name: "settings",
    path: "/settings/workspace",
    metadata: { title: "Settings" },
    metadataExtra: { name: "Settings", icon: "settings" },
  },
]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  slug: string
  navCollapsibleStates?: Record<string, boolean>
}

export function AppSidebar({ slug, navCollapsibleStates, ...props }: AppSidebarProps) {
  void trpc.subscriptions.getSubscription.prefetch()
  void trpc.workspaces.getSwitcher.prefetch({ slug })

  return (
    <Sidebar collapsible="icon" {...props} className="overflow-hidden border-transparent">
      <SidebarHeader className="flex flex-row items-center justify-between gap-x-2 group-data-[collapsible=icon]:flex-col">
        <HydrateClient>
          <WorkspaceSwitcher slug={slug} />
        </HydrateClient>
        <div className="flex flex-row items-center gap-x-2">
          <Search />
          <CreateItemButton type="sidebar-header" />
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-0 bg-transparent">
        <SidebarGroup className="hidden group-data-[collapsible=icon]:block">
          <SidebarMenu aria-label="New item button">
            <SidebarMenuItem aria-label="New item button">
              <CreateItemButton type="sidebar" />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <NavMain routes={dashboardRoutes} slug={slug} label="Main routes" />

        <NavCollapsible navCollapsibleStates={navCollapsibleStates} slug={slug} />

        <NavMain routes={miscRoutes} slug={slug} className="mt-auto" label="Misc routes">
          <FeedbackButton />
        </NavMain>
      </SidebarContent>

      <SidebarFooter>
        <SidebarGroup className="hidden px-0 group-data-[collapsible=icon]:block">
          <SidebarMenu>
            <ActionTooltip
              label="Toggle Sidebar"
              side="right"
              content={
                <div className="ml-3 flex items-center gap-x-1">
                  <KeyboardShortcut shortcut={KEYBOARD_SHORTCUTS.COMMAND_KEY} />
                  <KeyboardShortcut shortcut={KEYBOARD_SHORTCUTS.TOGGLE_SIDEBAR} />
                </div>
              }
            >
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <SidebarTrigger className="hidden group-data-[collapsible=icon]:block" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </ActionTooltip>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarMenu>
          <HydrateClient>
            <UserButton slug={slug} />
          </HydrateClient>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
