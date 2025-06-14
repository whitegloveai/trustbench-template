"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useTheme } from "next-themes"

import { createRoute } from "@/lib/routes"
import { useCreateFeedbackModal } from "@/hooks/use-create-feedback-modal"
import { useCreateItemModal } from "@/hooks/use-create-item-modal"
import { useCreateWorkspaceModal } from "@/hooks/use-create-workspace-modal"
import { useKeyPress } from "@/hooks/use-key-press"
import { useOS } from "@/hooks/use-os"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { SidebarMenuButton } from "@/components/ui/sidebar"
import { Icons } from "@/components/global/icons"

export function Search() {
  const params = useParams()
  const slug = params.slug as string
  const [open, setOpen] = useState(false)
  const { setTheme } = useTheme()

  const os = useOS()

  const { open: openCreateItemModal } = useCreateItemModal()
  const { open: openCreateWorkspaceModal } = useCreateWorkspaceModal()
  const { open: openCreateFeedbackModal } = useCreateFeedbackModal()

  const createModalHandler = (modalOpener: () => void) => () => {
    modalOpener()
    setOpen(false)
  }

  const handleCreateItem = createModalHandler(openCreateItemModal)
  const handleCreateWorkspace = createModalHandler(openCreateWorkspaceModal)
  const handleSendFeedback = createModalHandler(openCreateFeedbackModal)

  useKeyPress("k", () => setOpen(true), {
    metaKey: os === "mac",
    ctrlKey: os !== "mac",
  })

  return (
    <>
      <SidebarMenuButton
        className="text-muted-foreground relative size-8 max-w-8 min-w-8"
        onClick={() => setOpen(true)}
        tooltip={"Search"}
      >
        <Icons.search />
        <span className="sr-only">Search</span>
      </SidebarMenuButton>
      <CommandDialog open={open} onOpenChange={setOpen} className="md:min-w-2xl" title="Search">
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem onSelect={handleCreateItem}>
              <Icons.plus />
              <span>New item</span>
            </CommandItem>
            <CommandItem onSelect={handleCreateWorkspace}>
              <Icons.plus />
              <span>New Workspace</span>
            </CommandItem>
            <CommandItem onSelect={handleSendFeedback}>
              <Icons.send />
              <span>Send feedback</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem asChild>
              <Link href={createRoute("settings-profile", { slug }).href}>
                <Icons.user />
                <span>Profile</span>
              </Link>
            </CommandItem>
            <CommandItem asChild>
              <Link href={createRoute("settings-billing", { slug }).href}>
                <Icons.creditCard />
                <span>Billing</span>
              </Link>
            </CommandItem>
            <CommandItem asChild>
              <Link href={createRoute("settings-workspace", { slug }).href}>
                <Icons.settings />
                <span>Workspace settings</span>
              </Link>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Theme">
            <CommandItem onSelect={() => setTheme("light")}>
              <Icons.sun />
              <span>Light</span>
            </CommandItem>
            <CommandItem onSelect={() => setTheme("dark")}>
              <Icons.moon />
              <span>Dark</span>
            </CommandItem>
            <CommandItem onSelect={() => setTheme("system")}>
              <Icons.laptop />
              <span>System</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
