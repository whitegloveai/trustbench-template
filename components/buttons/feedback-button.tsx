"use client"

import { useCreateFeedbackModal } from "@/hooks/use-create-feedback-modal"
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { Icons } from "@/components/global/icons"

export function FeedbackButton() {
  const { setIsOpen } = useCreateFeedbackModal()

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={"Feedback"}
        className="group/item group-data-[collapsible=icon]:p-0!"
        onClick={() => setIsOpen(true)}
      >
        <Icons.send className="text-muted-foreground size-4 shrink-0 translate-x-0.5 transition-transform duration-300 group-hover/item:rotate-12 group-data-[collapsible=icon]:ml-[5px]" />
        <span className="group-data-[collapsible=icon]:sr-only">Feedback</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}
